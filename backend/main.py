"""
Wave Estimates – FastAPI Backend
=================================
Provides REST API for Estimates, Customers, and Items/Products.
Uses SQLite via SQLAlchemy for persistence.
"""

from __future__ import annotations

import os
from contextlib import asynccontextmanager
from datetime import date, timedelta
from typing import List, Optional

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy import (
    Column,
    Float,
    ForeignKey,
    Integer,
    String,
    create_engine,
    func,
)
from sqlalchemy.orm import (
    Session,
    declarative_base,
    relationship,
    sessionmaker,
)

# ── Database setup ──────────────────────────────────────────────────────────

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:5461@localhost:5432/kottawa_test")

engine = create_engine(DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


# ── ORM Models ──────────────────────────────────────────────────────────────


class CustomerModel(Base):
    __tablename__ = "customers"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String, nullable=False)
    email = Column(String, default="")
    phone = Column(String, default="")
    first_name = Column(String, default="")
    last_name = Column(String, default="")

    estimates = relationship("EstimateModel", back_populates="customer_rel")


class ItemModel(Base):
    __tablename__ = "items"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String, nullable=False)
    description = Column(String, default="")
    price = Column(Float, default=0.0)


class EstimateModel(Base):
    __tablename__ = "estimates"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    number = Column(String, unique=True, nullable=False, index=True)
    date = Column(String, nullable=False)
    valid_until = Column(String, default="")
    status = Column(String, default="Draft")
    type = Column(String, default="draft")
    notes = Column(String, default="")

    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=True)
    customer_rel = relationship("CustomerModel", back_populates="estimates")

    line_items = relationship(
        "LineItemModel", back_populates="estimate", cascade="all, delete-orphan"
    )


class LineItemModel(Base):
    __tablename__ = "line_items"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    estimate_id = Column(Integer, ForeignKey("estimates.id"), nullable=False)
    item_id = Column(Integer, ForeignKey("items.id"), nullable=True)
    name = Column(String, nullable=False)
    description = Column(String, default="")
    quantity = Column(Integer, default=1)
    price = Column(Float, default=0.0)

    estimate = relationship("EstimateModel", back_populates="line_items")


# ── Pydantic Schemas ────────────────────────────────────────────────────────


class CustomerCreate(BaseModel):
    name: str
    email: str = ""
    phone: str = ""
    first_name: str = ""
    last_name: str = ""


class CustomerOut(BaseModel):
    id: int
    name: str
    email: str
    phone: str
    first_name: str
    last_name: str

    class Config:
        from_attributes = True


class ItemCreate(BaseModel):
    name: str
    description: str = ""
    price: float = 0.0


class ItemOut(BaseModel):
    id: int
    name: str
    description: str
    price: float

    class Config:
        from_attributes = True


class LineItemIn(BaseModel):
    item_id: Optional[int] = None
    name: str
    description: str = ""
    quantity: int = 1
    price: float = 0.0


class LineItemOut(BaseModel):
    id: int
    item_id: Optional[int]
    name: str
    description: str
    quantity: int
    price: float

    class Config:
        from_attributes = True


class EstimateCreate(BaseModel):
    number: Optional[str] = None
    date: Optional[str] = None
    valid_until: Optional[str] = None
    status: str = "Draft"
    type: str = "draft"
    customer_id: Optional[int] = None
    notes: str = ""
    items: List[LineItemIn] = []


class EstimateUpdate(BaseModel):
    date: Optional[str] = None
    valid_until: Optional[str] = None
    status: Optional[str] = None
    type: Optional[str] = None
    customer_id: Optional[int] = None
    notes: Optional[str] = None
    items: Optional[List[LineItemIn]] = None


class EstimateOut(BaseModel):
    id: int
    number: str
    date: str
    valid_until: str
    status: str
    type: str
    customer: str
    amount: str
    notes: str
    customer_id: Optional[int]
    customer_obj: Optional[CustomerOut] = None
    items: List[LineItemOut] = []

    class Config:
        from_attributes = True


class StatusUpdate(BaseModel):
    status: str


# ── Helpers ─────────────────────────────────────────────────────────────────


def _format_amount(line_items: list) -> str:
    total = sum(li.price * li.quantity for li in line_items)
    return f"${total:,.2f}"


def _next_estimate_number(db: Session) -> str:
    result = db.query(func.max(EstimateModel.number)).scalar()
    if result:
        try:
            return str(int(result) + 1)
        except ValueError:
            pass
    return "45303"


def _estimate_to_out(est: EstimateModel) -> EstimateOut:
    customer_name = est.customer_rel.name if est.customer_rel else ""
    customer_out = None
    if est.customer_rel:
        customer_out = CustomerOut.model_validate(est.customer_rel)

    items_out = [LineItemOut.model_validate(li) for li in est.line_items]

    return EstimateOut(
        id=est.id,
        number=est.number,
        date=est.date,
        valid_until=est.valid_until or "",
        status=est.status,
        type=est.type,
        customer=customer_name,
        amount=_format_amount(est.line_items),
        notes=est.notes or "",
        customer_id=est.customer_id,
        customer_obj=customer_out,
        items=items_out,
    )


# ── Seed data ───────────────────────────────────────────────────────────────


def seed_database(db: Session):
    if db.query(CustomerModel).count() > 0:
        return

    customers_data = [
        {"name": "Person", "email": "", "phone": ""},
        {"name": "Shenali Hirushika", "email": "shenu123@gmail.com", "phone": "0722640409"},
        {"name": "Yomal Thushara", "email": "", "phone": ""},
        {"name": "Amal Perera", "email": "", "phone": ""},
        {"name": "Nimal Silva", "email": "", "phone": ""},
        {"name": "Sunil Kasun", "email": "", "phone": ""},
        {"name": "Kamal Pathirana", "email": "", "phone": ""},
    ]
    customer_map: dict[str, CustomerModel] = {}
    for c in customers_data:
        cust = CustomerModel(**c)
        db.add(cust)
        db.flush()
        customer_map[c["name"]] = cust

    items_data = [
        {"name": "HP Laptop", "description": "RTX 2050", "price": 450.00},
        {"name": "Pen", "description": "Blue Pen", "price": 10.00},
    ]
    for i in items_data:
        db.add(ItemModel(**i))

    estimates_data = [
        {
            "number": "45303",
            "date": "2026-02-26",
            "valid_until": "2026-03-28",
            "status": "Saved",
            "type": "active",
            "customer_name": "Yomal Thushara",
            "line_items": [
                {"name": "HP Laptop", "description": "RTX 2050", "quantity": 1, "price": 450.00},
            ],
        },
        {
            "number": "45304",
            "date": "2026-02-25",
            "valid_until": "2026-03-27",
            "status": "Draft",
            "type": "draft",
            "customer_name": "Amal Perera",
            "line_items": [
                {"name": "HP Laptop", "description": "RTX 2050", "quantity": 2, "price": 450.00},
                {"name": "Pen", "description": "Blue Pen", "quantity": 30, "price": 10.00},
            ],
        },
        {
            "number": "45305",
            "date": "2026-02-24",
            "valid_until": "2026-03-26",
            "status": "Draft",
            "type": "draft",
            "customer_name": "Nimal Silva",
            "line_items": [
                {"name": "HP Laptop", "description": "RTX 2050", "quantity": 1, "price": 450.00},
                {"name": "Pen", "description": "Blue Pen", "quantity": 40, "price": 10.00},
            ],
        },
        {
            "number": "45306",
            "date": "2026-02-23",
            "valid_until": "2026-03-25",
            "status": "Draft",
            "type": "draft",
            "customer_name": "Sunil Kasun",
            "line_items": [
                {"name": "HP Laptop", "description": "RTX 2050", "quantity": 4, "price": 450.00},
                {"name": "Pen", "description": "Blue Pen", "quantity": 30, "price": 10.00},
            ],
        },
        {
            "number": "45307",
            "date": "2026-02-22",
            "valid_until": "2026-03-24",
            "status": "Saved",
            "type": "active",
            "customer_name": "Kamal Pathirana",
            "line_items": [
                {"name": "Pen", "description": "Blue Pen", "quantity": 32, "price": 10.00},
            ],
        },
    ]

    for est in estimates_data:
        cust = customer_map.get(est["customer_name"])
        estimate = EstimateModel(
            number=est["number"],
            date=est["date"],
            valid_until=est["valid_until"],
            status=est["status"],
            type=est["type"],
            customer_id=cust.id if cust else None,
        )
        db.add(estimate)
        db.flush()

        for li in est["line_items"]:
            db.add(
                LineItemModel(
                    estimate_id=estimate.id,
                    name=li["name"],
                    description=li["description"],
                    quantity=li["quantity"],
                    price=li["price"],
                )
            )

    db.commit()


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


app = FastAPI(title="Wave Estimates API", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Customer Endpoints ──────────────────────────────────────────────────────


@app.get("/api/customers", response_model=List[CustomerOut])
def list_customers(search: str = Query("", description="Filter by name")):
    db = SessionLocal()
    try:
        q = db.query(CustomerModel)
        if search:
            q = q.filter(CustomerModel.name.ilike(f"%{search}%"))
        return [CustomerOut.model_validate(c) for c in q.order_by(CustomerModel.id).all()]
    finally:
        db.close()


@app.get("/api/customers/{customer_id}", response_model=CustomerOut)
def get_customer(customer_id: int):
    db = SessionLocal()
    try:
        cust = db.query(CustomerModel).get(customer_id)
        if not cust:
            raise HTTPException(404, "Customer not found")
        return CustomerOut.model_validate(cust)
    finally:
        db.close()


@app.post("/api/customers", response_model=CustomerOut, status_code=201)
def create_customer(data: CustomerCreate):
    db = SessionLocal()
    try:
        cust = CustomerModel(
            name=data.name,
            email=data.email,
            phone=data.phone,
            first_name=data.first_name,
            last_name=data.last_name,
        )
        db.add(cust)
        db.commit()
        db.refresh(cust)
        return CustomerOut.model_validate(cust)
    finally:
        db.close()


# ── Item / Product Endpoints ────────────────────────────────────────────────


@app.get("/api/items", response_model=List[ItemOut])
def list_items(search: str = Query("", description="Filter by name")):
    db = SessionLocal()
    try:
        q = db.query(ItemModel)
        if search:
            q = q.filter(ItemModel.name.ilike(f"%{search}%"))
        return [ItemOut.model_validate(i) for i in q.order_by(ItemModel.id).all()]
    finally:
        db.close()


@app.post("/api/items", response_model=ItemOut, status_code=201)
def create_item(data: ItemCreate):
    db = SessionLocal()
    try:
        item = ItemModel(name=data.name, description=data.description, price=data.price)
        db.add(item)
        db.commit()
        db.refresh(item)
        return ItemOut.model_validate(item)
    finally:
        db.close()


# ── Estimate Endpoints ──────────────────────────────────────────────────────


@app.get("/api/estimates", response_model=List[EstimateOut])
def list_estimates(
    status: str = Query("", description="Filter by status"),
    type: str = Query("", description="Filter by type: draft | active"),
    customer: str = Query("", description="Filter by customer name"),
    search: str = Query("", description="Search by number or customer"),
    date_from: str = Query("", description="Filter from date (YYYY-MM-DD)"),
    date_to: str = Query("", description="Filter to date (YYYY-MM-DD)"),
):
    db = SessionLocal()
    try:
        q = db.query(EstimateModel)

        if status:
            q = q.filter(EstimateModel.status == status)
        if type:
            q = q.filter(EstimateModel.type == type)
        if customer:
            q = q.join(CustomerModel).filter(CustomerModel.name == customer)
        if search:
            q = q.outerjoin(CustomerModel).filter(
                EstimateModel.number.ilike(f"%{search}%")
                | CustomerModel.name.ilike(f"%{search}%")
            )
        if date_from:
            q = q.filter(EstimateModel.date >= date_from)
        if date_to:
            q = q.filter(EstimateModel.date <= date_to)

        estimates = q.order_by(EstimateModel.date.desc()).all()
        return [_estimate_to_out(e) for e in estimates]
    finally:
        db.close()


@app.get("/api/estimates/{estimate_id}", response_model=EstimateOut)
def get_estimate(estimate_id: str):
    db = SessionLocal()
    try:
        est = None
        try:
            est = db.query(EstimateModel).get(int(estimate_id))
        except (ValueError, TypeError):
            pass
        if not est:
            est = db.query(EstimateModel).filter(
                EstimateModel.number == estimate_id
            ).first()
        if not est:
            raise HTTPException(404, "Estimate not found")
        return _estimate_to_out(est)
    finally:
        db.close()


@app.post("/api/estimates", response_model=EstimateOut, status_code=201)
def create_estimate(data: EstimateCreate):
    db = SessionLocal()
    try:
        number = data.number or _next_estimate_number(db)
        today = data.date or date.today().isoformat()
        valid = data.valid_until or (date.today() + timedelta(days=30)).isoformat()

        est = EstimateModel(
            number=number,
            date=today,
            valid_until=valid,
            status=data.status,
            type=data.type,
            customer_id=data.customer_id,
            notes=data.notes,
        )
        db.add(est)
        db.flush()

        for li in data.items:
            db.add(
                LineItemModel(
                    estimate_id=est.id,
                    item_id=li.item_id,
                    name=li.name,
                    description=li.description,
                    quantity=li.quantity,
                    price=li.price,
                )
            )

        db.commit()
        db.refresh(est)
        return _estimate_to_out(est)
    finally:
        db.close()


@app.put("/api/estimates/{estimate_id}", response_model=EstimateOut)
def update_estimate(estimate_id: int, data: EstimateUpdate):
    db = SessionLocal()
    try:
        est = db.query(EstimateModel).get(estimate_id)
        if not est:
            raise HTTPException(404, "Estimate not found")

        if data.date is not None:
            est.date = data.date
        if data.valid_until is not None:
            est.valid_until = data.valid_until
        if data.status is not None:
            est.status = data.status
        if data.type is not None:
            est.type = data.type
        if data.customer_id is not None:
            est.customer_id = data.customer_id
        if data.notes is not None:
            est.notes = data.notes

        if data.items is not None:
            for li in est.line_items:
                db.delete(li)
            db.flush()
            for li in data.items:
                db.add(
                    LineItemModel(
                        estimate_id=est.id,
                        item_id=li.item_id,
                        name=li.name,
                        description=li.description,
                        quantity=li.quantity,
                        price=li.price,
                    )
                )

        db.commit()
        db.refresh(est)
        return _estimate_to_out(est)
    finally:
        db.close()


@app.patch("/api/estimates/{estimate_id}/status", response_model=EstimateOut)
def update_estimate_status(estimate_id: str, data: StatusUpdate):
    db = SessionLocal()
    try:
        est = None
        try:
            est = db.query(EstimateModel).get(int(estimate_id))
        except (ValueError, TypeError):
            pass
        if not est:
            est = db.query(EstimateModel).filter(
                EstimateModel.number == estimate_id
            ).first()
        if not est:
            raise HTTPException(404, "Estimate not found")

        est.status = data.status
        est.type = "draft" if data.status == "Draft" else "active"
        db.commit()
        db.refresh(est)
        return _estimate_to_out(est)
    finally:
        db.close()


@app.delete("/api/estimates/{estimate_id}", status_code=204)
def delete_estimate(estimate_id: int):
    db = SessionLocal()
    try:
        est = db.query(EstimateModel).get(estimate_id)
        if not est:
            raise HTTPException(404, "Estimate not found")
        db.delete(est)
        db.commit()
    finally:
        db.close()


# ── Run ─────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
