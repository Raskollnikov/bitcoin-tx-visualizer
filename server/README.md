# Bitcoin TX Visualizer, Server

Express + TypeScript server that sits between the React frontend and mempool.space API, adds caching, rate limiting, and a clean REST interface

---

## Stack

- **Express** — HTTP server
- **TypeScript** — compiled to JS via `tsc`
- **express-rate-limit** — protects against API abuse
- **dotenv** — environment config
- **In-memory cache** — reduces mempool.space API calls

---

## Routes

| Method | Path                 | Description                           |
| ------ | -------------------- | ------------------------------------- |
| GET    | `/health`            | Health check                          |
| GET    | `/api/tx/:txid`      | Transaction info                      |
| GET    | `/api/address/:addr` | Address summary + txs                 |
| GET    | `/api/block/:hash`   | Block header + txs                    |
| GET    | `/api/stats`         | Network stats (fees, mempool, height) |

---

### Security

- [ ] CORS `origin` is set to exact frontend URL, not `*`
- [ ] No API keys or secrets in source code
- [ ] `express-rate-limit` is applied before all `/api` routes ✓
