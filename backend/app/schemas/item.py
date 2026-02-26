from pydantic import BaseModel


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
