# Leads Management System

A full-stack application to help startup sales teams qualify and analyze demo-request leads with a Python backend and React TypeScript frontend.

### 🔧 Tech Stack
- **Backend:** Python (FastAPI)
- **Frontend:** React with TypeScript (Vite)
- **UI Library:** PrimeReact
- **Database:** PostgreSQL
- **HTTP Client:** Axios
- **Icons:** PrimeIcons
- **Charts:** Chart.js

## Setup Instructions

### Prerequisites
- Python 3.x
- Node.js and npm
- PostgreSQL

### Backend Setup

1. **Create and activate Python virtual environment:**
   ```bash
   python -m venv venv
   source venv/bin/activate
   ```

2. **Select Python interpreter in VS Code:**
   - Press `Cmd+Shift+P` (Command Palette)
   - Type "Python: Select Interpreter"
   - Select the virtual environment interpreter

3. **Install Python dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

### Database Setup

4. **Create PostgreSQL database:**
   ```bash
   createdb {database_name}
   ```
   > Replace `{database_name}` with your preferred database name

5. **Set up database schema:**
   ```bash
   psql {database_name}
   \i db.sql
   \q
   ```

### Frontend Setup

6. **Create React TypeScript frontend:**
   ```bash
   npm create vite@latest frontend -- --template react-ts
   cd frontend
   ```

7. **Install dependencies:**
   ```bash
   npm install
   npm install axios primereact primeicons chart.js
   ```

### Running the Application

**Start Backend:**
```bash
python backend/app.py
```

**Start Frontend:**
```bash
cd frontend
npm run dev
```
