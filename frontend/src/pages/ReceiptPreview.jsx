import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  CreditCard,
  Download,
  FileText,
  Mail,
  MapPin,
  Phone,
  Send,
  ShieldCheck,
  UserRound,
  UsersRound,
  DoorOpen,
} from "lucide-react";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import html2canvas from "html2canvas";
import jsPDF from "jspdf";

import { receiptService } from "../services/receiptService";

import sahanaLogo from "../assets/sahana-logo.png";
import sahanaSeal from "../assets/sahana-seal.png";


// ============================================================
// HELPERS
// ============================================================

function formatPaymentDate(value) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}


function formatRentMonth(value) {
  if (!value) return "—";

  const normalized = String(value).toLowerCase();

  if (normalized === "ongoing") {
    return "Ongoing";
  }

  if (normalized === "previous") {
    return "Previous";
  }

  const match = String(value).match(
    /^(\d{4})-(\d{2})$/
  );

  if (!match) {
    return String(value);
  }

  const year = Number(match[1]);
  const month = Number(match[2]);

  return new Date(
    year,
    month - 1,
    1
  ).toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric",
  });
}


function formatAmount(value) {
  return Number(value || 0).toLocaleString(
    "en-IN",
    {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }
  );
}


// ============================================================
// NUMBER TO WORDS
// ============================================================

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


// ============================================================
// DETAIL ITEM
// ============================================================

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


// ============================================================
// PAYMENT ITEM
// ============================================================

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


// ============================================================
// RECEIPT PREVIEW
// ============================================================

function ReceiptPreview() {

  const navigate = useNavigate();

  const { id } = useParams();

  const receiptRef = useRef(null);

  const [receipt, setReceipt] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [downloading, setDownloading] =
    useState(false);
  
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [emailError, setEmailError] = useState("");


  // ==========================================================
  // LOAD
  // ==========================================================

  useEffect(() => {

    const loadReceipt = async () => {

      try {

        setLoading(true);
        setError("");

        const data =
          await receiptService.getById(id);

        setReceipt(data);

      } catch (err) {

        console.error(
          "Failed to load receipt:",
          err
        );

        setError(
          err.response?.data?.detail ||
            "Unable to load receipt."
        );

      } finally {

        setLoading(false);

      }

    };


    if (id) {
      loadReceipt();
    }

  }, [id]);


  // ==========================================================
  // DOWNLOAD
  // ==========================================================

  const handleDownload = async () => {

    if (
      !receiptRef.current ||
      !receipt
    ) {
      return;
    }

    try {

      setDownloading(true);

      if (document.fonts?.ready) {
        await document.fonts.ready;
      }


      const images =
        Array.from(
          receiptRef.current.querySelectorAll(
            "img"
          )
        );


      await Promise.all(
        images.map((image) => {

          if (image.complete) {
            return Promise.resolve();
          }

          return new Promise(
            (resolve) => {

              image.onload = resolve;

              image.onerror = resolve;

            }
          );

        })
      );


      await new Promise((resolve) =>
        requestAnimationFrame(() =>
          requestAnimationFrame(resolve)
        )
      );


      const canvas =
        await html2canvas(
          receiptRef.current,
          {
            width: 794,
            height: 1123,
            scale: 3,

            backgroundColor:
              "#ffffff",

            useCORS: true,

            allowTaint: false,

            logging: false,

            scrollX: 0,
            scrollY: 0,
          }
        );


      const imageData =
        canvas.toDataURL(
          "image/png",
          1
        );


      const pdf =
        new jsPDF({
          orientation: "portrait",
          unit: "mm",
          format: "a4",
          compress: true,
        });


      pdf.addImage(
        imageData,
        "PNG",
        0,
        0,
        210,
        297,
        undefined,
        "FAST"
      );


      pdf.save(
        `${receipt.receipt_number}.pdf`
      );

    } catch (err) {

      console.error(
        "PDF generation failed:",
        err
      );

      window.alert(
        "Unable to generate the PDF. Please try again."
      );

    } finally {

      setDownloading(false);

    }

  };


  // ==========================================================
  // EMAIL
  // ==========================================================

  const handleEmail = async () => {
  if (!receipt || !receiptRef.current) {
    return;
  }

  try {
    setSendingEmail(true);
    setEmailSent(false);
    setEmailError("");

    /*
     * Make sure fonts are loaded.
     */
    if (document.fonts?.ready) {
      await document.fonts.ready;
    }

    /*
     * Wait for receipt images.
     */
    const images =
      Array.from(
        receiptRef.current.querySelectorAll("img")
      );

    await Promise.all(
      images.map((image) => {
        if (
          image.complete &&
          image.naturalWidth > 0
        ) {
          return Promise.resolve();
        }

        return new Promise((resolve) => {
          image.onload = resolve;
          image.onerror = resolve;
        });
      })
    );

    /*
     * Allow final rendering.
     */
    await new Promise((resolve) => {
      requestAnimationFrame(() => {
        requestAnimationFrame(resolve);
      });
    });

    /*
     * Generate the SAME A4 PDF used
     * by the Download button.
     */
    const canvas = await html2canvas(
      receiptRef.current,
      {
        width: 794,
        height: 1123,
        scale: 3,

        backgroundColor: "#ffffff",

        useCORS: true,
        allowTaint: false,

        logging: false,

        scrollX: 0,
        scrollY: 0,
      }
    );

    const imageData =
      canvas.toDataURL(
        "image/png",
        1
      );

    const pdf =
      new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
        compress: true,
      });

    pdf.addImage(
      imageData,
      "PNG",
      0,
      0,
      210,
      297,
      undefined,
      "FAST"
    );

    /*
     * Get PDF as Blob.
     */
    const pdfBlob =
      pdf.output("blob");

    /*
     * Send PDF to backend.
     */
    const formData =
      new FormData();

    formData.append(
      "receipt_id",
      receipt.id
    );

    formData.append(
      "file",
      pdfBlob,
      `${receipt.receipt_number}.pdf`
    );

    /*
     * Backend sends the actual email.
     */
    await receiptService.sendEmail(
      formData
    );

    setEmailSent(true);

    /*
     * Automatically remove success
     * message after a few seconds.
     */
    setTimeout(() => {
      setEmailSent(false);
    }, 4000);

  } catch (err) {
    console.error(
      "Email sending failed:",
      err
    );

    setEmailError(
      err.response?.data?.detail ||
        "Unable to send receipt email."
    );

  } finally {
    setSendingEmail(false);
  }
};

  // ==========================================================
  // LOADING
  // ==========================================================

  if (loading) {

    return (
      <div className="flex min-h-screen items-center justify-center bg-[#e5e7e9]">

        <div className="text-center">

          <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-neutral-200 border-t-[#17253b]" />

          <p className="text-sm text-neutral-500">
            Loading receipt...
          </p>

        </div>

      </div>
    );

  }


  // ==========================================================
  // ERROR
  // ==========================================================

  if (error) {

    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#e5e7e9]">

        <p className="text-sm font-medium text-red-600">
          {error}
        </p>

        <button
          onClick={() => navigate(-1)}
          className="mt-4 rounded-lg bg-[#17253b] px-4 py-2 text-sm font-semibold text-white"
        >
          Go Back
        </button>

      </div>
    );

  }


  if (!receipt) {

    return (
      <div className="flex min-h-screen items-center justify-center bg-[#e5e7e9]">

        <p className="text-sm text-neutral-500">
          Receipt not found.
        </p>

      </div>
    );

  }


  const formattedAmount =
    formatAmount(
      receipt.rent_amount
    );

  const formattedPaymentDate =
    formatPaymentDate(
      receipt.payment_date
    );

  const rentPeriod =
    formatRentMonth(
      receipt.rent_month
    );


  return (

    <div className="min-h-screen bg-[#e5e7e9]">


      {/* =====================================================
          TOP BAR
      ====================================================== */}

      <header className="flex h-20 items-center justify-between border-b border-neutral-200 bg-white px-6 shadow-sm lg:px-8">

        <div>

          <p className="text-xs text-neutral-400">
            Receipt Management
          </p>

          <h1 className="text-lg font-semibold text-neutral-900">
            Receipt Preview
          </h1>

        </div>


        <div className="flex items-center gap-2">

          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 rounded-lg border border-neutral-200 bg-white px-3 py-2.5 text-sm font-semibold text-neutral-600 hover:bg-neutral-50"
          >
            <ArrowLeft size={16} />

            <span className="hidden sm:inline">
              Back
            </span>

          </button>


          <button
            onClick={handleDownload}
            disabled={downloading}
            className="flex items-center gap-2 rounded-lg bg-[#17253b] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#22324d] disabled:opacity-60"
          >

            <Download size={16} />

            {downloading
              ? "Preparing PDF..."
              : "Download PDF"}

          </button>

        </div>

      </header>


      {/* =====================================================
          MAIN
      ====================================================== */}

      <main className="mx-auto max-w-[1400px] px-4 py-8 lg:px-8">

        <div className="grid items-start gap-8 xl:grid-cols-[minmax(0,1fr)_300px]">


          {/* A4 */}

          <div className="flex justify-center overflow-auto rounded-xl border border-neutral-300 bg-[#d5d7da] p-4 shadow-inner sm:p-8">

            <div ref={receiptRef}>

              <Receipt
                receipt={receipt}
                formattedAmount={formattedAmount}
                formattedPaymentDate={
                  formattedPaymentDate
                }
                rentPeriod={rentPeriod}
              />

            </div>

          </div>


          {/* ACTIONS */}

          <aside className="rounded-xl border border-neutral-200 bg-white">

            <div className="border-b border-neutral-100 px-5 py-4">

              <h2 className="font-semibold text-neutral-900">
                Receipt Actions
              </h2>

              <p className="mt-1 text-xs text-neutral-400">
                Receipt is ready to be delivered.
              </p>

            </div>


            <div className="space-y-3 p-5">

              <div className="rounded-lg bg-emerald-50 p-4">

                <div className="flex items-start gap-3">

                  <CheckCircle2
                    size={18}
                    className="mt-0.5 text-emerald-600"
                  />

                  <div>

                    <p className="text-sm font-semibold text-emerald-800">
                      Receipt generated
                    </p>

                    <p className="mt-1 text-xs text-emerald-700">
                      {receipt.receipt_number}
                    </p>

                  </div>

                </div>

              </div>


              <button
                onClick={handleDownload}
                disabled={downloading}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#17253b] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#22324d] disabled:opacity-60"
              >

                <Download size={16} />

                {downloading
                  ? "Preparing PDF..."
                  : "Download PDF"}

              </button>


              {/* <button
                type="button"
                onClick={() => {

                  const phone =
                    String(
                      receipt.mobile || ""
                    ).replace(
                      /\D/g,
                      ""
                    );

                  const message =
`Dear ${receipt.resident_name},

Your rent payment receipt has been generated.

Receipt Number: ${receipt.receipt_number}
Rent Period: ${formatRentMonth(receipt.rent_month)}
Amount Received: ₹${formatAmount(receipt.rent_amount)}

Regards,
Sahana Ladies PG`;

                  const whatsappUrl =
                    `https://wa.me/${phone}` +
                    `?text=${encodeURIComponent(
                      message
                    )}`;

                  window.open(
                    whatsappUrl,
                    "_blank",
                    "noopener,noreferrer"
                  );

                }}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#168a45] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#11763a]"
              >

                <Send size={16} />

                Send via WhatsApp

              </button> */}


              <button
                type="button"
                onClick={handleEmail}
                disabled={sendingEmail}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-neutral-200 bg-white px-4 py-2.5 text-sm font-semibold text-neutral-700 transition hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {sendingEmail ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-neutral-300 border-t-[#17253b]" />
                    Sending...
                  </>
                ) : emailSent ? (
                  <>
                    <CheckCircle2
                      size={16}
                      className="text-emerald-600"
                    />
                    Successfully Sent
                  </>
                ) : (
                  <>
                    <Mail size={16} />
                    Send via Email
                  </>
                )}
              </button>

              {emailError && (
                <p className="mt-2 text-center text-xs font-medium text-red-600">
                  {emailError}
                </p>
              )}

            </div>

          </aside>

        </div>

      </main>

    </div>
  );
}


// ============================================================
// A4 RECEIPT
// ============================================================

function Receipt({
  receipt,
  formattedAmount,
  formattedPaymentDate,
  rentPeriod,
}) {

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
                value={receipt.resident_name}
              />

            </div>


            <div className="flex items-center border-l border-[#d8dde4] px-7">

              <DetailItem
                icon={CalendarDays}
                label="Rent Period"
                value={rentPeriod}
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
                value={receipt.sharing}
              />

            </div>


            <div className="flex items-center border-l border-[#d8dde4] px-7">

              <DetailItem
                icon={CalendarDays}
                label="Payment Date"
                value={formattedPaymentDate}
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
                {formattedAmount}
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


export default ReceiptPreview;