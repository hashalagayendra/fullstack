"""Customer endpoints."""

from typing import List

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.customer import CustomerModel
from app.schemas.customer import CustomerCreate, CustomerOut

router = APIRouter(prefix="/api/customers", tags=["Customers"])


@router.get("", response_model=List[CustomerOut])
def list_customers(
    search: str = Query("", description="Filter by name"),
    db: Session = Depends(get_db),
):
    q = db.query(CustomerModel)
    if search:
        q = q.filter(CustomerModel.name.ilike(f"%{search}%"))
    return [CustomerOut.model_validate(c) for c in q.order_by(CustomerModel.id).all()]


@router.get("/{customer_id}", response_model=CustomerOut)
def get_customer(customer_id: int, db: Session = Depends(get_db)):
    cust = db.query(CustomerModel).get(customer_id)
    if not cust:
        raise HTTPException(404, "Customer not found")
    return CustomerOut.model_validate(cust)


@router.post("", response_model=CustomerOut, status_code=201)
def create_customer(data: CustomerCreate, db: Session = Depends(get_db)):
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
