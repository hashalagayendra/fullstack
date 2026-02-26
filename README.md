# Wave Estimates

A full-stack estimates/invoicing application built with **Next.js** (frontend) and **FastAPI** (backend), backed by **PostgreSQL**.

---

## Prerequisites

- **Python** 3.12+
- **Node.js** 18+ and **npm**
- **PostgreSQL** running on `localhost:5432`

---

## Backend (FastAPI)

### 1. Install dependencies

```bash
cd backend
pip install -e .
```

Or install directly:

```bash
pip install fastapi "uvicorn[standard]" sqlalchemy psycopg2-binary python-dotenv
```

### 2. Configure the database

By default the app connects to:

```
postgresql://postgres:5461@localhost:5432/kottawa_test
```

To use a different database, create a `.env` file in the `backend/` folder:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/your_db
```

> Tables are created automatically on startup and seed data is inserted if the database is empty.

### 3. Run the backend

```bash
cd backend
uvicorn main:app --reload
```

The API will be available at **http://localhost:8000**.  
Swagger docs: **http://localhost:8000/docs**

---

## Frontend (Next.js)

### 1. Install dependencies

```bash
cd frontend
npm install
```

### 2. Run the frontend

```bash
npm run dev
```

The app will be available at **http://localhost:3000**.

> The frontend expects the backend API at `http://localhost:8000` by default.  
> To change this, set the `NEXT_PUBLIC_API_URL` environment variable.

---

## Running Both Together

Open two terminals:

```bash
# Terminal 1 – Backend
cd backend
uvicorn main:app --reload

# Terminal 2 – Frontend
cd frontend
npm run dev
```

Then open **http://localhost:3000** in your browser.
