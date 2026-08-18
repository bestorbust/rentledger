# from fastapi import APIRouter, status
# from fastapi.responses import Response
# from fastapi import (
#     APIRouter,
#     File,
#     Form,
#     HTTPException,
#     UploadFile,
#     status,
# )

# from app.db.mongodb import get_database
# from app.services.email_service import send_receipt_email


# from app.services.receipt_service import (
#     generate_receipt,
#     get_receipts,
#     get_receipt,
# )
# from app.services.email_service import send_receipt_email
# from app.services.pdf_service import generate_receipt_pdf
from fastapi import (
    APIRouter,
    File,
    HTTPException,
    UploadFile,
    Form,
    status,
)

from app.db.mongodb import get_database

from app.services.receipt_service import (
    generate_receipt,
    get_receipts,
    get_receipt,
    validate_object_id,
)

from app.services.email_service import (
    send_receipt_email,
)
from app.schemas.receipt import (
    ReceiptCreate,
    ReceiptResponse,
)

router = APIRouter(
    prefix="/api/receipts",
    tags=["Receipts"],
)


@router.post(
    "",
    response_model=ReceiptResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_receipt(data: ReceiptCreate):
    return await generate_receipt(data)


@router.get(
    "",
    response_model=list[ReceiptResponse],
)
async def list_receipts():
    return await get_receipts()

@router.get(
    "/{receipt_id}/pdf",
)
async def download_receipt_pdf(receipt_id: str):
    receipt = await get_receipt(receipt_id)

    pdf_bytes = generate_receipt_pdf(receipt)

    filename = (
        f"{receipt['receipt_number']}.pdf"
    )

    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": (
                f'attachment; filename="{filename}"'
            )
        },
    )

@router.get(
    "/{receipt_id}",
    response_model=ReceiptResponse,
)
async def get_one_receipt(receipt_id: str):
    return await get_receipt(receipt_id)

@router.post("/send-email")
async def send_receipt_email_route(
    receipt_id: str = Form(...),
    file: UploadFile = File(...),
):
    db = get_database()

    object_id = validate_object_id(
        receipt_id
    )

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

    

    tenant = await db.tenants.find_one(
        {
            "_id": receipt["tenant_id"]
        }
    )

    if not tenant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tenant not found.",
        )

    email = tenant.get("email")

    if not email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Tenant email address not found.",
        )

    pdf_bytes = await file.read()

    if not pdf_bytes:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="PDF file is empty.",
        )

    await send_receipt_email(
        recipient=email,
        resident_name=receipt["resident_name"],
        receipt_number=receipt["receipt_number"],
        pdf_bytes=pdf_bytes,
    )

    return {
        "success": True,
        "message": "Receipt email sent successfully.",
        "email": email,
        "receipt_number": receipt["receipt_number"],
    }