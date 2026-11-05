# PULSE REST & WebSocket API Documentation

> **PULSE – Every Vote. Every Voice. In Real Time.**  
> Technical API Specification for HCL GUVI Assessment.

Base URL: `http://localhost:8080` (or configured `PORT`)  
WebSocket Endpoint: `ws://localhost:8080/ws/polls/:id`

---

## 1. System Endpoints

### `GET /api/health`
Health check for load balancers and container monitoring.
- **Response (200 OK):**
```json
{
  "status": "healthy",
  "platform": "PULSE – Real-Time Interactive Polling",
  "timestamp": "2026-11-03T10:15:00Z",
  "version": "1.0.0"
}
```

---

## 2. Authentication Endpoints

### `POST /api/auth/register`
Creates a new poll creator account.
- **Request Body:**
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "SecurePassword123!"
}
```
- **Response (201 Created):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "6724fa0e1234567890abcdef",
    "name": "Jane Doe",
    "email": "jane@example.com",
    "created_at": "2026-11-03T10:15:00Z"
  }
}
```

### `POST /api/auth/login`
Authenticates user and returns JWT token.
- **Request Body:**
```json
{
  "email": "jane@example.com",
  "password": "SecurePassword123!"
}
```
- **Response (200 OK):**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "6724fa0e1234567890abcdef",
    "name": "Jane Doe",
    "email": "jane@example.com"
  }
}
```

### `GET /api/auth/me`
Retrieves currently authenticated user profile.
- **Headers:** `Authorization: Bearer <JWT_TOKEN>`
- **Response (200 OK):**
```json
{
  "success": true,
  "user": {
    "id": "6724fa0e1234567890abcdef",
    "name": "Jane Doe",
    "email": "jane@example.com",
    "created_at": "2026-11-03T10:15:00Z"
  }
}
```

---

## 3. Poll Management Endpoints

### `POST /api/polls`
Creates a new interactive poll.
- **Headers:** `Authorization: Bearer <JWT_TOKEN>`
- **Request Body:**
```json
{
  "question": "Which backend stack do you prefer for high concurrency?",
  "description": "Vote based on production experience and maintainability.",
  "options": ["Go + Gin", "Node.js + Fastify", "Rust + Actix", "Python + FastAPI"],
  "allow_multiple": false,
  "expires_at": "2026-11-04T18:00:00Z"
}
```
- **Response (201 Created):**
```json
{
  "success": true,
  "message": "Poll created successfully",
  "poll": {
    "id": "672501a3b1c2d3e4f5a6b7c8",
    "creator_id": "6724fa0e1234567890abcdef",
    "question": "Which backend stack do you prefer for high concurrency?",
    "description": "Vote based on production experience and maintainability.",
    "options": [
      { "id": "opt_8a12b3c4", "text": "Go + Gin", "votes": 0 },
      { "id": "opt_9b23c4d5", "text": "Node.js + Fastify", "votes": 0 }
    ],
    "allow_multiple": false,
    "status": "active",
    "total_votes": 0,
    "created_at": "2026-11-03T10:20:00Z"
  }
}
```

### `GET /api/polls`
Lists all polls created by the authenticated user.
- **Headers:** `Authorization: Bearer <JWT_TOKEN>`
- **Response (200 OK):**
```json
{
  "success": true,
  "polls": [ ... ]
}
```

### `GET /api/polls/:id`
Retrieves a public poll by its ID. Does not require authentication.
- **Response (200 OK):**
```json
{
  "success": true,
  "poll": { ... }
}
```

### `PATCH /api/polls/:id/close`
Closes voting on a poll. (Creator only)
- **Headers:** `Authorization: Bearer <JWT_TOKEN>`
- **Response (200 OK):**
```json
{
  "success": true,
  "message": "Poll closed successfully"
}
```

### `PATCH /api/polls/:id/reopen`
Reopens a closed poll. (Creator only)
- **Headers:** `Authorization: Bearer <JWT_TOKEN>`

### `DELETE /api/polls/:id`
Deletes a poll permanently. (Creator only)
- **Headers:** `Authorization: Bearer <JWT_TOKEN>`

---

## 4. Real-Time Voting & Results

### `POST /api/polls/:id/vote`
Records a vote for one or more options.
- **Headers (Optional):** `X-Voter-ID: <anonymous_voter_uuid>`
- **Request Body:**
```json
{
  "option_ids": ["opt_8a12b3c4"],
  "voter_id": "voter_9138240f-7b3d-40c1-88a1"
}
```
- **Response (200 OK):**
```json
{
  "success": true,
  "message": "Vote recorded successfully",
  "results": {
    "poll_id": "672501a3b1c2d3e4f5a6b7c8",
    "question": "Which backend stack do you prefer for high concurrency?",
    "total_votes": 1,
    "status": "active",
    "options": [
      { "id": "opt_8a12b3c4", "text": "Go + Gin", "votes": 1 },
      { "id": "opt_9b23c4d5", "text": "Node.js + Fastify", "votes": 0 }
    ],
    "updated_at": "2026-11-03T10:22:00Z"
  }
}
```
- **Error Response (400 Bad Request):**
```json
{
  "success": false,
  "message": "duplicate vote: you have already voted in this poll"
}
```

### `GET /api/polls/:id/results`
Returns aggregated live results.
- **Query Parameters:** `?resync=true` (Forces counter reconciliation with MongoDB ground truth)
- **Response (200 OK):**
```json
{
  "success": true,
  "results": {
    "poll_id": "672501a3b1c2d3e4f5a6b7c8",
    "question": "Which backend stack do you prefer for high concurrency?",
    "total_votes": 142,
    "status": "active",
    "options": [ ... ],
    "updated_at": "2026-11-03T10:25:00Z"
  }
}
```

---

## 5. WebSocket API

### `WS /ws/polls/:id`
Bi-directional real-time connection for poll live rooms.

#### On Connection
Immediately sends initial state:
```json
{
  "type": "initial_state",
  "poll_id": "672501a3b1c2d3e4f5a6b7c8",
  "viewers": 12,
  "results": { ... }
}
```

#### On Live Vote Cast
Broadcast to all room clients within ~15ms:
```json
{
  "type": "vote_update",
  "poll_id": "672501a3b1c2d3e4f5a6b7c8",
  "results": {
    "total_votes": 143,
    "options": [ ... ]
  },
  "timestamp": "2026-11-03T10:25:01Z"
}
```

#### On Viewer Join/Leave
```json
{
  "type": "viewer_count",
  "poll_id": "672501a3b1c2d3e4f5a6b7c8",
  "viewers": 13
}
```

