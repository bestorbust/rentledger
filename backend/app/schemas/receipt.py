from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel, Field


class ReceiptCreate(BaseModel):
    tenant_id: str

    payment_date: date
    payment_mode: str = Field(
        ...,
        min_length=2,
        max_length=30,
    )


class ReceiptResponse(BaseModel):
    id: str
    receipt_number: str

    tenant_id: str

    resident_name: str
    room_no: str
    rent_amount: float
    sharing: str
    rent_month: str

    payment_date: date
    payment_mode: str

    status: str

    created_at: datetime
    updated_at: datetime