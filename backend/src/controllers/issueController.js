const Issue   = require("../models/Issue");
const User    = require("../models/User");
const path    = require("path");
const fs      = require("fs");
const { analyzeImage } = require("../services/aiService");
const { success, created, error, paginated } = require("../utils/apiResponse");
const { getFileUrl } = require("../middleware/upload");
const logger  = require("../utils/logger");

const DUPLICATE_RADIUS_METERS = 100; // same type within 100m = duplicate candidate

// ── Helper: find nearby duplicate ─────────────────────────────────────────
const findDuplicate = async (type, coords) => {
  if (!coords?.coordinates || coords.coordinates.every((c) => c === 0)) return null;
  return Issue.findOne({
    type,
    status: { $nin: ["Resolved", "Closed"] },
    isMerged: false,
    "location.coords": {
      $near: {
        $geometry:    coords,
        $maxDistance: DUPLICATE_RADIUS_METERS,
      },
    },
  });
};

// ── Create issue ───────────────────────────────────────────────────────────
exports.createIssue = async (req, res, next) => {
  try {
    // Daily limit check
    const user = await User.findById(req.user._id);
    if (!user.canReport()) {
      return error(res, `Daily report limit reached (${process.env.REPORT_DAILY_LIMIT || 3}/day). Try again tomorrow.`, 429);
    }

    const { type, description, notes, location } = req.body;
    const parsedLocation = typeof location === "string" ? JSON.parse(location) : (location || {});

    // Build photo array from uploaded files
    const photos = [];
    if (req.file) {
      photos.push({
        filename:     req.file.filename,
        originalName: req.file.originalname,
        path:         req.file.path,
        url:          getFileUrl(req, req.file.path),
        size:         req.file.size,
        mimetype:     req.file.mimetype,
      });
    } else if (req.files?.length) {
      req.files.forEach((f) => photos.push({
        filename: f.filename, originalName: f.originalname,
        path: f.path, url: getFileUrl(req, f.path),
        size: f.size, mimetype: f.mimetype,
      }));
    }

    // Run AI analysis if photo uploaded
    let aiAnalysis = null;
    if (photos.length > 0) {
      aiAnalysis = await analyzeImage(photos[0].path, photos[0].mimetype);
    }

    // Use AI type if available and caller didn't override
    const finalType = (aiAnalysis && aiAnalysis.type !== "unknown") ? aiAnalysis.type : type;

    // Duplicate detection
    const coords = parsedLocation?.coords || { type: "Point", coordinates: [0, 0] };
    const duplicate = await findDuplicate(finalType, coords);

    if (duplicate) {
      // Merge: add reporter + increment vote
      if (!duplicate.reporters.includes(req.user._id)) {
        duplicate.reporters.push(req.user._id);
        duplicate.reporterCount += 1;
        duplicate.votes += 1;
        duplicate.isMerged = true;
        await duplicate.save();
      }
      await user.incrementDailyReport();
      logger.info(`Issue merged into ${duplicate.issueId} by user ${req.user._id}`);
      return success(res, { merged: true, issue: duplicate }, `Duplicate detected. Your report was merged into ${duplicate.issueId}.`, 200);
    }

    // Create new issue
    const issue = await Issue.create({
      reporter:    req.user._id,
      type:        finalType,
      description: aiAnalysis?.description || description,
      notes,
      photos,
      aiAnalysis,
      location:    parsedLocation,
      priority:    aiAnalysis?.severity || "medium",
      reporters:   [req.user._id],
      statusHistory: [{ status: "New", note: "Issue filed by citizen", changedBy: req.user._id }],
    });

    // Update user
    await user.incrementDailyReport();
    await User.findByIdAndUpdate(req.user._id, { $push: { reportedIssues: issue._id } });

    logger.info(`Issue ${issue.issueId} created by ${req.user.email}`);

    return created(res, { issue }, `Issue ${issue.issueId} filed successfully. Routed to ${issue.department.label}.`);
  } catch (err) {
    next(err);
  }
};

// ── Get all issues (paginated, filtered) ──────────────────────────────────
exports.getIssues = async (req, res, next) => {
  try {
    const {
      page = 1, limit = 20,
      type, status, priority, ward,
      sortBy = "createdAt", order = "desc",
      search,
    } = req.query;

    const filter = { isMerged: false };
    if (type)     filter.type     = type;
    if (status)   filter.status   = status;
    if (priority) filter.priority = priority;
    if (ward)     filter["location.ward"] = { $regex: ward, $options: "i" };
    if (search)   filter.$or = [
      { description: { $regex: search, $options: "i" } },
      { "location.address": { $regex: search, $options: "i" } },
      { issueId: { $regex: search, $options: "i" } },
    ];

    const skip  = (page - 1) * limit;
    const sort  = { [sortBy]: order === "asc" ? 1 : -1 };
    const total = await Issue.countDocuments(filter);

    const issues = await Issue.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(Number(limit))
      .populate("reporter", "name email ward")
      .lean({ virtuals: true });

    return paginated(res, issues, total, page, limit, "Issues fetched.");
  } catch (err) {
    next(err);
  }
};

// ── Get single issue ───────────────────────────────────────────────────────
exports.getIssue = async (req, res, next) => {
  try {
    const issue = await Issue.findById(req.params.id)
      .populate("reporter", "name email ward")
      .populate("voters",   "name")
      .lean({ virtuals: true });

    if (!issue) return error(res, "Issue not found.", 404);
    return success(res, { issue }, "Issue fetched.");
  } catch (err) {
    next(err);
  }
};

// ── Update issue (officer/admin only) ─────────────────────────────────────
exports.updateIssue = async (req, res, next) => {
  try {
    const { status, priority, notes } = req.body;
    const issue = await Issue.findById(req.params.id);
    if (!issue) return error(res, "Issue not found.", 404);

    if (status && status !== issue.status) {
      issue.statusHistory.push({ status, note: notes || `Status changed to ${status}`, changedBy: req.user._id });
      issue.status = status;
      if (status === "Assigned")    issue.assignedAt = new Date();
      if (status === "Resolved")    issue.resolvedAt = new Date();
    }
    if (priority) issue.priority = priority;
    if (notes)    issue.notes    = notes;

    await issue.save();
    logger.info(`Issue ${issue.issueId} updated by ${req.user.email}`);
    return success(res, { issue }, "Issue updated.");
  } catch (err) {
    next(err);
  }
};

// ── Delete issue (admin only) ──────────────────────────────────────────────
exports.deleteIssue = async (req, res, next) => {
  try {
    const issue = await Issue.findById(req.params.id);
    if (!issue) return error(res, "Issue not found.", 404);

    // Remove uploaded photos
    issue.photos.forEach((p) => {
      if (fs.existsSync(p.path)) fs.unlinkSync(p.path);
    });

    await issue.deleteOne();
    logger.info(`Issue ${issue.issueId} deleted by ${req.user.email}`);
    return success(res, {}, "Issue deleted.");
  } catch (err) {
    next(err);
  }
};

// ── Vote on issue ──────────────────────────────────────────────────────────
exports.voteIssue = async (req, res, next) => {
  try {
    const issue = await Issue.findById(req.params.id);
    if (!issue) return error(res, "Issue not found.", 404);
    if (issue.status === "Resolved") return error(res, "Cannot vote on a resolved issue.", 400);

    const alreadyVoted = issue.voters.includes(req.user._id);
    if (alreadyVoted) {
      // Unvote
      issue.voters  = issue.voters.filter((v) => v.toString() !== req.user._id.toString());
      issue.votes   = Math.max(1, issue.votes - 1);
      await User.findByIdAndUpdate(req.user._id, { $pull: { votedIssues: issue._id } });
    } else {
      issue.voters.push(req.user._id);
      issue.votes += 1;
      await User.findByIdAndUpdate(req.user._id, { $push: { votedIssues: issue._id } });
    }

    await issue.save();
    return success(res, { votes: issue.votes, voted: !alreadyVoted, priority: issue.priority }, alreadyVoted ? "Vote removed." : "Vote added.");
  } catch (err) {
    next(err);
  }
};

// ── Get stats/dashboard summary ────────────────────────────────────────────
exports.getStats = async (req, res, next) => {
  try {
    const [total, byStatus, byType, byPriority, recentResolved] = await Promise.all([
      Issue.countDocuments(),
      Issue.aggregate([{ $group: { _id: "$status",   count: { $sum: 1 } } }]),
      Issue.aggregate([{ $group: { _id: "$type",     count: { $sum: 1 } } }]),
      Issue.aggregate([{ $group: { _id: "$priority", count: { $sum: 1 } } }]),
      Issue.find({ status: "Resolved" }).sort({ resolvedAt: -1 }).limit(5).select("issueId type location resolvedAt").lean(),
    ]);

    const toMap = (arr) => arr.reduce((acc, x) => { acc[x._id] = x.count; return acc; }, {});

    return success(res, {
      total,
      byStatus:   toMap(byStatus),
      byType:     toMap(byType),
      byPriority: toMap(byPriority),
      recentResolved,
    }, "Stats fetched.");
  } catch (err) {
    next(err);
  }
};

// ── Get issues near coords ─────────────────────────────────────────────────
exports.getNearbyIssues = async (req, res, next) => {
  try {
    const { lng, lat, radius = 1000 } = req.query;
    if (!lng || !lat) return error(res, "lng and lat query params required.", 400);

    const issues = await Issue.find({
      status: { $nin: ["Resolved", "Closed"] },
      "location.coords": {
        $near: {
          $geometry:    { type: "Point", coordinates: [parseFloat(lng), parseFloat(lat)] },
          $maxDistance: parseInt(radius),
        },
      },
    }).limit(50).populate("reporter", "name").lean({ virtuals: true });

    return success(res, { issues, count: issues.length }, "Nearby issues fetched.");
  } catch (err) {
    next(err);
  }
};

// ── Get my issues ──────────────────────────────────────────────────────────
exports.getMyIssues = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const filter = { reporter: req.user._id };
    const total  = await Issue.countDocuments(filter);
    const issues = await Issue.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .lean({ virtuals: true });

    return paginated(res, issues, total, page, limit, "Your issues fetched.");
  } catch (err) {
    next(err);
  }
};
