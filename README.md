# ICSI 418Y Project

This is a full-stack project using React, Node.js, Express, and MongoDB.

## Features

- Signup and login
- Create and view projects
- Manage project members
- Create, edit, assign, and delete user stories
- View project backlogs

## How to Run

### Backend

```bash
cd server
node server.js
```

Backend runs on:

```text
http://localhost:5000
```

### Frontend

Open another terminal:

```bash
cd client
npm run dev
```

Frontend runs on:

```text
http://localhost:5173
```

## Test Data

Before testing, create:

- At least 3 users
- At least 2 projects
- At least 5 user stories
- Stories with different priorities and statuses
- Both assigned and unassigned stories

## Notes

MongoDB Atlas is used for the database.

The `.env` file and `node_modules` should not be uploaded to GitHub.
