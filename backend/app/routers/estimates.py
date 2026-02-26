"""Estimate endpoints."""

from __future__ import annotations

from datetime import date, timedelta
from typing import List

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.customer import CustomerModel
from app.models.estimate import EstimateModel, LineItemModel
from app.schemas.customer import CustomerOut
from app.schemas.estimate import (
    EstimateCreate,
    EstimateOut,
    EstimateUpdate,
    LineItemOut,
    StatusUpdate,
)

router = APIRouter(prefix="/api/estimates", tags=["Estimates"])


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


# ── Endpoints ───────────────────────────────────────────────────────────────


@router.get("", response_model=List[EstimateOut])
def list_estimates(
    status: str = Query("", description="Filter by status"),
    type: str = Query("", description="Filter by type: draft | active"),
    customer: str = Query("", description="Filter by customer name"),
    search: str = Query("", description="Search by number or customer"),
    date_from: str = Query("", description="Filter from date (YYYY-MM-DD)"),
    date_to: str = Query("", description="Filter to date (YYYY-MM-DD)"),
    db: Session = Depends(get_db),
):
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


@router.get("/{estimate_id}", response_model=EstimateOut)
def get_estimate(estimate_id: str, db: Session = Depends(get_db)):
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


@router.post("", response_model=EstimateOut, status_code=201)
def create_estimate(data: EstimateCreate, db: Session = Depends(get_db)):
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


@router.put("/{estimate_id}", response_model=EstimateOut)
def update_estimate(
    estimate_id: int, data: EstimateUpdate, db: Session = Depends(get_db)
):
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


@router.patch("/{estimate_id}/status", response_model=EstimateOut)
def update_estimate_status(
    estimate_id: str, data: StatusUpdate, db: Session = Depends(get_db)
):
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


@router.delete("/{estimate_id}", status_code=204)
def delete_estimate(estimate_id: int, db: Session = Depends(get_db)):
    est = db.query(EstimateModel).get(estimate_id)
    if not est:
        raise HTTPException(404, "Estimate not found")
    db.delete(est)
    db.commit()
