# ExpenseTrack - Full-Stack MERN Expense Tracker

A complete, production-style personal finance management application built with the **MERN stack**. Track income and expenses, visualize spending patterns, and manage your financial life with ease.

---

## Features

- **User Authentication** — Secure register/login with JWT and bcrypt
- **Dashboard** — Balance, income, expense cards with live charts
- **Add Transactions** — Income and expense with category selection
- **Edit Transactions** — Update any existing transaction
- **Delete Transactions** — With confirmation dialog
- **Transaction List** — Search, filter by type/category, sort by date
- **Pie Chart** — Expense breakdown by category
- **Bar Chart** — Monthly income vs expenses (last 6 months)
- **Profile** — View and update your name
- **Protected Routes** — Authenticated users only; JWT guard
- **Responsive** — Works on desktop, tablet and mobile
- **User Isolation** — Users can only access their own data

---

## Technology Stack

| Layer      | Technology                     |
|------------|-------------------------------|
| Frontend   | React.js (Vite)               |
| Backend    | Node.js + Express.js          |
| Database   | MongoDB + Mongoose            |
| Auth       | JWT + bcryptjs                |
| HTTP       | Axios                         |
| Charts     | Recharts                      |
| Styling    | Vanilla CSS                   |
| Icons      | React Icons                   |

---

## Project Structure

```
expense-tracker/
│
├── client/                    # React frontend
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   ├── pages/             # Page-level components
│   │   ├── services/          # Axios API calls
│   │   ├── context/           # React Context (AuthContext)
│   │   ├── assets/            # Static assets
│   │   ├── App.jsx            # Router + route definitions
│   │   ├── main.jsx           # React entry point
│   │   └── index.css          # Global design system
│   └── package.json
│
├── server/                    # Express backend
│   ├── config/
│   │   └── db.js              # MongoDB connection
│   ├── controllers/           # Route handler logic
│   ├── middleware/
│   │   └── auth.js            # JWT protect middleware
│   ├── models/                # Mongoose schemas
│   ├── routes/                # API route definitions
│   ├── server.js              # Express app entry
│   └── package.json
│
├── .gitignore
└── README.md
```

---

## Prerequisites

Make sure you have the following installed:

- **Node.js** v18 or higher — https://nodejs.org
- **MongoDB** (local) — https://www.mongodb.com/try/download/community
  - Or use **MongoDB Compass** GUI to manage the database

---

## Installation

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd expense-tracker
```

### 2. Set up the Backend

```bash
cd server
npm install
```

### 3. Set up the Frontend

```bash
cd client
npm install
```

---

## MongoDB Setup

### Option A — Local MongoDB

1. Install MongoDB Community Edition from https://www.mongodb.com
2. Start MongoDB service:
   - Windows: MongoDB runs as a service automatically after installation
   - Or run: `mongod` in terminal

The default connection string `mongodb://localhost:27017/expensetrack` will work automatically.

### Option B — MongoDB Atlas (Cloud)

1. Create a free cluster at https://cloud.mongodb.com
2. Get your connection string
3. Replace `MONGO_URI` in `server/.env` with your Atlas connection string

---

## Environment Variables

The backend requires a `.env` file. A working `.env` is already included for local development.

To configure manually, copy the example:

```bash
cd server
cp .env.example .env
```

Edit `server/.env`:

```env
MONGO_URI=mongodb://localhost:27017/expensetrack
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
PORT=5000
```

> **Never commit `.env` to version control.** It's listed in `.gitignore`.

---

## Running the Application

### Start the Backend

```bash
cd server
npm run dev
```

Server runs on: `http://localhost:5000`

### Start the Frontend

```bash
cd client
npm run dev
```

Frontend runs on: `http://localhost:5173`

Open your browser at **http://localhost:5173**

---

## API Overview

### Authentication

| Method | Endpoint            | Description              | Auth |
|--------|---------------------|--------------------------|------|
| POST   | /api/auth/register  | Register new user        | No   |
| POST   | /api/auth/login     | Login and get JWT token  | No   |
| GET    | /api/auth/me        | Get current user info    | Yes  |

### Transactions

| Method | Endpoint                  | Description                 | Auth |
|--------|---------------------------|-----------------------------|------|
| GET    | /api/transactions         | Get all user transactions   | Yes  |
| POST   | /api/transactions         | Create new transaction      | Yes  |
| PUT    | /api/transactions/:id     | Update a transaction        | Yes  |
| DELETE | /api/transactions/:id     | Delete a transaction        | Yes  |

### Dashboard

| Method | Endpoint                  | Description                        | Auth |
|--------|---------------------------|------------------------------------|------|
| GET    | /api/dashboard/summary    | Get balance, charts, recent data   | Yes  |

### Profile

| Method | Endpoint            | Description        | Auth |
|--------|---------------------|--------------------|------|
| PUT    | /api/users/profile  | Update user name   | Yes  |

---

## Transaction Categories

**Expense Categories:**
Food, Transport, Shopping, Bills, Education, Entertainment, Health, Other

**Income Categories:**
Salary, Freelance, Business, Gift, Other

---

## Sample Screenshots

> _Add screenshots here after running the application_

- Dashboard with summary cards and charts
- Transactions list with filters
- Add transaction form
- Profile page

---

## Future Enhancements

- Export transactions to CSV/PDF
- Budget limits per category with alerts
- Recurring transactions
- Dark mode toggle
- Multiple currency support
- Date range filtering

---

## Notes for Presentation

- **Security**: Passwords are hashed using bcrypt. JWTs expire after 30 days.
- **Data isolation**: Every API query filters by `userId` so users can never see each other's data.
- **Validation**: Both frontend (real-time) and backend (server-side) validation are implemented.
- **Charts**: Recharts library renders real database data — no static/fake data.
- **Responsive**: CSS Grid and Flexbox ensure it works on all screen sizes.
