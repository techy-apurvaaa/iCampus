# CPIP Authentication Setup

## 1. Configure MongoDB
Open `backend/.env` and replace `YOUR_MONGODB_ATLAS_URI_HERE` with your own MongoDB Atlas connection string. The distributed ZIP intentionally contains no MongoDB password.

## 2. Start the backend
```bash
cd backend
npm install
npm run dev
```
Confirm `http://localhost:5000/api/health` returns `{ "ok": true, ... }`.

## 3. Start the frontend
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:5173/login`.

## Default administrator
- Email: `admin@campus.edu`
- Password: `admin123`

When `SEED_DEMO=true`, the server automatically creates/repairs the default admin and demo Faculty/Student accounts.

## Demo accounts
- Admin: `admin@campus.edu` / `admin123`
- Faculty: `faculty@campus.edu` / `demo123`
- Student: `student@campus.edu` / `demo123`

## Registration policy
Public registration is disabled. Only the default administrator can create Faculty and Student accounts from **Manage Users**. Every created password is hashed with bcrypt.

## Authentication
- Login uses bcrypt comparison.
- Legacy plain-text demo passwords are migrated to bcrypt on successful login.
- Login issues a 7-day JWT.
- `/api/auth/me` validates the JWT and returns the current user.
- Invalid/expired sessions are cleared in the frontend automatically.
