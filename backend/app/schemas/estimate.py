from __future__ import annotations

from typing import List, Optional

from pydantic import BaseModel

from app.schemas.customer import CustomerOut


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
