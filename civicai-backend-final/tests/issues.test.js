require("./setup");
const request  = require("supertest");
const mongoose = require("mongoose");
const app      = require("../app");
const User     = require("../src/models/User");
const Issue    = require("../src/models/Issue");

let citizenToken, officerToken, citizenId;

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI);
});

beforeEach(async () => {
  await User.deleteMany({});
  await Issue.deleteMany({});

  const citizenRes = await request(app).post("/api/auth/register").send({
    name: "Citizen", email: "citizen@test.com", password: "pass1234",
  });
  citizenToken = citizenRes.body.data.accessToken;
  citizenId    = citizenRes.body.data.user._id;

  // Create officer directly in DB (no register endpoint sets role)
  await User.create({ name: "Officer", email: "officer@test.com", password: "pass1234", role: "officer" });
  const officerRes = await request(app).post("/api/auth/login").send({
    email: "officer@test.com", password: "pass1234",
  });
  officerToken = officerRes.body.data.accessToken;
});

describe("POST /api/issues", () => {
  it("creates an issue without a photo", async () => {
    const res = await request(app)
      .post("/api/issues")
      .set("Authorization", `Bearer ${citizenToken}`)
      .send({ type: "pothole", description: "Large pothole on MG Road" });

    expect(res.status).toBe(201);
    expect(res.body.data.issue.type).toBe("pothole");
    expect(res.body.data.issue.issueId).toMatch(/^CIV-/);
    expect(res.body.data.issue.department.code).toBe("PWD-01");
    expect(res.body.data.issue.status).toBe("New");
  });

  it("returns 401 without auth token", async () => {
    const res = await request(app).post("/api/issues").send({ type: "garbage" });
    expect(res.status).toBe(401);
  });

  it("returns 400 for invalid issue type", async () => {
    const res = await request(app)
      .post("/api/issues")
      .set("Authorization", `Bearer ${citizenToken}`)
      .send({ type: "dinosaur" });
    expect(res.status).toBe(400);
  });
});

describe("GET /api/issues", () => {
  beforeEach(async () => {
    await request(app)
      .post("/api/issues")
      .set("Authorization", `Bearer ${citizenToken}`)
      .send({ type: "garbage", description: "Overflowing bin on FC Road" });
  });

  it("returns paginated list (public access)", async () => {
    const res = await request(app).get("/api/issues");
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    expect(res.body.pagination).toBeDefined();
    expect(res.body.pagination.total).toBeGreaterThanOrEqual(1);
  });

  it("filters by type", async () => {
    const res = await request(app).get("/api/issues?type=garbage");
    expect(res.status).toBe(200);
    res.body.data.forEach((i) => expect(i.type).toBe("garbage"));
  });
});

describe("GET /api/issues/:id", () => {
  it("returns a single issue by ID", async () => {
    const create = await request(app)
      .post("/api/issues")
      .set("Authorization", `Bearer ${citizenToken}`)
      .send({ type: "streetlight", description: "Broken lamp" });

    const id  = create.body.data.issue._id;
    const res = await request(app).get(`/api/issues/${id}`);
    expect(res.status).toBe(200);
    expect(res.body.data.issue._id).toBe(id);
  });

  it("returns 400 for invalid ObjectId", async () => {
    const res = await request(app).get("/api/issues/not-an-id");
    expect(res.status).toBe(400);
  });
});

describe("GET /api/issues/stats", () => {
  it("returns stats object", async () => {
    await request(app)
      .post("/api/issues")
      .set("Authorization", `Bearer ${citizenToken}`)
      .send({ type: "pothole", description: "Stats test issue" });

    const res = await request(app).get("/api/issues/stats");
    expect(res.status).toBe(200);
    expect(res.body.data.total).toBeGreaterThanOrEqual(1);
    expect(res.body.data.byType).toBeDefined();
    expect(res.body.data.byStatus).toBeDefined();
  });
});

describe("GET /api/issues/my/reports", () => {
  it("returns only the authenticated user's issues", async () => {
    await request(app)
      .post("/api/issues")
      .set("Authorization", `Bearer ${citizenToken}`)
      .send({ type: "graffiti", description: "Spray paint on wall" });

    const res = await request(app)
      .get("/api/issues/my/reports")
      .set("Authorization", `Bearer ${citizenToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThanOrEqual(1);
  });

  it("returns 401 without auth", async () => {
    const res = await request(app).get("/api/issues/my/reports");
    expect(res.status).toBe(401);
  });
});

describe("POST /api/issues/:id/vote", () => {
  let issueId;
  beforeEach(async () => {
    const res = await request(app)
      .post("/api/issues")
      .set("Authorization", `Bearer ${citizenToken}`)
      .send({ type: "flooding", description: "Waterlogging near junction" });
    issueId = res.body.data.issue._id;
  });

  it("adds a vote and returns voted=true", async () => {
    const res = await request(app)
      .post(`/api/issues/${issueId}/vote`)
      .set("Authorization", `Bearer ${citizenToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.voted).toBe(true);
    expect(res.body.data.votes).toBeGreaterThan(1);
  });

  it("toggles vote off on second call", async () => {
    await request(app)
      .post(`/api/issues/${issueId}/vote`)
      .set("Authorization", `Bearer ${citizenToken}`);
    const res = await request(app)
      .post(`/api/issues/${issueId}/vote`)
      .set("Authorization", `Bearer ${citizenToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.voted).toBe(false);
  });
});

describe("PATCH /api/issues/:id (officer)", () => {
  let issueId;
  beforeEach(async () => {
    const res = await request(app)
      .post("/api/issues")
      .set("Authorization", `Bearer ${citizenToken}`)
      .send({ type: "pothole", description: "Update test issue" });
    issueId = res.body.data.issue._id;
  });

  it("allows officer to update status to Assigned", async () => {
    const res = await request(app)
      .patch(`/api/issues/${issueId}`)
      .set("Authorization", `Bearer ${officerToken}`)
      .send({ status: "Assigned", notes: "Team dispatched" });
    expect(res.status).toBe(200);
    expect(res.body.data.issue.status).toBe("Assigned");
  });

  it("returns 403 when citizen tries to update status", async () => {
    const res = await request(app)
      .patch(`/api/issues/${issueId}`)
      .set("Authorization", `Bearer ${citizenToken}`)
      .send({ status: "Resolved" });
    expect(res.status).toBe(403);
  });
});
