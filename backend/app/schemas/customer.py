from pydantic import BaseModel


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
