from io import BytesIO
from datetime import date, datetime
from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.pdfbase.pdfmetrics import stringWidth
from reportlab.pdfgen import canvas
from reportlab.lib.utils import ImageReader


# ============================================================
# ASSETS
# ============================================================

# pdf_service.py
# app/
# ├── assets/
# │   ├── sahana_logo.png
# │   └── sahana_seal.png
# └── services/
#     └── pdf_service.py

APP_DIR = Path(__file__).resolve().parents[1]
ASSETS_DIR = APP_DIR / "assets"

LOGO_PATH = ASSETS_DIR / "sahana_logo.png"
SEAL_PATH = ASSETS_DIR / "sahana_seal.png"


# ============================================================
# PAGE
# ============================================================

PAGE_WIDTH, PAGE_HEIGHT = A4


# ============================================================
# OFFICIAL COLOR PALETTE
# ============================================================

NAVY = colors.HexColor("#182438")
NAVY_DARK = colors.HexColor("#111B2B")
NAVY_LIGHT = colors.HexColor("#26364F")

GOLD = colors.HexColor("#B69A5A")
GOLD_LIGHT = colors.HexColor("#E6D9B8")
GOLD_PALE = colors.HexColor("#FBF8F0")

INK = colors.HexColor("#17202D")
TEXT = colors.HexColor("#374151")
MUTED = colors.HexColor("#718096")

BORDER = colors.HexColor("#D9DEE5")
SURFACE = colors.HexColor("#F7F8FA")
WHITE = colors.white

GREEN = colors.HexColor("#216E49")
GREEN_LIGHT = colors.HexColor("#EAF5EE")


# ============================================================
# FORMATTING
# ============================================================

def money(value) -> str:
    """
    Format amount as Indian currency.
    """

    try:
        value = float(value)
    except (TypeError, ValueError):
        value = 0

    return f"₹{value:,.2f}"


def format_date(value) -> str:
    """
    Format date/datetime for receipt.
    """

    if not value:
        return "—"

    if isinstance(value, str):
        try:
            value = datetime.fromisoformat(
                value.replace("Z", "+00:00")
            )
        except ValueError:
            return value

    return value.strftime("%d %B %Y")


def format_month(value: str) -> str:
    """
    Format rent month.

    Supported:
        ongoing  -> Ongoing
        previous -> Previous
        YYYY-MM  -> August 2026
    """

    if not value:
        return "—"

    value = str(value).strip()

    special_values = {
        "ongoing": "Ongoing",
        "previous": "Previous",
    }

    normalized = value.lower()

    if normalized in special_values:
        return special_values[normalized]

    try:
        year, month = value.split("-")

        month = int(month)

        if month < 1 or month > 12:
            return value

        month_names = [
            "January",
            "February",
            "March",
            "April",
            "May",
            "June",
            "July",
            "August",
            "September",
            "October",
            "November",
            "December",
        ]

        return f"{month_names[month - 1]} {year}"

    except (ValueError, AttributeError):
        return value


# ============================================================
# AMOUNT IN WORDS
# ============================================================

def amount_in_words(amount: float) -> str:
    """
    Convert INR amount into words.

    Supports:
    Crores
    Lakhs
    Thousands
    Hundreds
    Paise
    """

    ones = [
        "",
        "One",
        "Two",
        "Three",
        "Four",
        "Five",
        "Six",
        "Seven",
        "Eight",
        "Nine",
        "Ten",
        "Eleven",
        "Twelve",
        "Thirteen",
        "Fourteen",
        "Fifteen",
        "Sixteen",
        "Seventeen",
        "Eighteen",
        "Nineteen",
    ]

    tens = [
        "",
        "",
        "Twenty",
        "Thirty",
        "Forty",
        "Fifty",
        "Sixty",
        "Seventy",
        "Eighty",
        "Ninety",
    ]

    def two_digits(number):
        if number < 20:
            return ones[number]

        return (
            tens[number // 10]
            + (
                " " + ones[number % 10]
                if number % 10
                else ""
            )
        )

    def three_digits(number):
        if number < 100:
            return two_digits(number)

        result = f"{ones[number // 100]} Hundred"

        remainder = number % 100

        if remainder:
            result += f" {two_digits(remainder)}"

        return result

    def convert(number):
        if number == 0:
            return "Zero"

        parts = []

        crore = number // 10_000_000
        number %= 10_000_000

        lakh = number // 100_000
        number %= 100_000

        thousand = number // 1_000
        number %= 1_000

        if crore:
            parts.append(
                f"{three_digits(crore)} Crore"
            )

        if lakh:
            parts.append(
                f"{three_digits(lakh)} Lakh"
            )

        if thousand:
            parts.append(
                f"{three_digits(thousand)} Thousand"
            )

        if number:
            parts.append(
                three_digits(number)
            )

        return " ".join(parts)

    amount = float(amount)

    rupees = int(amount)

    paise = round(
        (amount - rupees) * 100
    )

    result = f"{convert(rupees)} Rupees"

    if paise:
        result += (
            f" and {convert(paise)} Paise"
        )

    return result + " Only"


# ============================================================
# DRAWING HELPERS
# ============================================================

def draw_round_rect(
    pdf,
    x,
    y,
    width,
    height,
    radius=5,
    fill=None,
    stroke=None,
    line_width=1,
):
    pdf.setLineWidth(line_width)

    if fill:
        pdf.setFillColor(fill)

    if stroke:
        pdf.setStrokeColor(stroke)

    pdf.roundRect(
        x,
        y,
        width,
        height,
        radius,
        fill=1 if fill else 0,
        stroke=1 if stroke else 0,
    )


def draw_label_value(
    pdf,
    x,
    y,
    label,
    value,
    value_size=10,
):
    pdf.setFillColor(MUTED)

    pdf.setFont(
        "Helvetica-Bold",
        7,
    )

    pdf.drawString(
        x,
        y,
        label.upper(),
    )

    pdf.setFillColor(INK)

    pdf.setFont(
        "Helvetica-Bold",
        value_size,
    )

    pdf.drawString(
        x,
        y - 14,
        str(value),
    )



def draw_rupee_symbol(pdf, x, y, size=22, color=NAVY):
    """Draw a clean Indian Rupee symbol using vector strokes only."""
    pdf.saveState()

    pdf.setStrokeColor(color)
    pdf.setLineWidth(max(1.0, size * 0.075))
    pdf.setLineCap(1)
    pdf.setLineJoin(1)

    # Top horizontal bar
    pdf.line(
        x,
        y + size * 0.84,
        x + size * 0.68,
        y + size * 0.84,
    )

    # Middle horizontal bar
    pdf.line(
        x,
        y + size * 0.68,
        x + size * 0.58,
        y + size * 0.68,
    )

    # Curved upper body and descending stem
    path = pdf.beginPath()
    path.moveTo(
        x + size * 0.49,
        y + size * 0.84,
    )
    path.curveTo(
        x + size * 0.60,
        y + size * 0.75,
        x + size * 0.59,
        y + size * 0.58,
        x + size * 0.46,
        y + size * 0.46,
    )
    path.curveTo(
        x + size * 0.36,
        y + size * 0.36,
        x + size * 0.26,
        y + size * 0.27,
        x + size * 0.18,
        y + size * 0.15,
    )
    pdf.drawPath(path, stroke=1, fill=0)

    # Bottom diagonal stroke
    pdf.line(
        x + size * 0.17,
        y + size * 0.15,
        x + size * 0.61,
        y + size * 0.15,
    )

    pdf.restoreState()


def draw_horizontal_line(
    pdf,
    x1,
    y,
    x2,
    color=BORDER,
    width=0.7,
):
    pdf.setStrokeColor(color)
    pdf.setLineWidth(width)

    pdf.line(
        x1,
        y,
        x2,
        y,
    )


def draw_image_contain(
    pdf,
    path,
    x,
    y,
    width,
    height,
):
    """
    Draw PNG/JPG while preserving aspect ratio.
    """

    if not path.exists():
        return False

    image = ImageReader(str(path))

    image_width, image_height = image.getSize()

    scale = min(
        width / image_width,
        height / image_height,
    )

    draw_width = image_width * scale
    draw_height = image_height * scale

    draw_x = x + (width - draw_width) / 2
    draw_y = y + (height - draw_height) / 2

    pdf.drawImage(
        image,
        draw_x,
        draw_y,
        width=draw_width,
        height=draw_height,
        preserveAspectRatio=True,
        mask="auto",
    )

    return True


def draw_section_ribbon(
    pdf,
    x,
    y,
    text,
    width=54 * mm,
):
    """
    Navy ribbon used for PAYMENT DETAILS.
    """

    height = 9 * mm

    pdf.setFillColor(NAVY)

    points = [
        x,
        y,

        x + width - 4 * mm,
        y,

        x + width,
        y + height / 2,

        x + width - 4 * mm,
        y + height,

        x,
        y + height,

        x + 4 * mm,
        y + height / 2,
    ]

    path = pdf.beginPath()

    path.moveTo(
        points[0],
        points[1],
    )

    for i in range(
        2,
        len(points),
        2,
    ):
        path.lineTo(
            points[i],
            points[i + 1],
        )

    path.close()

    pdf.drawPath(
        path,
        fill=1,
        stroke=0,
    )

    pdf.setFillColor(WHITE)

    pdf.setFont(
        "Helvetica-Bold",
        8.5,
    )

    pdf.drawCentredString(
        x + width / 2,
        y + 2.8 * mm,
        text,
    )


def draw_paid_badge(
    pdf,
    x,
    y,
    width,
    height,
):
    pdf.setFillColor(GREEN_LIGHT)
    pdf.setStrokeColor(GREEN)

    pdf.setLineWidth(0.8)

    pdf.roundRect(
        x,
        y,
        width,
        height,
        4,
        fill=1,
        stroke=1,
    )

    # Circle
    circle_x = x + 9 * mm
    circle_y = y + height / 2

    pdf.setFillColor(GREEN)

    pdf.circle(
        circle_x,
        circle_y,
        3.2 * mm,
        fill=1,
        stroke=0,
    )

    # Check
    pdf.setStrokeColor(WHITE)
    pdf.setLineWidth(1.2)

    pdf.line(
        circle_x - 1.3 * mm,
        circle_y,
        circle_x - 0.2 * mm,
        circle_y - 1.2 * mm,
    )

    pdf.line(
        circle_x - 0.2 * mm,
        circle_y - 1.2 * mm,
        circle_x + 1.8 * mm,
        circle_y + 1.4 * mm,
    )

    pdf.setFillColor(GREEN)

    pdf.setFont(
        "Helvetica-Bold",
        9,
    )

    pdf.drawString(
        x + 15 * mm,
        y + 3.5 * mm,
        "PAID",
    )


def draw_footer_bar(
    pdf,
    x,
    y,
    width,
):
    height = 8 * mm

    pdf.setFillColor(NAVY)

    pdf.rect(
        x,
        y,
        width,
        height,
        fill=1,
        stroke=0,
    )

    pdf.setFillColor(GOLD)

    pdf.circle(
        x + 7 * mm,
        y + height / 2,
        1.1 * mm,
        fill=1,
        stroke=0,
    )

    pdf.circle(
        x + width - 7 * mm,
        y + height / 2,
        1.1 * mm,
        fill=1,
        stroke=0,
    )

    pdf.setFillColor(WHITE)

    pdf.setFont(
        "Helvetica-Bold",
        7.5,
    )

    pdf.drawCentredString(
        x + width / 2,
        y + 2.8 * mm,
        "THANK YOU FOR YOUR PAYMENT",
    )


# ============================================================
# MAIN PDF GENERATOR
# ============================================================

def generate_receipt_pdf(
    receipt: dict,
) -> bytes:

    buffer = BytesIO()

    pdf = canvas.Canvas(
        buffer,
        pagesize=A4,
    )

    pdf.setTitle(
        f"Rent Receipt - "
        f"{receipt['receipt_number']}"
    )

    pdf.setAuthor(
        "RentLedger"
    )

    # ========================================================
    # PAGE
    # ========================================================

    pdf.setFillColor(
        colors.HexColor("#F2F3F5")
    )

    pdf.rect(
        0,
        0,
        PAGE_WIDTH,
        PAGE_HEIGHT,
        fill=1,
        stroke=0,
    )

    # ========================================================
    # DOCUMENT
    # ========================================================

    margin = 9 * mm

    document_x = margin
    document_y = margin

    document_width = (
        PAGE_WIDTH - 2 * margin
    )

    document_height = (
        PAGE_HEIGHT - 2 * margin
    )

    # White paper
    pdf.setFillColor(WHITE)

    pdf.roundRect(
        document_x,
        document_y,
        document_width,
        document_height,
        5,
        fill=1,
        stroke=0,
    )

    # Thin official border
    pdf.setStrokeColor(
        NAVY
    )

    pdf.setLineWidth(0.8)

    pdf.roundRect(
        document_x,
        document_y,
        document_width,
        document_height,
        5,
        fill=0,
        stroke=1,
    )

    # ========================================================
    # LEFT NAVY ACCENT
    # ========================================================

    pdf.setFillColor(NAVY)

    pdf.rect(
        document_x,
        document_y + document_height - 58 * mm,
        10 * mm,
        58 * mm,
        fill=1,
        stroke=0,
    )

    # Gold inner accent
    pdf.setFillColor(GOLD)

    pdf.rect(
        document_x + 10 * mm,
        document_y + document_height - 58 * mm,
        1.5 * mm,
        58 * mm,
        fill=1,
        stroke=0,
    )

    # ========================================================
    # HEADER
    # ========================================================

    header_top = (
        document_y
        + document_height
        - 10 * mm
    )

    header_bottom = (
        header_top
        - 48 * mm
    )

    # --------------------------------------------------------
    # LOGO
    # --------------------------------------------------------

    logo_x = (
        document_x + 14 * mm
    )

    logo_y = (
        header_bottom + 5 * mm
    )

    draw_image_contain(
        pdf,
        LOGO_PATH,
        logo_x,
        logo_y,
        46 * mm,
        40 * mm,
    )

    # --------------------------------------------------------
    # Vertical separator
    # --------------------------------------------------------

    separator_x = (
        document_x + 60 * mm
    )

    pdf.setStrokeColor(
        GOLD
    )

    pdf.setLineWidth(0.8)

    pdf.line(
        separator_x,
        header_bottom + 9 * mm,
        separator_x,
        header_top - 3 * mm,
    )

    # --------------------------------------------------------
    # Company text
    # --------------------------------------------------------

    brand_x = (
        separator_x + 8 * mm
    )

    pdf.setFillColor(
        NAVY
    )

    pdf.setFont(
        "Times-Bold",
        11,
    )

    pdf.drawString(
        brand_x,
        header_top - 12 * mm,
        "SAHANA GROUP",
    )

    pdf.setFillColor(
        NAVY
    )

    pdf.setFont(
        "Times-Bold",
        22,
    )

    pdf.drawString(
        brand_x,
        header_top - 23 * mm,
        "SAHANA LADIES PG",
    )

    pdf.setFillColor(
        TEXT
    )

    pdf.setFont(
        "Helvetica",
        8.5,
    )

    pdf.drawString(
        brand_x,
        header_top - 30 * mm,
        "PREMIUM RESIDENTIAL ACCOMMODATION",
    )

    # Gold decorative line
    draw_horizontal_line(
        pdf,
        brand_x,
        header_top - 35 * mm,
        brand_x + 45 * mm,
        GOLD,
        1,
    )

    # Location
    pdf.setFillColor(
        TEXT
    )

    pdf.setFont(
        "Helvetica",
        8,
    )

    pdf.drawString(
        brand_x,
        header_top - 42 * mm,
        "Bengaluru, Karnataka, India",
    )

    # --------------------------------------------------------
    # RECEIPT NUMBER
    # --------------------------------------------------------

    right_x = (
        document_x
        + document_width
        - 9 * mm
    )

    pdf.setFillColor(
        MUTED
    )

    pdf.setFont(
        "Helvetica-Bold",
        7,
    )

    pdf.drawRightString(
        right_x,
        header_top - 9 * mm,
        "RECEIPT NUMBER",
    )

    pdf.setFillColor(
        NAVY
    )

    pdf.setFont(
        "Helvetica-Bold",
        11,
    )

    pdf.drawRightString(
        right_x,
        header_top - 16 * mm,
        str(
            receipt["receipt_number"]
        ),
    )

    # Paid badge
    badge_width = 34 * mm
    badge_height = 12 * mm

    draw_paid_badge(
        pdf,
        right_x - badge_width,
        header_top - 35 * mm,
        badge_width,
        badge_height,
    )

    # ========================================================
    # TITLE
    # ========================================================

    title_y = (
        header_bottom - 13 * mm
    )

    content_x = (
        document_x + 18 * mm
    )

    content_right = (
        document_x
        + document_width
        - 18 * mm
    )

    content_width = (
        content_right - content_x
    )

    pdf.setFillColor(
        NAVY
    )

    pdf.setFont(
        "Times-Bold",
        21,
    )

    pdf.drawCentredString(
        PAGE_WIDTH / 2,
        title_y,
        "RENT PAYMENT RECEIPT",
    )

    pdf.setFillColor(
        MUTED
    )

    pdf.setFont(
        "Helvetica",
        8.5,
    )

    pdf.drawCentredString(
        PAGE_WIDTH / 2,
        title_y - 8 * mm,
        "Official acknowledgement of rent received",
    )

    # Gold ornament
    draw_horizontal_line(
        pdf,
        PAGE_WIDTH / 2 - 25 * mm,
        title_y - 14 * mm,
        PAGE_WIDTH / 2 + 25 * mm,
        GOLD,
        0.8,
    )

    # ========================================================
    # RESIDENT SUMMARY
    # ========================================================

    summary_top = (
        title_y - 24 * mm
    )

    summary_height = 38 * mm

    draw_round_rect(
        pdf,
        content_x,
        summary_top - summary_height,
        content_width,
        summary_height,
        radius=4,
        fill=SURFACE,
        stroke=NAVY_LIGHT,
        line_width=0.7,
    )

    # Vertical separator
    middle_x = (
        content_x
        + content_width / 2
    )

    pdf.setStrokeColor(
        BORDER
    )

    pdf.line(
        middle_x,
        summary_top - 5 * mm,
        middle_x,
        summary_top - 16 * mm,
    )

    # First row
    draw_label_value(
        pdf,
        content_x + 12 * mm,
        summary_top - 10 * mm,
        "Received From",
        receipt["resident_name"],
        10,
    )

    draw_label_value(
        pdf,
        middle_x + 12 * mm,
        summary_top - 10 * mm,
        "Rent Period",
        format_month(
            receipt["rent_month"]
        ),
        10,
    )

    # Horizontal separator
    draw_horizontal_line(
        pdf,
        content_x + 8 * mm,
        summary_top - 19 * mm,
        content_right - 8 * mm,
        BORDER,
        0.6,
    )

    # Second row

    column_width = (
        content_width / 3
    )

    draw_label_value(
        pdf,
        content_x + 12 * mm,
        summary_top - 26 * mm,
        "Room No.",
        receipt["room_no"],
        10,
    )

    draw_label_value(
        pdf,
        content_x + column_width + 4 * mm,
        summary_top - 26 * mm,
        "Sharing",
        receipt["sharing"],
        10,
    )

    draw_label_value(
        pdf,
        content_x
        + (column_width * 2)
        + 2 * mm,
        summary_top - 26 * mm,
        "Payment Date",
        format_date(
            receipt["payment_date"]
        ),
        10,
    )

    # ========================================================
    # PAYMENT DETAILS RIBBON
    # ========================================================

    ribbon_y = (
        summary_top
        - summary_height
        - 13 * mm
    )

    draw_section_ribbon(
        pdf,
        content_x,
        ribbon_y,
        "PAYMENT DETAILS",
        54 * mm,
    )

    draw_horizontal_line(
        pdf,
        content_x + 56 * mm,
        ribbon_y + 4.5 * mm,
        content_right,
        NAVY,
        0.7,
    )

    # ========================================================
    # PAYMENT INFORMATION
    # ========================================================

    payment_y = (
        ribbon_y - 16 * mm
    )

    # Payment mode
    draw_label_value(
        pdf,
        content_x,
        payment_y,
        "Payment Mode",
        str(
            receipt["payment_mode"]
        ).upper(),
        10,
    )

    # Amount received label
    pdf.setFillColor(
        MUTED
    )

    pdf.setFont(
        "Helvetica-Bold",
        7.5,
    )

    pdf.drawRightString(
        content_right,
        payment_y,
        "AMOUNT RECEIVED",
    )

    # Amount
    # ReportLab's built-in fonts do not reliably contain the Unicode ₹ glyph,
    # so the rupee mark is drawn as a vector while the numeric amount keeps
    # the existing Times-Bold styling.
    amount_text = money(
        receipt["rent_amount"]
    ).replace("₹", "").strip()

    amount_font = "Times-Bold"
    amount_size = 24
    amount_y = payment_y - 11 * mm

    pdf.setFillColor(
        NAVY
    )

    pdf.setFont(
        amount_font,
        amount_size,
    )

    # Keep the number perfectly right aligned.
    pdf.drawRightString(
        content_right,
        amount_y,
        amount_text,
    )

    amount_width = stringWidth(
        amount_text,
        amount_font,
        amount_size,
    )

    # Vector ₹ sits immediately to the left of the amount.
    rupee_size = 22
    rupee_width = rupee_size * 0.62
    rupee_gap = 2.5 * mm

    rupee_x = (
        content_right
        - amount_width
        - rupee_gap
        - rupee_width
    )

    rupee_y = (
        amount_y
        + 1.2 * mm
    )

    draw_rupee_symbol(
        pdf,
        rupee_x,
        rupee_y,
        size=rupee_size,
        color=NAVY,
    )

    # ========================================================
    # AMOUNT IN WORDS
    # ========================================================

    words_y = (
        payment_y - 17 * mm
    )

    pdf.setFillColor(
        MUTED
    )

    pdf.setFont(
        "Helvetica-Bold",
        7.5,
    )

    pdf.drawString(
        content_x,
        words_y,
        "AMOUNT IN WORDS",
    )

    pdf.setFillColor(
        INK
    )

    pdf.setFont(
        "Helvetica-Bold",
        9,
    )

    pdf.drawString(
        content_x,
        words_y - 6 * mm,
        amount_in_words(
            receipt["rent_amount"]
        ),
    )

    # ========================================================
    # SEAL + SIGNATURE
    # ========================================================

    seal_area_y = (
        words_y - 30 * mm
    )

    # Keep the seal to the left of the signature block.
    seal_size = 32 * mm
    seal_x = content_x + 88 * mm
    seal_y = seal_area_y + 1 * mm

    draw_image_contain(
        pdf,
        SEAL_PATH,
        seal_x,
        seal_y,
        seal_size,
        seal_size,
    )

    # Signature
    signature_width = 155 * mm

    signature_x = (
        content_right
        - signature_width
    )

    signature_line_y = (
        seal_area_y + 8 * mm
    )

    pdf.setStrokeColor(
        NAVY_LIGHT
    )

    pdf.setLineWidth(0.7)

    pdf.line(
        signature_x,
        signature_line_y,
        content_right,
        signature_line_y,
    )

    pdf.setFillColor(
        MUTED
    )

    pdf.setFont(
        "Helvetica-Bold",
        7,
    )

    pdf.drawCentredString(
        signature_x
        + signature_width / 2,
        signature_line_y - 5 * mm,
        "AUTHORIZED SIGNATURE",
    )

    # ========================================================
    # ACKNOWLEDGEMENT
    # ========================================================

    acknowledgement_y = (
        document_y + 43 * mm
    )

    acknowledgement_height = 22 * mm

    draw_round_rect(
        pdf,
        content_x,
        acknowledgement_y,
        content_width,
        acknowledgement_height,
        radius=4,
        fill=GOLD_PALE,
        stroke=GOLD,
        line_width=0.8,
    )

    pdf.setFillColor(
        GOLD
    )

    pdf.setFont(
        "Helvetica-Bold",
        7.5,
    )

    pdf.drawString(
        content_x + 8 * mm,
        acknowledgement_y
        + acknowledgement_height
        - 8 * mm,
        "PAYMENT ACKNOWLEDGEMENT",
    )

    acknowledgement = (
        "This receipt confirms that the above rent amount "
        "has been received for the stated rental period "
        "through the payment mode mentioned above."
    )

    pdf.setFillColor(
        TEXT
    )

    pdf.setFont(
        "Helvetica",
        7.5,
    )

    text = pdf.beginText(
        content_x + 8 * mm,
        acknowledgement_y
        + acknowledgement_height
        - 14 * mm,
    )

    max_width = (
        content_width - 16 * mm
    )

    line = ""

    for word in acknowledgement.split():

        test = (
            f"{line} {word}"
        ).strip()

        if stringWidth(
            test,
            "Helvetica",
            7.5,
        ) <= max_width:

            line = test

        else:

            text.textLine(line)

            line = word

    if line:
        text.textLine(line)

    pdf.drawText(text)

    # ========================================================
    # OFFICIAL DISCLAIMER
    # ========================================================

    disclaimer_y = (
        acknowledgement_y - 10 * mm
    )

    pdf.setFillColor(
        MUTED
    )

    pdf.setFont(
        "Helvetica",
        6.8,
    )

    disclaimer = (
        "This is a computer generated receipt "
        "and does not require a physical signature."
    )

    pdf.drawCentredString(
        PAGE_WIDTH / 2,
        disclaimer_y,
        disclaimer,
    )

    # ========================================================
    # FOOTER
    # ========================================================

    footer_line_y = (
        document_y + 15 * mm
    )

    draw_horizontal_line(
        pdf,
        content_x,
        footer_line_y,
        content_right,
        BORDER,
        0.6,
    )

    pdf.setFillColor(
        MUTED
    )

    pdf.setFont(
        "Helvetica",
        6.5,
    )

    pdf.drawString(
        content_x,
        document_y + 10 * mm,
        "Generated electronically by RentLedger",
    )

    pdf.drawRightString(
        content_right,
        document_y + 10 * mm,
        "This document is valid without a physical stamp.",
    )

    # ========================================================
    # BOTTOM OFFICIAL BAR
    # ========================================================

    draw_footer_bar(
        pdf,
        document_x,
        document_y,
        document_width,
    )

    # ========================================================
    # SAVE
    # ========================================================

    pdf.showPage()

    pdf.save()

    buffer.seek(0)

    return buffer.getvalue()