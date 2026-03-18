const mongoose = require("mongoose");

// Use a separate test DB
process.env.MONGO_URI         = "mongodb://localhost:27017/civicai_test";
process.env.JWT_SECRET        = "test_jwt_secret_key_1234567890";
process.env.JWT_REFRESH_SECRET = "test_refresh_secret_key_1234567890";
process.env.JWT_EXPIRES_IN    = "1h";
process.env.ANTHROPIC_API_KEY = "test_key";
process.env.REPORT_DAILY_LIMIT = "3";
process.env.NODE_ENV          = "test";

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
});
