"""Item / Product endpoints."""

from typing import List

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.item import ItemModel
from app.schemas.item import ItemCreate, ItemOut

router = APIRouter(prefix="/api/items", tags=["Items"])


@router.get("", response_model=List[ItemOut])
def list_items(
    search: str = Query("", description="Filter by name"),
    db: Session = Depends(get_db),
):
    q = db.query(ItemModel)
    if search:
        q = q.filter(ItemModel.name.ilike(f"%{search}%"))
    return [ItemOut.model_validate(i) for i in q.order_by(ItemModel.id).all()]


@router.post("", response_model=ItemOut, status_code=201)
def create_item(data: ItemCreate, db: Session = Depends(get_db)):
    item = ItemModel(name=data.name, description=data.description, price=data.price)
    db.add(item)
    db.commit()
    db.refresh(item)
    return ItemOut.model_validate(item)
