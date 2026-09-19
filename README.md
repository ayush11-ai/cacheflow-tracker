# ⚡ CacheFlow Tracker

![Live Deployment](https://img.shields.io/badge/Status-Live-success?style=for-the-badge)
![Tech Stack](https://img.shields.io/badge/Stack-Node.js_|_Express_|_MongoDB_|_Vanilla_JS-blue?style=for-the-badge)

CacheFlow Tracker is a full-stack personal finance web application designed to automate expense management. It allows users to securely log daily spending, track savings targets in real-time, analyze financial habits through dynamic charts, and generate downloadable PDF reports.

## 🚀 Live Demo
* **Frontend Application (Vercel):** [https://cacheflow-tracker-git-main-ayush11-ais-projects.vercel.app/](https://cacheflow-tracker-git-main-ayush11-ais-projects.vercel.app/)
* **Backend API (Render):** [https://cacheflowtracker.onrender.com](https://cacheflowtracker.onrender.com)

## ✨ Key Features
* **Secure Authentication:** User registration and login utilizing JSON Web Tokens (JWT) and encrypted passwords.
* **Financial Dashboard:** Real-time calculation of remaining balances, total spending, and progress toward savings goals.
* **Expense Management:** Full CRUD (Create, Read, Update, Delete) functionality for logging daily transactions.
* **Data Visualization:** Interactive spending breakdown charts categorized by expense type (Food, Travel, EMI, etc.).
* **Report Generation:** One-click export of financial data into formatted PDF ledgers.
* **Responsive UI:** Clean, mobile-friendly interface built with Vanilla JavaScript and CSS.

## 💻 Tech Stack
This project utilizes a decoupled architecture, separating the client-side interface from the server-side logic and database.

* **Frontend:** HTML5, CSS3, Vanilla JavaScript
* **Backend:** Node.js, Express.js
* **Database:** MongoDB Atlas (NoSQL)
* **Deployment:** Vercel (Frontend Hosting), Render (Backend Web Service)

## 🏗️ System Architecture
1. **Client (Frontend):** Makes asynchronous HTTP `fetch()` requests to the RESTful API.
2. **API (Backend):** Express server intercepts requests at the `/api` prefix, verifies JWT authorization, and processes business logic.
3. **Database:** MongoDB handles document storage, ensuring robust user data isolation and quick retrieval.

## 🛠️ Local Setup & Installation

Follow these steps to run the project on your local machine.

### Prerequisites
* Node.js installed on your machine.
* A MongoDB Atlas account and a configured database cluster.

### 1. Clone the Repository
```bash
git clone [https://github.com/ayush11-ai/cacheflow-tracker.git](https://github.com/ayush11-ai/cacheflow-tracker.git)
cd cacheflow-tracker
