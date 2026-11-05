# PULSE Architecture Specification

> **PULSE – Every Vote. Every Voice. In Real Time.**  
> Comprehensive Technical Architecture Document for HCL GUVI Assessment.

---

## 1. High-Level Architecture Overview

PULSE is engineered as a reactive, distributed, high-concurrency real-time polling platform. The architecture separates persistent state storage (MongoDB) from high-throughput in-memory aggregation and event dispatch (Redis), bridging browser clients with low-latency bidirectional WebSockets.

```
       +-------------------------------------------------------------+
       |                        React SPA Clients                    |
       |  (Audience Voters, Poll Creators, Live Analytics Dashboards)|
       +-------------------------------+-----------------------------+
                                       |
                REST / HTTPS Requests  |   WebSocket / WSS Connections
               (Create, Auth, Vote)    |   (Live results, Room presence)
                                       v
       +-------------------------------------------------------------+
       |                      Go (Gin) Backend                       |
       |                                                             |
       |  +--------------------+             +--------------------+  |
       |  |  HTTP Controllers  |             |   WebSocket Hub    |  |
       |  |  (Auth, Poll, Vote)|             |  (Client Rooms, WS)|  |
       |  +---------+----------+             +---------^----------+  |
       |            |                                  |             |
       |  +---------v----------+                       |             |
       |  |  Business Services |                       |             |
       |  | (Validation & Logic)                       |             |
       |  +----+------------+--+                       |             |
       +-------|------------|--------------------------|-------------+
               |            |                          |
    Transactional           | Redis Atomic Incr        | Redis Pub/Sub
     Persistence            |                          | Event Dispatch
               |            v                          |
               |     +--------------+                  |
               |     | Redis 7.2    |                  |
               |     | - Counters   +------------------+
               |     | - Pub/Sub Ch |
               |     +--------------+
               v
       +--------------+
       | MongoDB Atlas|
       | - Users      |
       | - Polls      |
       | - Votes      |
       +--------------+
```

---

## 2. Technology Rationale

| Layer | Technology | Key Capabilities & Rationale |
|---|---|---|
| **Frontend** | React 18, Vite, Tailwind CSS, Recharts | Fast HMR, reactive state management, dark/light theme tokens, fluid animations, dynamic data visualization. |
| **Backend** | Go (Golang), Gin Framework | Superior CPU/memory efficiency, built-in concurrency with goroutines, compiled type-safe performance. |
| **Real-Time** | Gorilla WebSocket, Redis Pub/Sub | Sub-50ms event dissemination to thousands of concurrent audience members without polling overhead. |
| **In-Memory Cache**| Redis 7.2 | Atomic counters (`INCR`, `INCRBY`), multi-instance pub/sub channel clustering (`poll:{id}:updates`). |
| **Source of Truth**| MongoDB 7.0 | Document-oriented schema, compound unique indexes preventing duplicate votes, atomic document increments. |

---

## 3. Real-Time Voting Lifecycle Pipeline

1. **Submission**: Audience client sends `POST /api/polls/:id/vote` with `option_ids` and voter tracking token.
2. **Validation**: Go backend verifies poll status (active, not expired), option boundary limits, and schema.
3. **Fraud & Duplication Check**: Backend queries MongoDB compound index `(poll_id, voter_id)`. If duplicate exists, request is rejected with HTTP 400.
4. **Permanent Commit**: Vote is inserted into MongoDB `votes` collection; option totals in `polls` are incremented atomically.
5. **Atomic Memory Sync**: Redis increments `poll:{id}:option:{opt_id}:votes` and `poll:{id}:total_votes`.
6. **Pub/Sub Broadcast**: Redis publishes serialized result payload to `poll:{id}:updates`.
7. **WebSocket Fan-Out**: The Go WebSocket Hub receives the channel payload and fans out the event across all subscribed client connections in room `poll_id`.
8. **Client Reactivity**: React clients update state instantly; progress bars animate and Recharts re-render without browser refresh.

---

## 4. Resilience & Reliability Mechanisms

- **Idempotency & Fraud Mitigation**:
  MongoDB compound unique index on `(poll_id, voter_id)` acts as the ultimate gatekeeper against race conditions and replay attacks.
- **Redis Outage Graceful Fallback**:
  If Redis connectivity is temporarily interrupted, the Go backend falls back to in-memory thread-safe maps and continues serving live traffic.
- **Counter Resynchronization (`RebuildFromMongo`)**:
  Redis is an aggregation cache; MongoDB is the source of truth. The system provides automatic and on-demand resynchronization to rebuild Redis counters directly from MongoDB vote aggregation.
- **WebSocket Reconnection & Heartbeats**:
  Client-side exponential backoff reconnection guarantees stream recovery after network handoffs or client disconnects. Upon reconnection, current state is retransmitted immediately.

