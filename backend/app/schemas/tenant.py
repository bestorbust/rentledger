from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator


class TenantCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    room: str = Field(..., min_length=1, max_length=20)
    rent: float = Field(..., gt=0)
    sharing: str = Field(..., min_length=1, max_length=30)
    rent_month: str = Field(..., min_length=1, max_length=20)
    mobile: str = Field(..., min_length=10, max_length=20)
    email: Optional[EmailStr] = None

    @field_validator("rent_month")
    @classmethod
    def validate_rent_month(cls, value: str) -> str:
        if value in {"ongoing", "previous"}:
            return value

        try:
            datetime.strptime(value, "%Y-%m")
            return value
        except ValueError:
            raise ValueError(
                "rent_month must be 'ongoing', 'previous', or in YYYY-MM format"
            )


class TenantUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=100)
    room: Optional[str] = Field(None, min_length=1, max_length=20)
    rent: Optional[float] = Field(None, gt=0)
    sharing: Optional[str] = Field(None, min_length=1, max_length=30)
    rent_month: Optional[str] = Field(None, min_length=1, max_length=20)
    mobile: Optional[str] = Field(None, min_length=10, max_length=20)
    email: Optional[EmailStr] = None

    @field_validator("rent_month")
    @classmethod
    def validate_rent_month(cls, value: str) -> str:
        if value in {"ongoing", "previous"}:
            return value

        try:
            datetime.strptime(value, "%Y-%m")
            return value
        except ValueError:
            raise ValueError(
                "rent_month must be 'ongoing', 'previous', or in YYYY-MM format"
            )


class TenantResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    name: str
    room: str
    rent: float
    sharing: str
    rent_month: str
    mobile: str
    email: Optional[EmailStr] = None
    is_active: bool
    created_at: datetime
    updated_at: datetime