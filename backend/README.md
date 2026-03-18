# CivicAI Backend

**Node.js + Express + MongoDB** REST API for the CivicAI Smart Governance Platform.

---

## Stack

| Layer        | Technology                          |
|--------------|-------------------------------------|
| Runtime      | Node.js 18+                         |
| Framework    | Express 4                           |
| Database     | MongoDB + Mongoose                  |
| Auth         | JWT (access + refresh tokens)       |
| AI           | Anthropic Claude (claude-sonnet-4)  |
| File Upload  | Multer + Sharp                      |
| Validation   | express-validator                   |
| Security     | Helmet, CORS, mongo-sanitize, rate-limit |
| Logging      | Winston                             |
| Testing      | Jest + Supertest                    |

---

## Project Structure

```
civicai-backend/
├── src/
│   ├── config/
│   │   └── db.js                  # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js      # register, login, refresh, logout, me
│   │   ├── issueController.js     # CRUD, vote, stats, nearby, my-reports
│   │   ├── aiController.js        # standalone AI analysis endpoint
│   │   └── userController.js      # admin user management
│   ├── middleware/
│   │   ├── auth.js                # protect, restrict, optionalAuth
│   │   ├── errorHandler.js        # global error + 404 handler
│   │   ├── upload.js              # multer config, file helpers
│   │   ├── rateLimiter.js         # per-route rate limits
│   │   └── validators.js          # express-validator rules
│   ├── models/
│   │   ├── User.js                # user schema + bcrypt + daily limit
│   │   └── Issue.js               # issue schema + geo index + auto-routing
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── issueRoutes.js
│   │   ├── aiRoutes.js
│   │   └── userRoutes.js
│   ├── services/
│   │   └── aiService.js           # Claude vision analysis
│   ├── utils/
│   │   ├── apiResponse.js         # success / error / paginated helpers
│   │   ├── jwt.js                 # sign / verify tokens
│   │   └── logger.js              # Winston logger
│   ├── app.js                     # Express app setup
│   └── server.js                  # HTTP server + graceful shutdown
├── tests/
│   ├── setup.js                   # Jest + test DB config
│   ├── auth.test.js
│   └── issues.test.js
├── uploads/                       # auto-created, gitignored
├── logs/                          # auto-created, gitignored
├── .env.example
├── .gitignore
├── jest.config.js
└── package.json
```

---

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env — fill in MONGO_URI, JWT_SECRET, ANTHROPIC_API_KEY

# 3. Start development server
npm run dev

# 4. Run tests
npm test
```

---

## Environment Variables

| Variable               | Description                          | Example                          |
|------------------------|--------------------------------------|----------------------------------|
| `PORT`                 | Server port                          | `5000`                           |
| `NODE_ENV`             | Environment                          | `development`                    |
| `MONGO_URI`            | MongoDB connection string            | `mongodb://localhost:27017/civicai` |
| `JWT_SECRET`           | Access token secret (min 32 chars)   | `your-strong-secret`             |
| `JWT_EXPIRES_IN`       | Access token TTL                     | `7d`                             |
| `JWT_REFRESH_SECRET`   | Refresh token secret                 | `another-strong-secret`          |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token TTL                  | `30d`                            |
| `ANTHROPIC_API_KEY`    | Claude API key                       | `sk-ant-...`                     |
| `UPLOAD_DIR`           | Photo storage directory              | `uploads`                        |
| `MAX_FILE_SIZE_MB`     | Max upload size                      | `10`                             |
| `REPORT_DAILY_LIMIT`   | Max reports per user per day         | `3`                              |
| `CLIENT_URL`           | Frontend URL for CORS                | `http://localhost:3000`          |

---

## API Reference

### Base URL
```
http://localhost:5000/api
```

### Auth Endpoints

#### Register
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "Rahul Sharma",
  "email": "rahul@pune.in",
  "password": "securepass",
  "phone": "+91-9876543210",   // optional
  "ward": "Ward 12"            // optional
}
```
**Response 201:**
```json
{
  "success": true,
  "data": {
    "user": { "_id": "...", "name": "Rahul Sharma", "email": "rahul@pune.in", "role": "citizen" },
    "accessToken": "eyJ...",
    "refreshToken": "eyJ...",
    "expiresIn": "7d"
  }
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{ "email": "rahul@pune.in", "password": "securepass" }
```

#### Refresh Token
```http
POST /api/auth/refresh
Content-Type: application/json

{ "refreshToken": "eyJ..." }
```

#### Get Profile
```http
GET /api/auth/me
Authorization: Bearer <accessToken>
```

#### Logout
```http
POST /api/auth/logout
Authorization: Bearer <accessToken>
```

---

### Issue Endpoints

#### Create Issue (with photo upload)
```http
POST /api/issues
Authorization: Bearer <accessToken>
Content-Type: multipart/form-data

photo         : <image file>
type          : pothole | garbage | streetlight | flooding | graffiti | unknown
description   : "Large pothole near traffic signal"    (optional — AI fills this)
notes         : "Near junction, dangerous for bikes"   (optional)
location      : {"address":"MG Road","ward":"Ward 12","coords":{"type":"Point","coordinates":[73.856,18.520]}}
```
**Response 201:**
```json
{
  "success": true,
  "message": "Issue CIV-2025-0001 filed successfully. Routed to Roads & Infrastructure Dept.",
  "data": {
    "issue": {
      "issueId": "CIV-2025-0001",
      "type": "pothole",
      "status": "New",
      "priority": "high",
      "department": { "label": "Roads & Infrastructure Dept.", "code": "PWD-01", "officer": "Suresh Patil" },
      "aiAnalysis": {
        "type": "pothole",
        "confidence": 94,
        "severity": "high",
        "title": "Large Road Pothole Near Traffic Signal",
        "description": "A significant pothole detected on main road surface.",
        "action": "Roads department should dispatch repair crew within 48 hours.",
        "hazard": true
      },
      "photos": [{ "url": "http://localhost:5000/uploads/2025/06/uuid.jpg", "filename": "uuid.jpg" }],
      "votes": 1,
      "reporters": ["userId"],
      "reporterCount": 1,
      "createdAt": "2025-06-15T10:30:00.000Z"
    }
  }
}
```

> **Duplicate Detection:** If another issue of the same type exists within 100 metres, your report is **merged** into it (reporter count and vote count increment). Response includes `"merged": true`.

#### Create Issue (base64 — for web clients)
```http
POST /api/issues
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "type": "garbage",
  "description": "Overflowing bin",
  "location": { "address": "FC Road", "ward": "Ward 8" }
}
```
*(Photo can be sent separately to `/api/ai/analyze` first, then include `aiAnalysis` result.)*

#### List Issues
```http
GET /api/issues?page=1&limit=20&type=pothole&status=New&priority=high&ward=Ward+12&sortBy=votes&order=desc&search=pothole
```
Returns paginated list with `pagination` metadata.

#### Get Single Issue
```http
GET /api/issues/:id
```

#### Get My Reports
```http
GET /api/issues/my/reports
Authorization: Bearer <accessToken>
```

#### Vote / Unvote
```http
POST /api/issues/:id/vote
Authorization: Bearer <accessToken>
```
Toggles vote. Priority auto-escalates: 5 votes → medium, 12 → high, 25 → critical.

#### Update Issue Status (officer/admin)
```http
PATCH /api/issues/:id
Authorization: Bearer <accessToken>  (officer or admin role)
Content-Type: application/json

{
  "status": "Assigned",      // New | Assigned | In Progress | Resolved | Critical | Closed
  "priority": "high",        // optional
  "notes": "Team dispatched" // optional
}
```

#### Delete Issue (admin)
```http
DELETE /api/issues/:id
Authorization: Bearer <accessToken>  (admin role)
```

#### Dashboard Stats
```http
GET /api/issues/stats
```
```json
{
  "total": 142,
  "byStatus":   { "New": 45, "Assigned": 30, "In Progress": 28, "Resolved": 39 },
  "byType":     { "pothole": 52, "garbage": 38, "streetlight": 21, "flooding": 18, "graffiti": 13 },
  "byPriority": { "critical": 8, "high": 34, "medium": 67, "low": 33 },
  "recentResolved": [...]
}
```

#### Nearby Issues (geo)
```http
GET /api/issues/nearby?lng=73.856&lat=18.520&radius=500
```

---

### AI Analysis Endpoint

Analyse a photo **without** creating an issue — useful for the "preview before submit" flow in the frontend.

#### Analyse via file upload
```http
POST /api/ai/analyze
Authorization: Bearer <accessToken>
Content-Type: multipart/form-data

photo: <image file>
```

#### Analyse via base64
```http
POST /api/ai/analyze
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "imageBase64": "<base64 string>",
  "mimeType": "image/jpeg"
}
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "analysis": {
      "type": "pothole",
      "confidence": 92,
      "severity": "high",
      "title": "Dangerous Road Pothole Blocking Lane",
      "description": "A large pothole visible in the centre of the road lane.",
      "action": "Roads department should dispatch a repair team urgently.",
      "hazard": true,
      "photoUrl": "http://localhost:5000/uploads/2025/06/uuid.jpg",
      "model": "claude-sonnet-4-20250514",
      "analyzedAt": "2025-06-15T10:30:00.000Z"
    }
  }
}
```

---

### User Endpoints (admin only)

```http
GET    /api/users             # list all users (paginated)
GET    /api/users/:id         # get user + their issues
PATCH  /api/users/:id         # update role / ward / isActive
DELETE /api/users/:id         # delete user
```

---

## Error Response Format

All errors follow this shape:
```json
{
  "success": false,
  "message": "Human-readable error message",
  "errors": [...],           // validation errors array (optional)
  "timestamp": "2025-06-15T10:30:00.000Z"
}
```

| Code | Meaning                        |
|------|-------------------------------|
| 400  | Bad request / validation error |
| 401  | Unauthenticated                |
| 403  | Forbidden (wrong role)         |
| 404  | Resource not found             |
| 409  | Conflict (duplicate email)     |
| 429  | Rate limit / daily quota hit   |
| 500  | Internal server error          |

---

## Business Logic

### Daily Report Limit
- Each user can submit max **3 reports per day** (configurable via `REPORT_DAILY_LIMIT`).
- Counter resets at midnight. Tracked in `User.dailyReports { count, date }`.
- Returns HTTP **429** when exceeded.

### Duplicate Detection
- On every new report, the backend checks for an open issue of the **same type within 100 metres** (geospatial `$near` query).
- If found: the new reporter is added to `issue.reporters[]`, `reporterCount` and `votes` increment, `isMerged = true`.
- No duplicate issue document is created — saves DB space and groups community reports.

### Priority Auto-Escalation
- Triggered on every vote save:  
  `votes ≥ 5 → medium | ≥ 12 → high | ≥ 25 → critical`
- Also applied when AI detects `hazard: true` (severity = high minimum).

### Department Auto-Routing
- Issue `type` → department is resolved automatically on save via the `DEPARTMENTS` map in `Issue.js`.
- No manual assignment needed for initial routing.

### Status History Log
- Every status change is appended to `issue.statusHistory[]` with timestamp + officer reference.
- Provides full audit trail for governance accountability.

---

## Running Tests

```bash
# Run all tests
npm test

# With coverage
npm test -- --coverage

# Watch mode
npm test -- --watch
```

> Tests use a **separate** `civicai_test` database and mock the Anthropic API key.

---

## Connecting to the Frontend

Update your React app's API base URL:
```js
// In your frontend .env
VITE_API_URL=http://localhost:5000/api
```

Replace the direct Anthropic `fetch` call in the frontend with:
```js
// Before: calls Anthropic directly
const res = await fetch("https://api.anthropic.com/v1/messages", ...)

// After: calls your backend
const res = await fetch(`${import.meta.env.VITE_API_URL}/ai/analyze`, {
  method: "POST",
  headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
  body: JSON.stringify({ imageBase64: b64, mimeType: "image/jpeg" })
})
```
