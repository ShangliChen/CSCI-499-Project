# CSCI 499 Project: MindConnect

Repository for the MindConnect project, a web application designed to connect students with school counselors for mental health support.

## Project Structure

- `/front-end`: Contains the React frontend application.
- `/backend`: Contains the Node.js/Express backend server and database logic.

## Setup and Installation

### Prerequisites

- [Node.js](https://nodejs.org/) (v20.19+ or v22.12+ recommended)
- [MongoDB](https://www.mongodb.com/try/download/community) installed and running locally.
- [Git](https://git-scm.com/)

### 1. Clone the Repository

```bash
git clone <repository-url>
cd CSCI-499-Project
```

### 2. Install Root Dev Tools

Install the root dependencies so the concurrent dev runner is available:

```bash
npm install
```

This installs the root devDependency `concurrently`, which is used by `npm run dev`.

### 3. Set Up the Backend

```bash
cd backend

# Create the environment file from the example
cp .env.example .env

# Ensure your .env contains a valid MongoDB connection string
# (update as needed for your environment)
echo "MONGO_URI=mongodb://localhost:27017/mindconnect" >> .env

# Install dependencies
npm install

cd ..
```

### 4. Set Up the Frontend

```bash
cd front-end
npm install
cd ..
```

## Running the Project for Development

From the root directory (`CSCI-499-Project-main`), run the following command to start both the frontend and backend servers concurrently:

```bash
npm run dev
```

- The frontend will be available at `http://localhost:5173`.
- The backend server will be running at `http://localhost:5000`.

### Before You Run

- Root deps installed: run `npm install` at the repo root (required for `concurrently`).
- Backend env: ensure `backend/.env` exists and includes `MONGO_URI=...`.
- MongoDB running: start your local MongoDB (or use an Atlas URI in `MONGO_URI`).
- Frontend/Backend deps: `npm install --prefix front-end` and `npm install --prefix backend` if not already installed.

Tip: for reproducible installs, you can use `npm ci --prefix front-end` and `npm ci --prefix backend` instead of `npm install` in those folders.

## Forgot Password & Security Questions

- New users select a security question and set an answer during signup (student and counselor).
- If a user forgets their password on the login page, they can:
  - Enter their School ID and click “Get Security Question”.
  - Answer the question and set a new password.

### Backend API

- `GET /security-questions` → `{ questions: string[] }`
- `POST /signup/:userType` with `securityQuestion`, `securityAnswer` in the JSON body
- `POST /forgot-password/init` → body `{ school_id }` → `{ success, securityQuestion }`
- `POST /forgot-password/reset` → body `{ school_id, answer, newPassword }` → `{ success }`

Security notes:
- Security answers are normalized and stored as bcrypt hashes.
- Existing users created before this change won’t have recovery set; they’ll need to re‑register or an admin flow can be added later to set a question.
