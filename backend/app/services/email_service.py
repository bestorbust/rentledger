import base64
import os

import httpx
from dotenv import load_dotenv


load_dotenv()


BREVO_API_KEY = os.getenv("BREVO_API_KEY")

SMTP_FROM_EMAIL = os.getenv(
    "SMTP_FROM_EMAIL"
)

SMTP_FROM_NAME = os.getenv(
    "SMTP_FROM_NAME",
    "Sahana Ladies PG",
)

BREVO_SEND_URL = (
    "https://api.brevo.com/v3/smtp/email"
)


async def send_receipt_email(
    recipient: str,
    resident_name: str,
    receipt_number: str,
    pdf_bytes: bytes,
):
    if not BREVO_API_KEY:
        raise RuntimeError(
            "BREVO_API_KEY is not configured."
        )

    if not SMTP_FROM_EMAIL:
        raise RuntimeError(
            "SMTP_FROM_EMAIL is not configured."
        )

    if not recipient:
        raise RuntimeError(
            "Recipient email is empty."
        )

    if not pdf_bytes:
        raise RuntimeError(
            "Receipt PDF is empty."
        )

    pdf_base64 = base64.b64encode(
        pdf_bytes
    ).decode("utf-8")

    payload = {
        "sender": {
            "name": SMTP_FROM_NAME,
            "email": SMTP_FROM_EMAIL,
        },

        "to": [
            {
                "email": recipient,
                "name": resident_name,
            }
        ],

        "subject": (
            f"Rent Payment Receipt - "
            f"{receipt_number}"
        ),

        "textContent": f"""Dear {resident_name},

Please find attached your rent payment receipt.

Receipt Number: {receipt_number}

This is a computer-generated receipt issued by Sahana Ladies PG.

Regards,
Sahana Ladies PG
Sahana Group
Bengaluru, Karnataka
""",

        "attachment": [
            {
                "content": pdf_base64,
                "name": (
                    f"{receipt_number}.pdf"
                ),
            }
        ],
    }

    headers = {
        "accept": "application/json",
        "api-key": BREVO_API_KEY,
        "content-type": "application/json",
    }

    timeout = httpx.Timeout(
        connect=10.0,
        read=30.0,
        write=30.0,
        pool=10.0,
    )

    async with httpx.AsyncClient(
        timeout=timeout
    ) as client:

        try:
            response = await client.post(
                BREVO_SEND_URL,
                json=payload,
                headers=headers,
            )

        except httpx.TimeoutException as exc:
            raise RuntimeError(
                "Brevo request timed out while "
                "sending the email."
            ) from exc

        except httpx.RequestError as exc:
            raise RuntimeError(
                f"Unable to connect to Brevo: {exc}"
            ) from exc

    if response.status_code >= 400:
        raise RuntimeError(
            "Brevo email failed: "
            f"{response.status_code} "
            f"{response.text}"
        )

    try:
        result = response.json()
    except Exception:
        result = {
            "raw_response": response.text
        }


    return result