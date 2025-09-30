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
cd CSCI-499-Project-main
```

### 2. Set Up the Backend

```bash
cd backend

# Create the environment file from the example
cp .env.example .env

# Install dependencies
npm install

cd ..
```

### 3. Set Up the Frontend

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
