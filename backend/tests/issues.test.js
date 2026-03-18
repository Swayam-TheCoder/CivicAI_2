require("./setup");
const request  = require("supertest");
const mongoose = require("mongoose");
const app      = require("../src/app");
const User     = require("../src/models/User");
const Issue    = require("../src/models/Issue");

let citizenToken, officerToken, citizenId;

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI);
});

beforeEach(async () => {
  await User.deleteMany({});
  await Issue.deleteMany({});

  const citizen = await request(app).post("/api/auth/register").send({
    name: "Citizen", email: "citizen@test.com", password: "pass1234",
  });
  citizenToken = citizen.body.data.accessToken;
  citizenId    = citizen.body.data.user._id;

  // Manually create an officer
  const officer = await User.create({
    name: "Officer Patil", email: "officer@test.com",
    password: "pass1234", role: "officer",
  });
  const loginRes = await request(app).post("/api/auth/login").send({
    email: "officer@test.com", password: "pass1234",
  });
  officerToken = loginRes.body.data.accessToken;
});

describe("Issues — Create", () => {
  it("should create an issue (no photo)", async () => {
    const res = await request(app)
      .post("/api/issues")
      .set("Authorization", `Bearer ${citizenToken}`)
      .send({ type: "pothole", description: "Large pothole on MG Road", notes: "Near junction" });

    expect(res.status).toBe(201);
    expect(res.body.data.issue.type).toBe("pothole");
    expect(res.body.data.issue.issueId).toMatch(/^CIV-/);
    expect(res.body.data.issue.department.code).toBe("PWD-01");
  });

  it("should reject create without auth", async () => {
    const res = await request(app).post("/api/issues").send({ type: "garbage" });
    expect(res.status).toBe(401);
  });

  it("should reject invalid issue type", async () => {
    const res = await request(app)
      .post("/api/issues")
      .set("Authorization", `Bearer ${citizenToken}`)
      .send({ type: "dinosaur" });
    expect(res.status).toBe(400);
  });
});

describe("Issues — Read", () => {
  let issueId;
  beforeEach(async () => {
    const res = await request(app)
      .post("/api/issues")
      .set("Authorization", `Bearer ${citizenToken}`)
      .send({ type: "garbage", description: "Overflowing bin" });
    issueId = res.body.data.issue._id;
  });

  it("should list all issues (public)", async () => {
    const res = await request(app).get("/api/issues");
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    expect(res.body.pagination).toBeDefined();
  });

  it("should get single issue by ID", async () => {
    const res = await request(app).get(`/api/issues/${issueId}`);
    expect(res.status).toBe(200);
    expect(res.body.data.issue._id).toBe(issueId);
  });

  it("should filter issues by type", async () => {
    const res = await request(app).get("/api/issues?type=garbage");
    expect(res.status).toBe(200);
    res.body.data.forEach((i) => expect(i.type).toBe("garbage"));
  });

  it("should return stats", async () => {
    const res = await request(app).get("/api/issues/stats");
    expect(res.status).toBe(200);
    expect(res.body.data.total).toBeGreaterThanOrEqual(1);
    expect(res.body.data.byType).toBeDefined();
  });
});

describe("Issues — Vote", () => {
  let issueId;
  beforeEach(async () => {
    const res = await request(app)
      .post("/api/issues")
      .set("Authorization", `Bearer ${citizenToken}`)
      .send({ type: "streetlight", description: "Broken lamp" });
    issueId = res.body.data.issue._id;
  });

  it("should add vote", async () => {
    const res = await request(app)
      .post(`/api/issues/${issueId}/vote`)
      .set("Authorization", `Bearer ${citizenToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.voted).toBe(true);
    expect(res.body.data.votes).toBeGreaterThan(1);
  });

  it("should toggle vote on second call", async () => {
    await request(app).post(`/api/issues/${issueId}/vote`).set("Authorization", `Bearer ${citizenToken}`);
    const res = await request(app).post(`/api/issues/${issueId}/vote`).set("Authorization", `Bearer ${citizenToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.voted).toBe(false);
  });
});

describe("Issues — Update (officer)", () => {
  let issueId;
  beforeEach(async () => {
    const res = await request(app)
      .post("/api/issues")
      .set("Authorization", `Bearer ${citizenToken}`)
      .send({ type: "flooding", description: "Waterlogging" });
    issueId = res.body.data.issue._id;
  });

  it("should allow officer to update status", async () => {
    const res = await request(app)
      .patch(`/api/issues/${issueId}`)
      .set("Authorization", `Bearer ${officerToken}`)
      .send({ status: "Assigned", notes: "Team dispatched" });
    expect(res.status).toBe(200);
    expect(res.body.data.issue.status).toBe("Assigned");
  });

  it("should reject citizen updating status", async () => {
    const res = await request(app)
      .patch(`/api/issues/${issueId}`)
      .set("Authorization", `Bearer ${citizenToken}`)
      .send({ status: "Resolved" });
    expect(res.status).toBe(403);
  });
});

describe("Issues — My Reports", () => {
  it("should return only the user's own issues", async () => {
    await request(app)
      .post("/api/issues")
      .set("Authorization", `Bearer ${citizenToken}`)
      .send({ type: "graffiti", description: "Spray paint on wall" });

    const res = await request(app)
      .get("/api/issues/my/reports")
      .set("Authorization", `Bearer ${citizenToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.every((i) => i.reporter === citizenId || i.reporter?._id === citizenId)).toBeTruthy();
  });
});
