# AI-Freelance Marketplace (FixIt.ai)

Run both the FastAPI backend and React frontend concurrently in a **single terminal**.

---

## 🚀 Quick Start (Single Terminal)

You can use **any** of the following options to run both servers together:

### Option 1: Using npm (Recommended)
```bash
npm run dev
# or
npm start
```

### Option 2: Using Python
```bash
python run.py
```

### Option 3: Windows Batch Script
Double-click `run.bat` or run in terminal:
```cmd
run.bat
```

---

## 🌐 Running Services

Once started, both services run concurrently in your single terminal:

| Service | URL | Description |
|---|---|---|
| **Frontend (React)** | [http://localhost:3000](http://localhost:3000) | Client web app with hot reloading |
| **Backend (FastAPI)** | [http://127.0.0.1:8000](http://127.0.0.1:8000) | REST API & WebSocket server |
| **API Docs (Swagger)** | [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs) | Interactive API exploration |

---

## 🎨 Unified Terminal Logs

The logs in your terminal are color-coded and tagged for readability:
- `[BACKEND]` (Cyan): Uvicorn server logs and database status
- `[FRONTEND]` (Magenta): React compilation logs and Webpack output

---

## 🛑 Stopping the Servers
Press <kbd>Ctrl</kbd> + <kbd>C</kbd> in your terminal at any time. Both the backend and frontend processes (and their worker sub-processes) will shut down cleanly without leaving ports blocked.
