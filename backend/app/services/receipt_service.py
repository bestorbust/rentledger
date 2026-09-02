from datetime import datetime, timezone

from bson import ObjectId
from fastapi import HTTPException, status
from pymongo import ReturnDocument

from app.db.mongodb import get_database
from app.services.email_service import send_receipt_email
from app.services.tenant_service import get_tenant

 
def validate_object_id(value: str):
    if not ObjectId.is_valid(value):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid ID: {value}",
        )

    return ObjectId(value)


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

        "tenant_rent_month": document.get(
            "tenant_rent_month"
        ),

        "payment_date": document["payment_date"],
        "payment_mode": document["payment_mode"],

        "status": document["status"],

        "email_sent": document.get(
            "email_sent",
            False,
        ),

        "email_sent_at": document.get(
            "email_sent_at"
        ),

        "created_at": document["created_at"],
        "updated_at": document["updated_at"],
    }
    
def serialize_tenant_for_receipt(tenant):
    return {
        "tenant_id": str(tenant["_id"]),

        "name": tenant["name"],
        "room": tenant["room"],
        "rent": tenant["rent"],
        "sharing": tenant["sharing"],
        "tenant_rent_month": tenant.get(
            "rent_month"
        ),

        "mobile": tenant["mobile"],
        "email": tenant.get("email"),
    }


 # RECEIPT NUMBER
 
async def get_next_receipt_number():
    db = get_database()

    now = datetime.now(timezone.utc)

    counter = await db.counters.find_one_and_update(
        {
            "_id": "rent_receipt"
        },
        {
            "$inc": {
                "sequence": 1
            },
            "$set": {
                "updated_at": now
            },
        },
        upsert=True,
        return_document=ReturnDocument.AFTER,
    )

    return (
        f"SLP-{now.year}-"
        f"{counter['sequence']:06d}"
    )


 # MONTHLY STATUS
 
async def get_monthly_status(
    rent_month: str,
):
    db = get_database()

    tenants_collection = db.tenants
    receipts_collection = db.receipts

    cursor = tenants_collection.find(
        {
            "is_active": True
        }
    ).sort(
        [
            ("created_at", -1)
        ]
    )

    tenants = []

    async for tenant in cursor:
        tenants.append(tenant)

    
    receipt_cursor = receipts_collection.find(
        {
            "rent_month": rent_month,
            "status": "SENT",
        }
    )

    existing_receipts = []

    async for receipt in receipt_cursor:
        existing_receipts.append(receipt)

    generated_map = {
        str(receipt["tenant_id"]): receipt
        for receipt in existing_receipts
    }

    available = []
    already_generated = []

    
    for tenant in tenants:

        tenant_id = str(
            tenant["_id"]
        )

        tenant_data = (
            serialize_tenant_for_receipt(
                tenant
            )
        )

        if tenant_id in generated_map:

            receipt = generated_map[
                tenant_id
            ]

            already_generated.append(
                {
                    **tenant_data,

                    "receipt_number":
                        receipt[
                            "receipt_number"
                        ],

                    "receipt_id":
                        str(
                            receipt["_id"]
                        ),

                    "email_sent":
                        receipt.get(
                            "email_sent",
                            False,
                        ),

                    "status":
                        receipt.get(
                            "status"
                        ),
                }
            )

        else:

            available.append(
                tenant_data
            )

    return {
        "rent_month": rent_month,
        "available": available,
        "already_generated": already_generated,
    }


async def generate_and_send_receipt(
    tenant_id: str,
    rent_month: str,
    payment_date: str,
    payment_mode: str,
    receipt_number: str,
    pdf_bytes: bytes,
):

    tenant_object_id = validate_object_id(tenant_id)

    if not pdf_bytes:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Receipt PDF is empty.",
        )

    db = get_database()

    tenant = await db.tenants.find_one({
        "_id": tenant_object_id,
        "is_active": True,
    })

    if not tenant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Active tenant not found.",
        )

    tenant_rent_month = tenant.get("rent_month")
    recipient_email = tenant.get("email")

    if not recipient_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Tenant does not have an email address.",
        )

    existing = await db.receipts.find_one({
        "tenant_id": tenant_object_id,
        "rent_month": rent_month,
        "status": "SENT",
    })

    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"A receipt has already been sent for {rent_month}.",
        )

    # -------- EMAIL --------

    try:
        result = await send_receipt_email(
            recipient=recipient_email,
            resident_name=tenant["name"],
            receipt_number=receipt_number,
            pdf_bytes=pdf_bytes,
        )

    except Exception as exc:

        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Receipt email could not be sent: {str(exc)}",
        )

    # -------- SAVE --------
    sent_at = datetime.now(timezone.utc)

    receipt_document = {
        "receipt_number": receipt_number,
        "tenant_id": tenant_object_id,

        "resident_name": tenant["name"],
        "room_no": tenant["room"],
        "rent_amount": tenant["rent"],
        "sharing": tenant["sharing"],

        "rent_month": rent_month,
        "tenant_rent_month": tenant_rent_month,

        "payment_date": payment_date,
        "payment_mode": payment_mode,

        "status": "SENT",
        "email_sent": True,
        "email_sent_at": sent_at,

        "created_at": sent_at,
        "updated_at": sent_at,
    }


    try:
        result = await db.receipts.insert_one(receipt_document)
        receipt_document["_id"] = result.inserted_id


    except Exception as exc:

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Receipt could not be saved: {str(exc)}",
        )


    return serialize_receipt(receipt_document)

 # DELETE TENANT MONTHLY RECEIPT
 
async def delete_tenant_monthly_receipt(
    tenant_id: str,
    rent_month: str,
):
    db = get_database()

    tenant_object_id = validate_object_id(
        tenant_id
    )

    result = await db.receipts.delete_one(
        {
            "tenant_id":
                tenant_object_id,

            "rent_month":
                rent_month,
        }
    )

    if result.deleted_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=(
                f"No receipt found for tenant "
                f"{tenant_id} for {rent_month}."
            ),
        )

    return {
        "message":
            "Receipt deleted successfully.",

        "tenant_id":
            tenant_id,

        "rent_month":
            rent_month,
    }