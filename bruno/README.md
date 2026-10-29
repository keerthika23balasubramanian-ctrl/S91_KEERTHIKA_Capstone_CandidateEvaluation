# Candidate Evaluation API - Bruno collection

This collection documents the API routes registered by `server/server.js`.

## Import and configure

1. Start the server with `cd server && npm install && npm run dev` (PowerShell users can run the commands on separate lines).
2. Ensure MongoDB and any required server environment variables are configured.
3. Open Bruno and choose **Open Collection**, then select this `bruno` folder.
4. Choose the `local` environment. Update `baseUrl` if the server is using a different port.
5. Send **Auth / Login** with credentials accepted by your local server, then copy its `token` value into the `token` environment variable. The collection does not store real credentials.
6. Replace the sample IDs in the environment with MongoDB document IDs before sending requests that use `:id`.
7. For **Uploads / Upload Resume**, replace the sample file path with a local PDF or Word document. The server accepts files up to 5 MB.

Requests that require authentication send `Authorization: Bearer {{token}}`. `GET /api/candidates/:id` is intentionally shown without authentication because the current server route does not use the authentication middleware.

## Endpoints

| Method | Path | Authentication | Request |
|---|---|---|---|
| GET | `/` | No | API welcome/status |
| GET | `/api/health` | No | Health check |
| POST | `/api/auth/login` | No | Username and password |
| POST | `/api/auth/google` | No | Google credential or provider payload |
| GET | `/api/auth/me` | Bearer token | Current authenticated user |
| POST | `/api/upload/resume` | Bearer token | Multipart field `resume` |
| GET | `/api/candidates` | Bearer token | List candidates |
| GET | `/api/candidates/:id` | No | Candidate by ID |
| POST | `/api/candidates` | Bearer token | Candidate JSON |
| PUT | `/api/candidates/:id` | Bearer token | Candidate fields to update |
| GET | `/api/recruiters` | Bearer token | List recruiters |
| GET | `/api/recruiters/:id` | Bearer token | Recruiter and managed candidates |
| GET | `/api/recruiters/:id/candidates` | Bearer token | Recruiter's candidates |
| POST | `/api/recruiters` | Bearer token | Recruiter JSON |
| PUT | `/api/recruiters/:id` | Bearer token | Recruiter fields to update |
| POST | `/api/recruiters/:recruiterId/candidates` | Bearer token | Assign candidate by ID |
| GET | `/api/evaluations` | Bearer token | List evaluations |
| GET | `/api/evaluations/:id` | Bearer token | Evaluation by ID |
| POST | `/api/evaluations` | Bearer token | Evaluation JSON |
| PUT | `/api/evaluations/:id` | Bearer token | Evaluation fields to update |

These requests describe the current Express routes. The server does not currently register `DELETE` endpoints.
