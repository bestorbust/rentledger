import {
  CalendarDays,
  CheckCircle2,
  CreditCard,
  FileText,
  MapPin,
  Phone,
  ShieldCheck,
  UserRound,
  UsersRound,
  DoorOpen,
} from "lucide-react";

import sahanaLogo from "../../assets/sahana-logo.png";
import sahanaSeal from "../../assets/sahana-seal.png";

const COLORS = {
  text: "#171717",
  muted: "#737373",
  light: "#a3a3a3",
  border: "#e5e5e5",
  soft: "#fafaf9",
  accent: "#b9563e",
  accentSoft: "#f9e9e4",
  success: "#059669",
  successSoft: "#ecfdf5",
};

const formatAmount = (value) =>
  Number(value || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const formatDate = (value) => {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

const capitalizeName = (name) =>
  name
    ?.toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());

const formatSharing = (value)=>{
    if(!value) return "-";

    const normalized = String(value).trim().toLocaleLowerCase();
    if (normalized === "single") {
        return "Single";
    }
    if (normalized === "double") {
        return "Double";
    }
    if (normalized === "triple") {
        return "Triple";
    }
}
const formatMonth = (value) => {
  if (!value) return "—";

  const normalized = String(value).trim().toLowerCase();

  if (normalized === "ongoing") {
    return "Ongoing";
  }

  if (normalized === "previous") {
    return "Previous";
  }

  const match = normalized.match(/^(\d{4})-(\d{2})$/);

  if (!match) {
    return String(value);
  }

  const year = Number(match[1]);
  const month = Number(match[2]);

  if (month < 1 || month > 12) {
    return String(value);
  }

  return new Date(year, month - 1, 1).toLocaleDateString(
    "en-IN",
    {
      month: "long",
      year: "numeric",
    }
  );
};

function DetailItem({
  icon: Icon,
  label,
  value,
}) {
  return (
    <div className="flex min-w-0 items-center gap-3">

      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#17253b] text-white">
        <Icon
          size={17}
          strokeWidth={1.8}
        />
      </div>

      <div className="min-w-0">

        <p className="text-[8px] font-semibold uppercase tracking-[0.12em] text-[#63728a]">
          {label}
        </p>

        <p className="mt-1 text-[11px] font-bold leading-[15px] text-[#17253b]">
          {value || "—"}
        </p>

      </div>

    </div>
  );
}


function amountInWords(value) {
  const amount = Number(value || 0);

  const rupees = Math.floor(amount);

  const paise = Math.round(
    (amount - rupees) * 100
  );

  let result =
    numberToWordsIndian(rupees) +
    " Rupees";

  if (paise > 0) {
    result +=
      " and " +
      numberToWordsIndian(paise) +
      " Paise";
  }

  return `${result} Only`;
}


const ones = [
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
];

const tens = [
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
];


function numberToWordsIndian(number) {
  number = Math.floor(
    Number(number) || 0
  );

  if (number === 0) {
    return "Zero";
  }

  let result = "";

  if (number >= 10000000) {
    result +=
      numberToWordsIndian(
        Math.floor(number / 10000000)
      ) +
      " Crore ";

    number %= 10000000;
  }

  if (number >= 100000) {
    result +=
      numberToWordsIndian(
        Math.floor(number / 100000)
      ) +
      " Lakh ";

    number %= 100000;
  }

  if (number >= 1000) {
    result +=
      numberToWordsIndian(
        Math.floor(number / 1000)
      ) +
      " Thousand ";

    number %= 1000;
  }

  if (number >= 100) {
    result +=
      numberToWordsIndian(
        Math.floor(number / 100)
      ) +
      " Hundred ";

    number %= 100;
  }

  if (number > 0) {
    if (number < 20) {
      result += ones[number];
    } else {
      result +=
        tens[Math.floor(number / 10)];

      if (number % 10 !== 0) {
        result +=
          " " +
          ones[number % 10];
      }
    }
  }

  return result.trim();
}

function PaymentItem({
  icon: Icon,
  label,
  value,
}) {
  return (
    <div className="flex items-start gap-3">

      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#17253b] text-white">
        <Icon
          size={17}
          strokeWidth={1.8}
        />
      </div>

      <div>

        <p className="text-[8px] font-semibold uppercase tracking-[0.12em] text-[#63728a]">
          {label}
        </p>

        <p className="mt-1.5 text-[11px] font-bold uppercase leading-[15px] text-[#17253b]">
          {value || "—"}
        </p>

      </div>

    </div>
  );
}



export default function ReceiptDocument({  receipt,
  formattedAmount,
  formattedPaymentDate,
  rentPeriod,
}) {
      const displayAmount =
    formattedAmount ?? formatAmount(receipt?.rent_amount);

  const displayPaymentDate =
    formattedPaymentDate ??
    formatDate(receipt?.payment_date);

  const displayRentPeriod =
    rentPeriod ??
    formatMonth(receipt?.tenant_rent_month);
  return (

    <div
      id="rent-receipt"
      className="relative flex h-[1123px] w-[794px] flex-col overflow-hidden bg-white text-[#17253b]"
    >

      {/* BORDER */}

      <div className="pointer-events-none absolute inset-0 z-50 border border-[#17253b]" />


      {/* LEFT STRIPE */}

      <div className="absolute left-0 top-0 h-[275px] w-[32px] bg-[#17253b]" />

      <div className="absolute left-[32px] top-0 h-[275px] w-[4px] bg-[#b79a55]" />


      {/* =====================================================
          HEADER
      ====================================================== */}

      <section className="h-[250px] shrink-0 px-[70px] pt-[46px]">

        <div className="flex items-start">

          {/* LOGO */}

          <div className="flex h-[145px] w-[180px] shrink-0 items-center justify-center border-r border-[#b79a55] pr-8">

            <img
              src={sahanaLogo}
              alt="Sahana Group"
              className="max-h-[125px] max-w-[145px] object-contain"
            />

          </div>


          {/* COMPANY */}

          <div className="ml-7 pt-2">

            <p className="font-serif text-[15px] font-bold">
              SAHANA GROUP
            </p>

            <h2 className="mt-2 font-serif text-[27px] font-bold">
              SAHANA LADIES PG
            </h2>

            <p className="mt-2 text-[10px] font-medium uppercase tracking-[0.08em]">
              Premium Residential Accommodation
            </p>

            <div className="mt-4 h-[2px] w-[195px] bg-[#b79a55]" />

            <div className="mt-4 space-y-2">

              <div className="flex items-center gap-2 text-[9px] text-[#63728a]">

                <MapPin size={12} />

                <span>
                  #26 Pearless Colony, Near Garden City College, Bhattrahalli, Bengaluru, Karnataka, India -560049
                </span>

              </div>


              <div className="flex items-center gap-2 text-[9px] text-[#63728a]">

                <Phone size={12} />

                <span>
                  +91 86604 75091
                </span>

              </div>

            </div>

          </div>


          {/* NUMBER */}

          <div className="ml-auto flex w-[145px] flex-col items-end pt-3">

            <p className="text-[7px] font-semibold uppercase tracking-[0.14em] text-[#63728a]">
              Receipt Number
            </p>

            <p className="mt-2 text-[11px] font-bold">
              {receipt.receipt_number}
            </p>

            <div className="mt-6 flex h-[48px] w-[135px] items-center justify-center gap-2 rounded-md border border-[#39724e] bg-[#f3f8f4]">

              <CheckCircle2
                size={19}
                className="text-[#39724e]"
              />

              <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#39724e]">
                Paid
              </span>

            </div>

          </div>

        </div>

      </section>


      {/* =====================================================
          TITLE
      ====================================================== */}

      <section className="h-[105px] shrink-0 px-[60px] pt-[18px] text-center">

        <h1 className="font-serif text-[31px] font-bold">
          RENT PAYMENT RECEIPT
        </h1>

        <p className="mt-2 text-[10px] text-[#63728a]">
          Official acknowledgement of rent received
        </p>

        <div className="mx-auto mt-4 h-[2px] w-[160px] bg-[#b79a55]" />

      </section>


      {/* =====================================================
          RESIDENT DETAILS
      ====================================================== */}

      <section className="h-[175px] shrink-0 px-[60px] pt-[15px]">

        <div className="h-[155px] overflow-hidden rounded-lg border border-[#17253b] bg-[#fbfcfd]">

          {/* FIRST ROW */}

          <div className="grid h-[85px] grid-cols-2 border-b border-[#d8dde4]">

            <div className="flex items-center px-7">

              <DetailItem
                icon={UserRound}
                label="Received From"
                value={capitalizeName(receipt.resident_name)}
                />

            </div>


            <div className="flex items-center border-l border-[#d8dde4] px-7">

              <DetailItem
                icon={CalendarDays}
                label="Rent Period"
                value={displayRentPeriod}
              />

            </div>

          </div>


          {/* SECOND ROW */}

          <div className="grid h-[70px] grid-cols-3">

            <div className="flex items-center px-7">

              <DetailItem
                icon={DoorOpen}
                label="Room No."
                value={receipt.room_no}
              />

            </div>


            <div className="flex items-center border-l border-[#d8dde4] px-7">

              <DetailItem
                icon={UsersRound}
                label="Sharing"
                value={formatSharing(receipt.sharing)}
              />

            </div>


            <div className="flex items-center border-l border-[#d8dde4] px-7">

              <DetailItem
                icon={CalendarDays}
                label="Payment Date"
                value={displayPaymentDate}
              />

            </div>

          </div>

        </div>

      </section>


      {/* =====================================================
          PAYMENT DETAILS
      ====================================================== */}

      <section className="h-[365px] shrink-0 px-[55px] pt-[20px]">

        {/* RIBBON */}

        <div className="flex h-[38px] items-center">

          <div className="relative flex h-[38px] w-[235px] items-center justify-center bg-[#17253b]">

            <div className="absolute -left-[12px] top-0 border-b-[19px] border-r-[12px] border-t-[19px] border-b-transparent border-r-[#17253b] border-t-transparent" />

            <div className="absolute -right-[14px] top-0 border-b-[19px] border-l-[14px] border-t-[19px] border-b-transparent border-l-[#17253b] border-t-transparent" />

            <span className="text-[10px] font-bold uppercase tracking-[0.08em] text-white">
              Payment Details
            </span>

          </div>

          <div className="ml-4 h-px flex-1 bg-[#17253b]" />

        </div>


        <div className="grid grid-cols-2 gap-12 pt-[35px]">

          {/* LEFT */}

          <div className="space-y-12">

            <PaymentItem
              icon={CreditCard}
              label="Payment Mode"
              value={
                receipt.payment_mode
                  ? String(
                      receipt.payment_mode
                    ).toUpperCase()
                  : "—"
              }
            />


            <div className="flex items-start gap-3">

              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#17253b] text-white">

                <FileText
                  size={17}
                />

              </div>

              <div>

                <p className="text-[8px] font-semibold uppercase tracking-[0.12em] text-[#63728a]">
                  Amount in Words
                </p>

                <p className="mt-2 max-w-[270px] text-[11px] font-bold leading-5 text-[#17253b]">
                  {amountInWords(
                    receipt.rent_amount
                  )}
                </p>

              </div>

            </div>

          </div>


          {/* RIGHT */}

          <div className="flex flex-col items-end">

            <p className="text-[8px] font-semibold uppercase tracking-[0.14em] text-[#63728a]">
              Amount Received
            </p>

            <div className="mt-1 flex items-baseline">

              <span className="font-serif text-[28px] font-bold">
                ₹
              </span>

              <span className="ml-1 font-serif text-[32px] font-bold tracking-tight">
                {displayAmount}
              </span>

            </div>


            <div className="mt-5 h-[2px] w-[190px] bg-[#b79a55]" />


            {/* SEAL */}

            <img
              src={sahanaSeal}
              alt="Sahana Ladies PG official seal"
              className="mt-10 h-[105px] w-[105px] object-contain"
            />

            <p className="text-[8px] font-semibold uppercase tracking-[0.08em] text-[#63728a]">
              Authorized Signature & Seal
            </p>

          </div>

        </div>

      </section>


      {/* =====================================================
          ACKNOWLEDGEMENT
      ====================================================== */}

      <section className="h-[90px] shrink-0 px-[60px]">

        <div className="flex h-[82px] items-center gap-4 rounded-lg border border-[#b79a55] bg-[#fffdf8] px-5">

          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#b79a55] text-[#9b7b38]">

            <ShieldCheck size={19} />

          </div>


          <div>

            <p className="text-[9px] font-bold uppercase tracking-[0.08em] text-[#9b7b38]">
              Payment Acknowledgement
            </p>

            <p className="mt-2 max-w-[610px] text-[9px] leading-4 text-[#17253b]">
              This receipt confirms that the above rent amount has been received for the stated rental period through the payment mode mentioned above.
            </p>

          </div>

        </div>

      </section>


      {/* =====================================================
          DISCLAIMER
      ====================================================== */}

      <section className="h-[55px] shrink-0 px-[60px] pt-[18px]">

        <div className="flex items-center gap-4">

          <div className="h-px flex-1 bg-[#d8dde4]" />

          <p className="whitespace-nowrap text-[7px] text-[#63728a]">
            This is a computer generated receipt and does not require a physical signature.
          </p>

          <div className="h-px flex-1 bg-[#d8dde4]" />

        </div>

      </section>


      {/* =====================================================
          FOOTER
      ====================================================== */}

      <section className="h-[58px] shrink-0 border-t border-dashed border-[#9ca3af] mx-[55px] px-1 pt-[12px]">

        <div className="flex items-center justify-between">

          <div className="flex items-center gap-2 text-[8px] text-[#63728a]">

            <FileText size={13} />

            <span>
              Generated electronically by{" "}
              <strong className="text-[#17253b]">
                RentLedger
              </strong>
            </span>

          </div>


          <div className="flex items-center gap-2 text-[8px] text-[#63728a]">

            <ShieldCheck size={13} />

            <span>
              This document is valid without a physical stamp.
            </span>

          </div>

        </div>

      </section>


      {/* =====================================================
          THANK YOU
      ====================================================== */}

      <div className="relative h-[30px] shrink-0 bg-[#17253b]">

        <div className="absolute left-[18px] top-[11px] h-[7px] w-[7px] rounded-full bg-[#b79a55]" />

        <div className="absolute right-[18px] top-[11px] h-[7px] w-[7px] rounded-full bg-[#b79a55]" />

        <p className="text-center text-[8px] font-bold uppercase tracking-[0.16em] leading-[30px] text-white">
          Thank You For Your Payment
        </p>

      </div>

    </div>
  );
}
