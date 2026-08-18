import os
import smtplib
from email.message import EmailMessage
from dotenv import load_dotenv  # 1. Import load_dotenv

# 2. Load the .env file immediately
load_dotenv() 

# Now these will work
SMTP_HOST = os.getenv("SMTP_HOST")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USERNAME = os.getenv("SMTP_USERNAME")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD")
SMTP_FROM_EMAIL = os.getenv("SMTP_FROM_EMAIL")
SMTP_FROM_NAME = os.getenv("SMTP_FROM_NAME", "Sahana Ladies PG")


async def send_receipt_email(
    recipient: str,
    resident_name: str,
    receipt_number: str,
    pdf_bytes: bytes,
):
    if not SMTP_HOST:
        raise RuntimeError(
            "SMTP_HOST is not configured."
        )

    if not SMTP_USERNAME:
        raise RuntimeError(
            "SMTP_USERNAME is not configured."
        )

    if not SMTP_PASSWORD:
        raise RuntimeError(
            "SMTP_PASSWORD is not configured."
        )

    if not SMTP_FROM_EMAIL:
        raise RuntimeError(
            "SMTP_FROM_EMAIL is not configured."
        )

    message = EmailMessage()

    message["Subject"] = (
        f"Rent Payment Receipt - "
        f"{receipt_number}"
    )

    message["From"] = (
        f"{SMTP_FROM_NAME} "
        f"<{SMTP_FROM_EMAIL}>"
    )

    message["To"] = recipient

    message.set_content(
        f"""Dear {resident_name},

Please find attached your rent payment receipt.

Receipt Number: {receipt_number}

This is a computer-generated receipt issued by Sahana Ladies PG.

Regards,
Sahana Ladies PG
Sahana Group
Bengaluru, Karnataka
"""
    )

    message.add_attachment(
        pdf_bytes,
        maintype="application",
        subtype="pdf",
        filename=f"{receipt_number}.pdf",
    )

    with smtplib.SMTP(
        SMTP_HOST,
        SMTP_PORT,
    ) as server:

        server.starttls()

        server.login(
            SMTP_USERNAME,
            SMTP_PASSWORD,
        )

        server.send_message(
            message
        )