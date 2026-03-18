require("./setup");
const request  = require("supertest");
const mongoose = require("mongoose");
const app      = require("../src/app");
const User     = require("../src/models/User");

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI);
});

beforeEach(async () => {
  await User.deleteMany({});
});

describe("Auth — Register", () => {
  it("should register a new user and return tokens", async () => {
    const res = await request(app).post("/api/auth/register").send({
      name: "Test Citizen", email: "test@pune.gov", password: "password123",
    });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.accessToken).toBeDefined();
    expect(res.body.data.user.email).toBe("test@pune.gov");
    expect(res.body.data.user.password).toBeUndefined(); // never exposed
  });

  it("should reject duplicate email", async () => {
    await User.create({ name: "Existing", email: "dup@test.com", password: "pass123" });
    const res = await request(app).post("/api/auth/register").send({
      name: "Dup", email: "dup@test.com", password: "pass123",
    });
    expect(res.status).toBe(409);
  });

  it("should reject short password", async () => {
    const res = await request(app).post("/api/auth/register").send({
      name: "Short", email: "short@test.com", password: "12",
    });
    expect(res.status).toBe(400);
  });
});

describe("Auth — Login", () => {
  beforeEach(async () => {
    await request(app).post("/api/auth/register").send({
      name: "Login User", email: "login@test.com", password: "password123",
    });
  });

  it("should login with correct credentials", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: "login@test.com", password: "password123",
    });
    expect(res.status).toBe(200);
    expect(res.body.data.accessToken).toBeDefined();
  });

  it("should reject wrong password", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: "login@test.com", password: "wrongpassword",
    });
    expect(res.status).toBe(401);
  });

  it("should reject non-existent email", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: "nobody@test.com", password: "password123",
    });
    expect(res.status).toBe(401);
  });
});

describe("Auth — Protected routes", () => {
  let token;
  beforeEach(async () => {
    const res = await request(app).post("/api/auth/register").send({
      name: "Protected", email: "prot@test.com", password: "password123",
    });
    token = res.body.data.accessToken;
  });

  it("should fetch /me with valid token", async () => {
    const res = await request(app).get("/api/auth/me").set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data.user.email).toBe("prot@test.com");
  });

  it("should reject /me without token", async () => {
    const res = await request(app).get("/api/auth/me");
    expect(res.status).toBe(401);
  });

  it("should logout successfully", async () => {
    const res = await request(app).post("/api/auth/logout").set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
  });
});
