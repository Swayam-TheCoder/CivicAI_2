require("./setup");
const request  = require("supertest");
const mongoose = require("mongoose");
const app      = require("../app");
const User     = require("../src/models/User");

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI);
});

beforeEach(async () => {
  await User.deleteMany({});
});

describe("POST /api/auth/register", () => {
  it("registers a new user and returns tokens", async () => {
    const res = await request(app).post("/api/auth/register").send({
      name: "Test User", email: "test@civicai.com", password: "password123",
    });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.accessToken).toBeDefined();
    expect(res.body.data.user.email).toBe("test@civicai.com");
    expect(res.body.data.user.password).toBeUndefined();
  });

  it("rejects duplicate email with 409", async () => {
    await User.create({ name: "Existing", email: "dup@test.com", password: "pass123" });
    const res = await request(app).post("/api/auth/register").send({
      name: "Dup", email: "dup@test.com", password: "pass123",
    });
    expect(res.status).toBe(409);
  });

  it("rejects password shorter than 6 chars with 400", async () => {
    const res = await request(app).post("/api/auth/register").send({
      name: "Short", email: "short@test.com", password: "12",
    });
    expect(res.status).toBe(400);
  });

  it("rejects invalid email with 400", async () => {
    const res = await request(app).post("/api/auth/register").send({
      name: "Bad", email: "not-an-email", password: "password123",
    });
    expect(res.status).toBe(400);
  });
});

describe("POST /api/auth/login", () => {
  beforeEach(async () => {
    await request(app).post("/api/auth/register").send({
      name: "Login User", email: "login@test.com", password: "password123",
    });
  });

  it("logs in with correct credentials", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: "login@test.com", password: "password123",
    });
    expect(res.status).toBe(200);
    expect(res.body.data.accessToken).toBeDefined();
    expect(res.body.data.refreshToken).toBeDefined();
  });

  it("rejects wrong password with 401", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: "login@test.com", password: "wrongpassword",
    });
    expect(res.status).toBe(401);
  });

  it("rejects unknown email with 401", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: "nobody@test.com", password: "password123",
    });
    expect(res.status).toBe(401);
  });
});

describe("GET /api/auth/me", () => {
  let token;
  beforeEach(async () => {
    const res = await request(app).post("/api/auth/register").send({
      name: "Me User", email: "me@test.com", password: "password123",
    });
    token = res.body.data.accessToken;
  });

  it("returns current user profile with valid token", async () => {
    const res = await request(app).get("/api/auth/me")
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data.user.email).toBe("me@test.com");
  });

  it("returns 401 without token", async () => {
    const res = await request(app).get("/api/auth/me");
    expect(res.status).toBe(401);
  });

  it("returns 401 with invalid token", async () => {
    const res = await request(app).get("/api/auth/me")
      .set("Authorization", "Bearer invalid.token.here");
    expect(res.status).toBe(401);
  });
});

describe("POST /api/auth/logout", () => {
  it("logs out successfully", async () => {
    const reg = await request(app).post("/api/auth/register").send({
      name: "Logout User", email: "logout@test.com", password: "password123",
    });
    const res = await request(app).post("/api/auth/logout")
      .set("Authorization", `Bearer ${reg.body.data.accessToken}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
