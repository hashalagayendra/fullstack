"""Seed the database with initial data if tables are empty."""

from sqlalchemy.orm import Session

from app.models.customer import CustomerModel
from app.models.item import ItemModel
from app.models.estimate import EstimateModel, LineItemModel


def seed_database(db: Session) -> None:
    if db.query(CustomerModel).count() > 0:
        return

    # ── Customers ───────────────────────────────────────────────────────────

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

    # ── Items ───────────────────────────────────────────────────────────────

    items_data = [
        {"name": "HP Laptop", "description": "RTX 2050", "price": 450.00},
        {"name": "Pen", "description": "Blue Pen", "price": 10.00},
    ]
    for i in items_data:
        db.add(ItemModel(**i))

    # ── Estimates ───────────────────────────────────────────────────────────

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
