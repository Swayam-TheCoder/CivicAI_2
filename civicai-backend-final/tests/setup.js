// Must run before any other test code — sets env before modules load
process.env.MONGO_URI          = "mongodb://localhost:27017/civicai_test";
process.env.JWT_SECRET         = "test_jwt_secret_at_least_32_chars_long";
process.env.JWT_REFRESH_SECRET = "test_refresh_secret_at_least_32_chars";
process.env.JWT_EXPIRES_IN     = "1h";
process.env.JWT_REFRESH_EXPIRES_IN = "1d";
process.env.ANTHROPIC_API_KEY  = "test_key_not_real";
process.env.REPORT_DAILY_LIMIT = "3";
process.env.NODE_ENV           = "test";
process.env.UPLOAD_DIR         = "uploads";

const mongoose = require("mongoose");

afterAll(async () => {
  await mongoose.connection.dropDatabase().catch(() => {});
  await mongoose.connection.close().catch(() => {});
});
