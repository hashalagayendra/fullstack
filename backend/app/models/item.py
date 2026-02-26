from sqlalchemy import Column, Float, Integer, String

from app.database import Base


class ItemModel(Base):
    __tablename__ = "items"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String, nullable=False)
    description = Column(String, default="")
    price = Column(Float, default=0.0)
