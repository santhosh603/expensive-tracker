# 💸 SpendSmart — Personal Expense Tracker

A full-stack SaaS-level expense tracking application built with **React**, **Node.js**, **Express**, and **MongoDB Atlas**.

---

## 🚀 Features

- **Authentication** — Secure JWT-based login/register with per-user data isolation
- **Transactions** — Add, edit, delete, filter, search & export income/expenses
- **Budgets** — Set category budgets with alert thresholds & progress tracking
- **Savings Goals** — Create goals, contribute funds, track progress
- **Analytics** — Charts for trends, category breakdown, payment methods
- **Recurring** — Manage subscriptions and recurring income/bills
- **Settings** — Currency, income, notifications, password change

---

## 📁 Complete Project Structure (38 files)

```
expense-tracker/
├── README.md
├── package.json                          ← Root scripts (install:all, dev:backend, dev:frontend)
│
├── backend/                              ← 16 files — Node.js + Express REST API
│   ├── server.js                         ← Main entry: Express app, MongoDB connect, all routes registered
│   ├── package.json                      ← Dependencies: express, mongoose, bcryptjs, jsonwebtoken, etc.
│   ├── .env                              ← ⚠️ EDIT THIS: MONGODB_URI, JWT_SECRET, PORT, FRONTEND_URL
│   ├── .gitignore
│   │
│   ├── middleware/
│   │   └── auth.js                       ← JWT protect middleware + generateToken helper
│   │
│   ├── models/                           ← 5 Mongoose schemas
│   │   ├── User.js                       ← name, email, password(hashed), currency, monthlyIncome, notifications
│   │   ├── Expense.js                    ← title, amount, type, category, date, paymentMethod, tags, merchant, location
│   │   ├── Budget.js                     ← category, limit, period, month, year, alertThreshold, color
│   │   ├── Goal.js                       ← title, targetAmount, currentAmount, targetDate, contributions[]
│   │   └── Recurring.js                  ← title, amount, type, frequency, nextDueDate, isActive
│   │
│   └── routes/                           ← 7 Express route files (all protected by JWT)
│       ├── auth.js                       ← POST /register, POST /login, GET /me, PUT /profile, PUT /change-password
│       ├── expenses.js                   ← GET/POST/PUT/DELETE /expenses, bulk delete, monthly summary
│       ├── budgets.js                    ← GET/POST/PUT/DELETE /budgets (with live spending calculation)
│       ├── goals.js                      ← GET/POST/PUT/DELETE /goals, POST /goals/:id/contribute
│       ├── analytics.js                  ← GET /overview, /trend, /category-breakdown, /daily, /top-expenses, /payment-methods
│       ├── recurring.js                  ← GET/POST/PUT/DELETE /recurring
│       └── categories.js                 ← GET /categories (returns default category list with icons & colors)
│
└── frontend/                             ← 20 files — React 18 SPA
    ├── package.json                      ← Dependencies: react, react-router-dom, axios, chart.js, framer-motion, etc.
    ├── .env                              ← REACT_APP_API_URL=http://localhost:5000/api
    ├── .gitignore
    │
    ├── public/
    │   └── index.html                    ← HTML shell, Google Fonts (Syne + DM Sans), meta tags
    │
    └── src/
        ├── index.js                      ← ReactDOM.createRoot entry point
        ├── index.css                     ← Full design system: CSS variables, dark theme, cards, buttons,
        │                                    forms, modals, animations, responsive grid, scrollbar, skeleton
        ├── App.js                        ← BrowserRouter + all routes (protected/public) + Toaster config
        │
        ├── context/
        │   └── AuthContext.js            ← Global auth state: login, register, logout, updateUser,
        │                                    formatCurrency, getCurrencySymbol, isAuthenticated
        │
        ├── utils/
        │   └── api.js                    ← Axios instance with JWT interceptor + all API functions:
        │                                    authAPI, expenseAPI, budgetAPI, goalAPI, analyticsAPI,
        │                                    recurringAPI, categoryAPI
        │
        ├── components/
        │   ├── Sidebar.js                ← Fixed sidebar: logo, user card, nav links, logout, mobile drawer
        │   ├── Header.js                 ← Top bar: page title, greeting, quick-add button, avatar
        │   └── LoadingScreen.js          ← Full-screen spinner shown during auth initialization
        │
        └── pages/
            ├── Login.js                  ← Two-panel auth page, email/password, JWT storage
            ├── Register.js               ← Card form: name, email, password, currency selector
            ├── Dashboard.js              ← KPI cards, Line chart (income vs expense), Doughnut (categories),
            │                                recent transactions list, goals progress bars
            ├── Expenses.js               ← Full CRUD table: filters, search, pagination, bulk delete,
            │                                CSV export, add/edit modal with all fields
            ├── Budgets.js                ← Budget cards with progress bars, alert thresholds,
            │                                over-budget warnings, month/year selector
            ├── Goals.js                  ← Goal cards with progress, contribute modal, completion tracking,
            │                                priority badges, days-remaining countdown
            ├── Analytics.js              ← 4-tab deep analytics: overview KPIs, Bar/Line/Doughnut charts,
            │                                category breakdown, payment method usage, top expenses
            ├── Recurring.js              ← Recurring transaction list: pause/resume toggle, due-soon alerts,
            │                                monthly flow summary, add/edit modal
            └── Settings.js               ← 4-tab settings: profile, notifications toggles,
                                             change password, preferences
```

---

## ⚙️ Setup & Run

### 1. Configure MongoDB Atlas

1. Go to [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Create a free cluster
3. Get your connection string
4. Open `backend/.env` and replace:
   ```
   MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/expense-tracker?retryWrites=true&w=majority
   ```
   with your actual Atlas connection string.

Also update `JWT_SECRET` with any long random string.

---

### 2. Install & Run Backend

```bash
cd backend
npm install
npm run dev
```

Backend runs on → **http://localhost:5000**

---

### 3. Install & Run Frontend

```bash
cd frontend
npm install
npm start
```

Frontend runs on → **http://localhost:3000**

---

## 🔐 Environment Variables

### backend/.env
```
PORT=5000
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_jwt_secret_min_32_characters
JWT_EXPIRE=30d
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

### frontend/.env
```
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_APP_NAME=SpendSmart
```

---

## 🛠 Tech Stack

| Layer      | Technology                        |
|------------|-----------------------------------|
| Frontend   | React 18, React Router v6         |
| UI         | Custom CSS Design System          |
| Charts     | Chart.js + react-chartjs-2        |
| Animation  | CSS Animations + Framer Motion    |
| Backend    | Node.js, Express.js               |
| Database   | MongoDB Atlas (Mongoose ODM)      |
| Auth       | JWT (jsonwebtoken) + bcryptjs     |
| Validation | express-validator                 |
| Security   | Helmet, CORS, Rate Limiting       |

---

## 📡 API Endpoints

| Method | Endpoint                        | Description               |
|--------|---------------------------------|---------------------------|
| POST   | /api/auth/register              | Register new user         |
| POST   | /api/auth/login                 | Login                     |
| GET    | /api/auth/me                    | Get current user          |
| PUT    | /api/auth/profile               | Update profile            |
| PUT    | /api/auth/change-password       | Change password           |
| GET    | /api/expenses                   | List expenses (filtered)  |
| POST   | /api/expenses                   | Create expense            |
| PUT    | /api/expenses/:id               | Update expense            |
| DELETE | /api/expenses/:id               | Delete expense            |
| GET    | /api/budgets                    | List budgets              |
| POST   | /api/budgets                    | Create budget             |
| GET    | /api/goals                      | List goals                |
| POST   | /api/goals                      | Create goal               |
| POST   | /api/goals/:id/contribute       | Add contribution to goal  |
| GET    | /api/analytics/overview         | Monthly summary           |
| GET    | /api/analytics/trend            | Monthly trend chart data  |
| GET    | /api/analytics/category-breakdown | Category breakdown      |
| GET    | /api/recurring                  | List recurring items      |
| POST   | /api/recurring                  | Create recurring item     |

---

## 🎨 Design

- **Dark theme** with purple/cyan accent palette
- **Syne** (display) + **DM Sans** (body) typography
- Fully **responsive** — works on mobile, tablet, desktop
- CSS animations and micro-interactions throughout
- Glassmorphism cards, gradient text, progress bars

---

*Built with ❤️ — SpendSmart v1.0.0*
#   e x p e n s i v e - t r a c k e r  
 