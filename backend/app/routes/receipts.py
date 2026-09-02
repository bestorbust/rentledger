from fastapi import (
    APIRouter,
    File,
    Form,
    UploadFile,
    status,
)

from app.services.receipt_service import (
    get_monthly_status,
    generate_and_send_receipt,
    delete_tenant_monthly_receipt,
)


router = APIRouter(
    prefix="/api/receipts",
    tags=["Receipts"],
)


 # MONTHLY RECEIPT STATUS


@router.get(
    "/monthly/{rent_month}/status",
)
async def monthly_status(
    rent_month: str,
):
    return await get_monthly_status(
        rent_month=rent_month,
    )


 # GENERATE + SEND RECEIPT

@router.post(
    "/generate-and-send",
    status_code=status.HTTP_200_OK,
)
async def generate_and_send(
    tenant_id: str = Form(...),
    rent_month: str = Form(...),
    payment_date: str = Form(...),
    payment_mode: str = Form(...),
    receipt_number: str = Form(...),
    pdf: UploadFile = File(...),
):
    pdf_bytes = await pdf.read()

    return await generate_and_send_receipt(
        tenant_id=tenant_id,
        rent_month=rent_month,
        
        payment_date=payment_date,
        payment_mode=payment_mode,
        receipt_number=receipt_number,
        pdf_bytes=pdf_bytes,
    )


 # DELETE RECEIPT

@router.delete(
    "/tenant/{tenant_id}/month/{rent_month}",
    status_code=status.HTTP_200_OK,
)
async def delete_receipt(
    tenant_id: str,
    rent_month: str,
):
    return await delete_tenant_monthly_receipt(
        tenant_id=tenant_id,
        rent_month=rent_month,
    )