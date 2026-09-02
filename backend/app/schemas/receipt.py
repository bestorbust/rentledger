from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel, Field


 # MONTHLY RECEIPT GENERATION
 
class MonthlyReceiptCreate(BaseModel):
    rent_month: str = Field(
        ...,
        pattern=r"^\d{4}-\d{2}$",
        description="Rent month in YYYY-MM format",
    )

    payment_date: date

    payment_mode: str = Field(
        ...,
        min_length=2,
        max_length=30,
    )

    tenant_ids: list[str] = Field(
        ...,
        min_length=1,
        description="Selected active tenant IDs",
    )


 # RECEIPT RESPONSE
 
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

    email_sent: bool
    email_sent_at: Optional[datetime] = None

    created_at: datetime
    updated_at: datetime


 # MONTHLY STATUS RESPONSE
 
class MonthlyReceiptResponse(BaseModel):
    rent_month: str
    payment_date: date
    payment_mode: str

    requested_count: int
    generated_count: int

    receipts: list[ReceiptResponse]