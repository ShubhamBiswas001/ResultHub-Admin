# Student Result Management System - Admin Portal

![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/express.js-%23404d59.svg?style=for-the-badge&logo=express&logoColor=%2361DAFB)
![MongoDB](https://img.shields.io/badge/MongoDB-%234ea94b.svg?style=for-the-badge&logo=mongodb&logoColor=white)
![CoreUI](https://img.shields.io/badge/CoreUI-321fdb.svg?style=for-the-badge&logo=coreui&logoColor=white)

The Administrative Dashboard for the Student Result Management System. This panel allows administrators to oversee the entire system, manage users, and monitor performance.

## 🚀 Features

*   **Dashboard**: Overview of system statistics (Students, Teachers, Results).
*   **User Management**: Approve/Reject teacher registrations, manage student accounts.
*   **Result Management**: Oversee all result uploads and modifications.
*   **Real-time Notifications**: Live updates on new registrations.

## 🛠️ Tech Stack

*   **Frontend**: React.js (Vite), CoreUI Admin Template
*   **Backend**: Node.js, Express.js
*   **Database**: MongoDB
*   **Realtime**: Socket.io

## 📂 Project Structure

*   `src/`: React Frontend application
*   `backend/`: Node.js/Express Backend API

## ⚙️ Environment Variables

### Backend (`backend/.env`)
Create a `.env` file in the `backend` directory with the following variables:

```env
PORT=5001
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/Students-Result-Management-System
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=7d
```

## 🚀 Getting Started

### Prerequisites

*   Node.js (v14 or higher)
*   MongoDB

### Installation

1.  **Install Root Dependencies (Frontend):**
    ```bash
    npm install
    ```

2.  **Install Backend Dependencies:**
    ```bash
    cd backend
    npm install
    cd ..
    ```

### Running the Application

You can run both the frontend and backend concurrently with a single command:

```bash
# Run both frontend and backend in development mode
npm run dev
```

*   **Frontend**: http://localhost:5000
*   **Backend**: http://localhost:5001

### Running Separately

**Backend Only:**
```bash
cd backend
npm run dev
```

**Frontend Only:**
```bash
npm start
```

## 🔧 Troubleshooting

### Port Conflicts
If you encounter `EADDRINUSE` errors (e.g., port 5000 or 5001 is busy), use the following command to kill all running Node.js processes on Windows:

```powershell
taskkill /F /IM node.exe
```

### Connection Issues
*   Ensure the Admin Backend is running on Port 5001.
*   Ensure the User Backend is running on Port 4000 (if they need to interact).