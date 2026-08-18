from datetime import datetime, timezone

from bson import ObjectId
from fastapi import HTTPException, status

from app.db.mongodb import get_database


def serialize_receipt(document):
    return {
        "id": str(document["_id"]),
        "receipt_number": document["receipt_number"],
        "tenant_id": str(document["tenant_id"]),
        "resident_name": document["resident_name"],
        "room_no": document["room_no"],
        "rent_amount": document["rent_amount"],
        "sharing": document["sharing"],
        "rent_month": document["rent_month"],
        "payment_date": document["payment_date"],
        "payment_mode": document["payment_mode"],
        "status": document["status"],
        "created_at": document["created_at"],
        "updated_at": document["updated_at"],
    }


def validate_object_id(value: str):
    if not ObjectId.is_valid(value):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid ID.",
        )

    return ObjectId(value)


async def generate_receipt(data):
    db = get_database()

    tenant_id = validate_object_id(data.tenant_id)

    # Get active tenant
    tenant = await db.tenants.find_one(
        {
            "_id": tenant_id,
            "is_active": True,
        }
    )

    if not tenant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Active tenant not found.",
        )

    # Prevent duplicate receipt for the same tenant/month.
    existing_receipt = await db.receipts.find_one(
        {
            "tenant_id": tenant_id,
            "rent_month": tenant["rent_month"],
            "status": {
                "$ne": "VOID"
            },
        }
    )

    if existing_receipt:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=(
                "A receipt already exists for this tenant "
                f"for {tenant['rent_month']}."
            ),
        )

    # Generate receipt sequence number.
    counter = await db.counters.find_one_and_update(
        {
            "_id": "receipt_sequence"
        },
        {
            "$inc": {
                "value": 1
            }
        },
        upsert=True,
        return_document=True,
    )

    sequence = counter["value"]

    # Receipt number uses the payment year.
    year = data.payment_date.year

    receipt_number = f"SLP-{year}-{sequence:06d}"

    now = datetime.now(timezone.utc)

    # Convert Python date → MongoDB-compatible datetime.
    payment_datetime = datetime.combine(
        data.payment_date,
        datetime.min.time(),
        tzinfo=timezone.utc,
    )

    document = {
        "receipt_number": receipt_number,

        # Tenant reference
        "tenant_id": tenant_id,

        # Snapshot tenant information
        "resident_name": tenant["name"],
        "room_no": tenant["room"],
        "rent_amount": tenant["rent"],
        "sharing": tenant["sharing"],
        "rent_month": tenant["rent_month"],

        # Payment information
        "payment_date": payment_datetime,
        "payment_mode": data.payment_mode,

        # Receipt status
        "status": "GENERATED",

        # Audit timestamps
        "created_at": now,
        "updated_at": now,
    }

    # Save receipt
    result = await db.receipts.insert_one(document)

    # Retrieve created receipt
    created = await db.receipts.find_one(
        {
            "_id": result.inserted_id
        }
    )

    return serialize_receipt(created)


async def get_receipts():
    db = get_database()

    cursor = db.receipts.find(
        {}
    ).sort(
        "created_at",
        -1,
    )

    receipts = []

    async for document in cursor:
        receipts.append(
            serialize_receipt(document)
        )

    return receipts


async def get_receipt(receipt_id: str):
    db = get_database()

    object_id = validate_object_id(receipt_id)

    receipt = await db.receipts.find_one(
        {
            "_id": object_id
        }
    )

    if not receipt:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Receipt not found.",
        )

    return serialize_receipt(receipt)