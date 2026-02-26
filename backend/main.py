"""
Wave Estimates – FastAPI Backend
=================================
Thin entry point: creates the app, registers routers, runs seed on startup.
"""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import Base, SessionLocal, engine
from app.routers import customers, estimates, items
from app.seed import seed_database

# Import models so Base.metadata knows about all tables
import app.models  # noqa: F401


# ── App lifecycle ───────────────────────────────────────────────────────────


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed_database(db)
    finally:
        db.close()
    yield


# ── App creation ────────────────────────────────────────────────────────────

app = FastAPI(title="Wave Estimates API", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Register routers ───────────────────────────────────────────────────────

app.include_router(customers.router)
app.include_router(items.router)
app.include_router(estimates.router)


# ── Run ─────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
