# TaskFlow - Full-Stack Task Manager

TaskFlow is a task and account manager built with **HTML, CSS and JavaScript** on the front end, and **Node.js + Express + MongoDB (Mongoose)** on the back end. It was built following the Full-Stack MERN Project Guide.

- Live demo: _add your Render/Netlify link here after deployment_
- Screenshots: _add to `docs/` and link here_

## Features

**Core**
- [x] User registration and login (passwords hashed with bcrypt, JWT tokens)
- [x] Logout (clears the token)
- [x] Protected API routes and frontend route guards
- [x] Full CRUD for tasks
- [x] Users only see and edit their own tasks
- [x] Server-side validation with clear messages
- [x] Central error handling with proper HTTP status codes
- [x] Responsive UI (mobile, tablet, desktop)
- [x] Secrets in `.env`, with `.env.example` provided

**Intermediate**
- [x] Role-based access (`user` and `admin`), with an admin user-management page
- [x] Pagination (`?page=2&limit=10`) with total count
- [x] Search, filter by status and priority, date range, and sorting
- [x] Profile page: update name, upload a profile picture (type and size checked), change password
- [x] Loading, empty and error states
- [x] Dashboard with counts and overdue tasks
- [x] Rate limiting, security headers (helmet), request logging (morgan)

**Advanced**
- [x] Automated API tests (Jest + Supertest)
- [ ] Refresh tokens, email reset, real-time updates, Docker, CI/CD (planned)

## Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend | HTML5, CSS3 (custom properties, Grid, Flexbox), JavaScript ES modules, Fetch API |
| Backend | Node.js (LTS), Express 4 |
| Database | MongoDB with Mongoose |
| Auth | jsonwebtoken, bcryptjs |
| Security | helmet, cors, express-rate-limit, express-mongo-sanitize |
| Validation | express-validator |
| Uploads | multer |
| Testing | Jest, Supertest, mongodb-memory-server |

## Folder Structure

```
taskflow-fullstack/
├── README.md
├── .gitignore
├── backend/
│   ├── server.js                  # entry point: loads env, connects DB, starts server
│   ├── package.json
│   ├── .env.example
│   ├── uploads/                   # uploaded pictures (git-ignored, keeps .gitkeep)
│   ├── src/
│   │   ├── app.js                 # express app: middleware + routes (no listen here)
│   │   ├── seed.js                # demo data
│   │   ├── config/                # db.js, constants.js
│   │   ├── models/                # User.js, Task.js
│   │   ├── controllers/           # auth, task, user
│   │   ├── routes/                # index, auth, task, user
│   │   ├── middlewares/           # auth (protect, restrictTo), error, validate, upload
│   │   ├── validators/            # auth, task
│   │   └── utils/                 # ApiError, asyncHandler, generateToken
│   └── tests/                     # auth.test.js, tasks.test.js, helpers.js
└── frontend/
    ├── index.html                 # redirects to dashboard or login
    ├── css/                       # variables.css (design tokens), style.css
    ├── js/
    │   ├── config.js              # API_URL: the only place to change the backend address
    │   ├── api.js                 # fetch wrapper: adds token, handles errors
    │   ├── auth.js                # login, register, logout, route guard
    │   ├── nav.js                 # navbar
    │   ├── ui.js                  # toasts, spinners, confirm dialog
    │   ├── utils.js               # formatDate, debounce, escapeHTML
    │   ├── task-card.js           # shared task card markup
    │   └── pages/                 # one script per page
    └── pages/                     # login, register, dashboard, tasks, task-form, profile, admin, 404
```

## Getting Started

### Prerequisites
- Node.js LTS (`node -v`)
- MongoDB: a local server (`mongodb://127.0.0.1:27017`) or a free MongoDB Atlas cluster
- VS Code with the Live Server extension (or any static file server)

### 1. Clone and install

```bash
git clone https://github.com/<your-username>/taskflow-fullstack.git
cd taskflow-fullstack/backend
npm install
```

### 2. Configure environment variables

```bash
cp .env.example .env
```

Edit `.env` and set `MONGO_URI` and a long random `JWT_SECRET`. Never commit `.env`.

### 3. Run the backend

```bash
npm run dev        # development (auto-restarts)
# or
npm start
```

Check it works: open `http://localhost:5000/health`.

Optional: load demo data with `npm run seed`. It creates
- admin: `admin@demo.com` / `Admin@123`
- user: `user@demo.com` / `User@1234`

### 4. Run the frontend

Open the `frontend` folder in VS Code and click **Go Live** (Live Server, usually `http://127.0.0.1:5500`). Make sure `CLIENT_URL` in `backend/.env` matches that address exactly, or the browser will block requests (CORS).

## Environment Variables

| Variable | Example | Purpose |
| --- | --- | --- |
| `PORT` | `5000` | Port for the API |
| `NODE_ENV` | `development` | `development`, `test` or `production` |
| `MONGO_URI` | `mongodb://127.0.0.1:27017/taskflow` | Database connection |
| `MONGO_URI_TEST` | `mongodb://127.0.0.1:27017/taskflow_test` | Database used by the tests |
| `JWT_SECRET` | _(long random string)_ | Signs login tokens |
| `JWT_EXPIRES_IN` | `7d` | Token lifetime |
| `CLIENT_URL` | `http://127.0.0.1:5500` | Allowed frontend origin (CORS) |

## API Documentation

All endpoints are under `/api/v1`. Successful responses look like `{ "success": true, "data": ..., "message": ... }`. Errors look like `{ "success": false, "message": "...", "errors": [...] }`.

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| POST | `/auth/register` | Public | Create account (role is always `user`) |
| POST | `/auth/login` | Public | Log in, returns JWT |
| GET | `/auth/me` | Private | Current user |
| PUT | `/auth/change-password` | Private | Change password |
| GET | `/tasks` | Private | List own tasks. Query: `page`, `limit`, `search`, `status`, `priority`, `from`, `to`, `sort` |
| POST | `/tasks` | Private | Create task |
| GET | `/tasks/stats` | Private | Counts by status and overdue tasks |
| GET | `/tasks/:id` | Owner or admin | Task details |
| PUT | `/tasks/:id` | Owner or admin | Update task |
| DELETE | `/tasks/:id` | Owner or admin | Delete task |
| PUT | `/users/profile` | Private | Update own name and avatar (multipart form) |
| GET | `/users` | Admin | List users (paginated) |
| PATCH | `/users/:id/active` | Admin | Activate or deactivate a user |
| DELETE | `/users/:id` | Admin | Delete a user and their tasks |

HTTP status codes used: `200`, `201`, `400` (validation), `401` (missing or invalid token, wrong login), `403` (not allowed), `404`, `409` (duplicate email), `429` (rate limit), `500`.

## Database Design

**users**: `name`, `email` (unique), `password` (hashed, not returned), `role` (`user`/`admin`), `avatar`, `isActive`, timestamps.

**tasks**: `title`, `description`, `status` (`todo`/`in-progress`/`done`), `priority` (`low`/`medium`/`high`), `dueDate`, `createdBy` (ref User, indexed), timestamps. A text index on title and description supports search.

Relationship: one user has many tasks.

## Testing

Tests use a real MongoDB, either yours or a temporary in-memory one.

```bash
cd backend
# Option 1: use your local MongoDB or Atlas test database
MONGO_URI_TEST=mongodb://127.0.0.1:27017/taskflow_test npm test

# Option 2: let mongodb-memory-server download a temporary MongoDB (needs internet once)
npm test
```

The tests cover registration and login (including that role cannot be set by the client and passwords are hashed), protected routes, validation errors, ownership rules (403 for another user's task), admin-only routes, pagination and filters, and dashboard stats.

### Manual test cases

| Test | Expected | Result |
| --- | --- | --- |
| Register with an existing email | 409, "email already exists" | |
| Log in with a wrong password | 401 | |
| Open `tasks.html` without logging in | Redirected to login | |
| Edit another user's task (API) | 403 | |
| Upload a 10 MB picture | "File is too large" | |
| Submit an empty task form | Field error shown | |
| Delete a task, then refresh | Task stays deleted | |

## Git Workflow

- Branches: `main` (working code), `feature/<name>` for each feature
- Commit messages follow `type(scope): message`, for example `feat(task): add pagination and search`
- Tag the release: `git tag v1.0.0`

## Deployment

| Part | Service | Notes |
| --- | --- | --- |
| Database | MongoDB Atlas (M0 free) | Copy the connection string into `MONGO_URI` |
| Backend | Render or Railway | Root directory `backend`, build `npm install`, start `npm start`. Set all env variables. |
| Frontend | Netlify or Vercel | Publish the `frontend` folder. Update `API_URL` in `js/config.js` to the deployed backend. |

After deploying, set `CLIENT_URL` on the backend to the frontend's live address. Free backends sleep after inactivity, so the first request can take up to a minute.

## Author

_Your name_ · [GitHub](https://github.com/your-username) · [LinkedIn](https://linkedin.com/in/your-profile)
