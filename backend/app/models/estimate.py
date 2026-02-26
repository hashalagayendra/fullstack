from sqlalchemy import Column, Float, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from app.database import Base


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
