from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship

from app.database import Base


class CustomerModel(Base):
    __tablename__ = "customers"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String, nullable=False)
    email = Column(String, default="")
    phone = Column(String, default="")
    first_name = Column(String, default="")
    last_name = Column(String, default="")

    estimates = relationship("EstimateModel", back_populates="customer_rel")
