import {
  ArrowLeft,
  CalendarDays,
  Check,
  CheckCircle2,
  CreditCard,
  FileText,
  Mail,
  RefreshCw,
  Send,
  Users,
  X,
} from "lucide-react";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { useNavigate } from "react-router-dom";

import Sidebar from "../components/layout/Sidebar";
import Header from "../components/layout/Header";
import ReceiptDocument from "../components/receipts/ReceiptDocument";

import { receiptService } from "../services/receiptService";

import html2canvas from "html2canvas";
import jsPDF from "jspdf";


/* =========================================================
   DATE HELPERS
========================================================= */

function getCurrentMonth() {
  const now = new Date();

  return `${now.getFullYear()}-${String(
    now.getMonth() + 1
  ).padStart(2, "0")}`;
}


function getToday() {
  const now = new Date();

  return `${now.getFullYear()}-${String(
    now.getMonth() + 1
  ).padStart(2, "0")}-${String(
    now.getDate()
  ).padStart(2, "0")}`;
}


function formatMonth(value) {
  if (!value) return "";

  const [year, month] = value.split("-");

  return new Date(
    Number(year),
    Number(month) - 1,
    1
  ).toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric",
  });
}


function formatAmount(value) {
  return Number(value || 0).toLocaleString(
    "en-IN"
  );
}


/* =========================================================
   RECEIPT NUMBER
========================================================= */

function createReceiptNumber() {
  const now = new Date();

  const year = now.getFullYear();

  const uniquePart =
    `${Date.now()}${Math.floor(
      Math.random() * 1000
    )}`.slice(-9);

  return `SLP-${year}-${uniquePart}`;
}


/* =========================================================
   GENERATE PDF FROM THE EXACT REACT RECEIPT
========================================================= */

async function createReceiptPdf({
  tenant,
  rentMonth,
  paymentDate,
  paymentMode,
  receiptNumber,
}) {
  const receipt = {
    receipt_number: receiptNumber,

    tenant_id: tenant.tenant_id,

    resident_name: tenant.name,

    room_no: tenant.room,
    tenant_rent_month: tenant.tenant_rent_month,
    

    rent_amount: tenant.rent,

    sharing: tenant.sharing,

    rent_month: rentMonth,

    payment_date: paymentDate,

    payment_mode: paymentMode,

    status: "PENDING",

    email_sent: false,
  };

  /*
   * Hidden A4 canvas.
   *
   * IMPORTANT:
   * Keep this as normal RGB/hex CSS.
   * Do not use oklch().
   *
   * html2canvas can fail on unsupported CSS color
   * functions such as oklch.
   */

  const wrapper =
    document.createElement("div");

  wrapper.style.position = "fixed";
  wrapper.style.left = "-10000px";
  wrapper.style.top = "0";
  wrapper.style.width = "794px";
  wrapper.style.height = "1123px";
  wrapper.style.backgroundColor = "#ffffff";
  wrapper.style.overflow = "hidden";
  wrapper.style.zIndex = "-9999";

  document.body.appendChild(wrapper);

  const root =
    document.createElement("div");

  root.style.width = "794px";
  root.style.height = "1123px";
  root.style.backgroundColor = "#ffffff";

  wrapper.appendChild(root);

  const { createRoot } =
    await import("react-dom/client");

  const reactRoot =
    createRoot(root);

  try {
    reactRoot.render(
      <ReceiptDocument
        receipt={receipt}
      />
    );

    /*
     * Give React/browser enough time to paint
     * the complete receipt.
     */

    await new Promise((resolve) =>
      requestAnimationFrame(() =>
        requestAnimationFrame(resolve)
      )
    );

    if (document.fonts?.ready) {
      await document.fonts.ready;
    }

    /*
     * Wait for images.
     */

    const images =
      root.querySelectorAll("img");

    if (images.length > 0) {
      await Promise.all(
        [...images].map(
          (img) =>
            img.complete
              ? Promise.resolve()
              : new Promise((resolve) => {
                  img.onload = resolve;
                  img.onerror = resolve;
                })
        )
      );
    }

    const element =
      root.firstElementChild;

    if (!element) {
      throw new Error(
        "Unable to render receipt document."
      );
    }

    /*
     * IMPORTANT:
     *
     * foreignObjectRendering is disabled.
     * This avoids many html2canvas CSS parsing issues.
     */

    const canvas =
      await html2canvas(element, {
        width: 794,
        height: 1123,

        scale: 2,

        backgroundColor: "#ffffff",

        useCORS: true,

        allowTaint: false,

        logging: false,

        foreignObjectRendering: false,

        scrollX: 0,

        scrollY: 0,
      });

    const pdf =
      new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
        compress: true,
      });

    const image =
      canvas.toDataURL(
        "image/jpeg",
        0.95
      );

    pdf.addImage(
      image,
      "JPEG",
      0,
      0,
      210,
      297,
      undefined,
      "FAST"
    );

    return pdf.output("blob");
  } finally {
    reactRoot.unmount();

    wrapper.remove();
  }
}


/* =========================================================
   MAIN PAGE
========================================================= */

function ReceiptGeneration() {
  const navigate = useNavigate();

  const [
    sidebarOpen,
    setSidebarOpen,
  ] = useState(true);

  const [
    rentMonth,
    setRentMonth,
  ] = useState(getCurrentMonth());

  const [
    paymentDate,
    setPaymentDate,
  ] = useState(getToday());

  const [
    paymentMode,
    setPaymentMode,
  ] = useState("UPI");

  const [
    available,
    setAvailable,
  ] = useState([]);

  const [
    alreadyGenerated,
    setAlreadyGenerated,
  ] = useState([]);

  const [
    selectedIds,
    setSelectedIds,
  ] = useState(new Set());

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    refreshing,
    setRefreshing,
  ] = useState(false);

  const [
    generating,
    setGenerating,
  ] = useState(false);

  const [
    currentTenant,
    setCurrentTenant,
  ] = useState("");

  const [
    error,
    setError,
  ] = useState("");

  const [
    success,
    setSuccess,
  ] = useState("");

  /* =======================================================
     LOAD MONTHLY STATUS
  ======================================================= */

  const loadMonthlyStatus =
    useCallback(
      async (showInitialLoading = true) => {
        try {
          if (showInitialLoading) {
            setLoading(true);
          } else {
            setRefreshing(true);
          }

          setError("");

          const data =
            await receiptService.getMonthlyStatus(
              rentMonth
            );

          const nextAvailable =
            data.available || [];

          const nextGenerated =
            data.already_generated || [];

          setAvailable(
            nextAvailable
          );

          setAlreadyGenerated(
            nextGenerated
          );

          /*
           * Only currently available tenants
           * can remain selected.
           */

          const availableIds =
            new Set(
              nextAvailable.map(
                (tenant) =>
                  tenant.tenant_id
              )
            );

          setSelectedIds(
            (current) =>
              new Set(
                [...current].filter(
                  (id) =>
                    availableIds.has(id)
                )
              )
          );
        } catch (err) {
          console.error(
            "Monthly status error:",
            err
          );

          setError(
            err.response?.data?.detail ||
              "Unable to load receipt status."
          );
        } finally {
          setLoading(false);
          setRefreshing(false);
        }
      },
      [rentMonth]
    );


  useEffect(() => {
    /*
     * Changing month means a completely
     * different receipt batch.
     *
     * Therefore clear previous selections first.
     */

    setSelectedIds(new Set());

    setSuccess("");
    setError("");

    loadMonthlyStatus();
  }, [rentMonth, loadMonthlyStatus]);


  /* =======================================================
     SELECTION
  ======================================================= */

  const toggleTenant = (tenantId) => {
    if (generating) return;

    setSelectedIds((current) => {
      const next =
        new Set(current);

      if (next.has(tenantId)) {
        next.delete(tenantId);
      } else {
        next.add(tenantId);
      }

      return next;
    });
  };


  const selectAllAvailable = () => {
    if (generating) return;

    setSelectedIds(
      new Set(
        available.map(
          (tenant) =>
            tenant.tenant_id
        )
      )
    );
  };


  const clearSelection = () => {
    if (generating) return;

    setSelectedIds(new Set());
  };


  const allSelected =
    available.length > 0 &&
    selectedIds.size ===
      available.length;


  const selectedTenants =
    useMemo(
      () =>
        available.filter(
          (tenant) =>
            selectedIds.has(
              tenant.tenant_id
            )
        ),
      [
        available,
        selectedIds,
      ]
    );


  const selectedTotal =
    selectedTenants.reduce(
      (total, tenant) =>
        total +
        Number(
          tenant.rent || 0
        ),
      0
    );


  /* =======================================================
     GENERATE + SEND
  ======================================================= */

  const handleGenerateAndSend =
    async () => {
      setError("");
      setSuccess("");

      if (
        selectedTenants.length === 0
      ) {
        setError(
          "Select at least one available tenant."
        );

        return;
      }

      if (!rentMonth) {
        setError(
          "Please select the receipt month."
        );

        return;
      }

      if (!paymentDate) {
        setError(
          "Please select the payment date."
        );

        return;
      }

      if (!paymentMode) {
        setError(
          "Please select the payment mode."
        );

        return;
      }

      /*
       * Email validation before generating
       * potentially unnecessary PDFs.
       */

      const withoutEmail =
        selectedTenants.filter(
          (tenant) =>
            !tenant.email
        );

      if (
        withoutEmail.length > 0
      ) {
        setError(
          `These residents do not have an email address: ${withoutEmail
            .map(
              (tenant) =>
                tenant.name
            )
            .join(", ")}`
        );

        return;
      }

      setGenerating(true);

      let successCount = 0;

      const failures = [];

      try {
        /*
         * Process one tenant at a time.
         *
         * This prevents the browser from trying to
         * render many large A4 canvases simultaneously.
         */

        for (
          const tenant of
            selectedTenants
        ) {
          try {
            setCurrentTenant(
              tenant.name
            );

            /*
             * Unique receipt number for THIS tenant.
             */

            const receiptNumber =
              createReceiptNumber();

            /*
             * Generate the exact receipt
             * shown by ReceiptDocument.
             */

            const pdfBlob =
              await createReceiptPdf({
                tenant,
                rentMonth,
                paymentDate,
                paymentMode,
                receiptNumber,
              });

            /*
             * Send EXACT SAME PDF to backend.
             *
             * Backend only records the receipt after
             * the email service succeeds.
             */

            await receiptService.generateAndSend({
              tenantId:
                tenant.tenant_id,

              rentMonth,

              paymentDate,

              paymentMode,

              receiptNumber,

              pdfBlob,
            });

            successCount++;
          } catch (err) {
            console.error(
              `Failed sending ${tenant.name}:`,
              err
            );

            failures.push({
              name: tenant.name,

              detail:
                err.response?.data?.detail ||
                err.message ||
                "Unable to send receipt.",
            });
          }
        }

        setCurrentTenant("");

        /*
         * Backend is the source of truth.
         *
         * Successful tenants will now appear
         * under "Already Sent".
         */

        await loadMonthlyStatus(false);

        /*
         * Only clear selection if all selected
         * tenants succeeded.
         *
         * Failed tenants remain selected so the
         * user can retry them.
         */

        if (
          failures.length === 0
        ) {
          setSelectedIds(
            new Set()
          );

          setSuccess(
            `${successCount} receipt${
              successCount === 1
                ? ""
                : "s"
            } generated and sent successfully.`
          );
        } else {
          /*
           * Keep only failed tenants selected.
           */

          const failedNames =
            new Set(
              failures.map(
                (item) =>
                  item.name
              )
            );

          setSelectedIds(
            new Set(
              selectedTenants
                .filter(
                  (tenant) =>
                    failedNames.has(
                      tenant.name
                    )
                )
                .map(
                  (tenant) =>
                    tenant.tenant_id
                )
            )
          );

          setError(
            `${successCount} sent successfully. ${
              failures.length
            } failed. ${
              failures
                .map(
                  (item) =>
                    `${item.name}: ${item.detail}`
                )
                .join(" | ")
            }`
          );
        }
      } finally {
        setGenerating(false);
        setCurrentTenant("");
      }
    };


  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="min-h-screen bg-[#f7f7f5]">
      <Sidebar
        isOpen={sidebarOpen}
        setIsOpen={
          setSidebarOpen
        }
      />

      <div
        className={`min-h-screen transition-all duration-300 ${
          sidebarOpen
            ? "ml-64"
            : "ml-20"
        }`}
      >
        <Header />

        <main className="mx-auto max-w-[1400px] px-4 py-5 sm:px-6 lg:px-8 lg:py-7">
          {/* =================================================
              HEADER
          ================================================= */}

          <div className="mb-6">
            <button
              type="button"
              onClick={() =>
                navigate(
                  "/residents"
                )
              }
              className="mb-4 flex items-center gap-2 text-sm font-medium text-neutral-500 transition hover:text-neutral-900"
            >
              <ArrowLeft size={16} />
              Back to Residents
            </button>

            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="mb-1 text-sm font-semibold text-[#b9563e]">
                  Rent Management
                </p>

                <h1 className="text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl">
                  Generate Receipts
                </h1>

                <p className="mt-1.5 max-w-2xl text-sm leading-6 text-neutral-500">
                  Select residents who need a receipt,
                  confirm the payment details, and send
                  the official receipt directly to their
                  email.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  loadMonthlyStatus(false)
                }
                disabled={
                  refreshing ||
                  generating
                }
                className="inline-flex h-10 items-center justify-center gap-2 self-start rounded-lg border border-neutral-200 bg-white px-4 text-sm font-semibold text-neutral-700 shadow-sm transition hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50 lg:self-auto"
              >
                <RefreshCw
                  size={15}
                  className={
                    refreshing
                      ? "animate-spin"
                      : ""
                  }
                />

                Refresh
              </button>
            </div>
          </div>


          {/* =================================================
              PAYMENT SETTINGS
          ================================================= */}

          <section className="mb-5 overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm">
            <div className="border-b border-neutral-100 px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#f9e9e4] text-[#b9563e]">
                  <FileText size={17} />
                </div>

                <div>
                  <h2 className="text-sm font-semibold text-neutral-900">
                    Receipt Details
                  </h2>

                  <p className="text-xs text-neutral-400">
                    These details will be printed on every
                    selected receipt.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-3">
              {/* MONTH */}

              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-neutral-400">
                  Receipt Month
                </label>

                <div className="relative">
                  <CalendarDays
                    size={17}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
                  />

                  <input
                    type="month"
                    value={rentMonth}
                    onChange={(event) =>
                      setRentMonth(
                        event.target.value
                      )
                    }
                    disabled={generating}
                    className="h-11 w-full rounded-lg border border-neutral-200 bg-white pl-10 pr-3 text-sm font-medium text-neutral-700 outline-none transition focus:border-[#c96c55] focus:ring-2 focus:ring-[#f9e9e4] disabled:bg-neutral-50"
                  />
                </div>
              </div>

              {/* PAYMENT DATE */}

              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-neutral-400">
                  Payment Date
                </label>

                <div className="relative">
                  <CalendarDays
                    size={17}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
                  />

                  <input
                    type="date"
                    value={paymentDate}
                    onChange={(event) =>
                      setPaymentDate(
                        event.target.value
                      )
                    }
                    disabled={generating}
                    className="h-11 w-full rounded-lg border border-neutral-200 bg-white pl-10 pr-3 text-sm font-medium text-neutral-700 outline-none transition focus:border-[#c96c55] focus:ring-2 focus:ring-[#f9e9e4] disabled:bg-neutral-50"
                  />
                </div>
              </div>

              {/* PAYMENT MODE */}

              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-neutral-400">
                  Payment Mode
                </label>

                <div className="relative">
                  <CreditCard
                    size={17}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
                  />

                  <select
                    value={paymentMode}
                    onChange={(event) =>
                      setPaymentMode(
                        event.target.value
                      )
                    }
                    disabled={generating}
                    className="h-11 w-full appearance-none rounded-lg border border-neutral-200 bg-white pl-10 pr-3 text-sm font-medium text-neutral-700 outline-none transition focus:border-[#c96c55] focus:ring-2 focus:ring-[#f9e9e4] disabled:bg-neutral-50"
                  >
                    <option value="UPI">
                      UPI
                    </option>

                    <option value="Cash">
                      Cash
                    </option>

                    <option value="Bank Transfer">
                      Bank Transfer
                    </option>

                    <option value="Card">
                      Card
                    </option>
                  </select>
                </div>
              </div>
            </div>
          </section>


          {/* =================================================
              ALERTS
          ================================================= */}

          {error && (
            <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3.5 text-sm text-red-700">
              <X
                size={18}
                className="mt-0.5 shrink-0"
              />

              <div>
                <p className="font-semibold">
                  Some receipts could not be sent
                </p>

                <p className="mt-0.5 leading-5">
                  {error}
                </p>
              </div>
            </div>
          )}

          {success && (
            <div className="mb-5 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3.5 text-sm text-emerald-700">
              <CheckCircle2
                size={18}
                className="mt-0.5 shrink-0"
              />

              <div>
                <p className="font-semibold">
                  Receipts sent
                </p>

                <p className="mt-0.5">
                  {success}
                </p>
              </div>
            </div>
          )}


          {/* =================================================
              STATS
          ================================================= */}

          <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <StatCard
              icon={Users}
              label="Residents"
              value={
                available.length +
                alreadyGenerated.length
              }
            />

            <StatCard
              icon={CheckCircle2}
              label="Already Sent"
              value={
                alreadyGenerated.length
              }
              success
            />

            <StatCard
              icon={FileText}
              label="Selected"
              value={
                selectedIds.size
              }
            />
          </div>


          {/* =================================================
              TENANT LIST
          ================================================= */}

          <section className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm">
            {/* LIST HEADER */}

            <div className="flex flex-col gap-4 border-b border-neutral-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="font-semibold text-neutral-900">
                  {formatMonth(
                    rentMonth
                  )} Receipts
                </h2>

                <p className="mt-1 text-xs text-neutral-400">
                  Sent receipts remain visible and cannot
                  be selected again.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={
                    allSelected
                      ? clearSelection
                      : selectAllAvailable
                  }
                  disabled={
                    available.length ===
                      0 ||
                    generating
                  }
                  className="rounded-lg border border-neutral-200 bg-white px-3 py-2 text-xs font-semibold text-neutral-600 transition hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {allSelected
                    ? "Clear All"
                    : "Select All Available"}
                </button>

                {selectedIds.size >
                  0 && (
                  <button
                    type="button"
                    onClick={
                      clearSelection
                    }
                    disabled={
                      generating
                    }
                    className="rounded-lg px-3 py-2 text-xs font-semibold text-neutral-500 transition hover:bg-neutral-50"
                  >
                    Deselect All
                  </button>
                )}
              </div>
            </div>


            {/* LOADING */}

            {loading ? (
              <div className="flex min-h-[320px] items-center justify-center">
                <div className="text-center">
                  <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-neutral-200 border-t-[#b9563e]" />

                  <p className="text-sm font-medium text-neutral-500">
                    Loading residents...
                  </p>
                </div>
              </div>
            ) : (
              <>
                {/* =================================================
                    AVAILABLE
                ================================================= */}

                {available.length >
                  0 && (
                  <div>
                    <div className="border-b border-neutral-100 bg-[#fafaf9] px-5 py-2.5">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                        Ready to Send ·{" "}
                        {available.length}
                      </p>
                    </div>

                    <div className="divide-y divide-neutral-100">
                      {available.map(
                        (tenant) => (
                          <TenantReceiptRow
                            key={
                              tenant.tenant_id
                            }
                            tenant={
                              tenant
                            }
                            selected={selectedIds.has(
                              tenant.tenant_id
                            )}
                            disabled={
                              generating
                            }
                            onToggle={() =>
                              toggleTenant(
                                tenant.tenant_id
                              )
                            }
                          />
                        )
                      )}
                    </div>
                  </div>
                )}


                {/* =================================================
                    ALREADY SENT
                ================================================= */}

                {alreadyGenerated.length >
                  0 && (
                  <div>
                    <div className="border-y border-neutral-100 bg-[#fafaf9] px-5 py-2.5">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                        Already Sent ·{" "}
                        {
                          alreadyGenerated.length
                        }
                      </p>
                    </div>

                    <div className="divide-y divide-neutral-100">
                      {alreadyGenerated.map(
                        (tenant) => (
                          <TenantReceiptRow
                            key={
                              tenant.tenant_id
                            }
                            tenant={
                              tenant
                            }
                            sent
                          />
                        )
                      )}
                    </div>
                  </div>
                )}


                {/* =================================================
                    EMPTY
                ================================================= */}

                {available.length ===
                  0 &&
                  alreadyGenerated.length ===
                    0 && (
                  <div className="flex min-h-[280px] flex-col items-center justify-center px-6 text-center">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100 text-neutral-400">
                      <Users size={21} />
                    </div>

                    <p className="font-semibold text-neutral-800">
                      No active residents
                    </p>

                    <p className="mt-1 max-w-md text-sm leading-6 text-neutral-400">
                      There are no active residents
                      available for this receipt month.
                    </p>
                  </div>
                )}
              </>
            )}
          </section>


          {/* =================================================
              ACTION BAR
          ================================================= */}

          <div className="sticky bottom-4 z-20 mt-5">
            <div className="flex flex-col gap-4 rounded-xl border border-neutral-200 bg-white p-4 shadow-lg sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-neutral-900">
                  {selectedIds.size}{" "}
                  resident
                  {selectedIds.size ===
                  1
                    ? ""
                    : "s"} selected
                </p>

                <p className="mt-0.5 text-xs text-neutral-400">
                  Total rent: ₹
                  {formatAmount(
                    selectedTotal
                  )}
                </p>

                {currentTenant && (
                  <p className="mt-1 truncate text-xs font-semibold text-[#b9563e]">
                    Sending receipt to{" "}
                    {currentTenant}...
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={
                  handleGenerateAndSend
                }
                disabled={
                  generating ||
                  selectedIds.size ===
                    0
                }
                className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-neutral-900 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto"
              >
                {generating ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />

                    Sending...
                  </>
                ) : (
                  <>
                    <Send size={17} />

                    Generate & Send

                    {selectedIds.size >
                      0 &&
                      ` (${selectedIds.size})`}
                  </>
                )}
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}


/* =========================================================
   STAT CARD
========================================================= */

function StatCard({
  icon: Icon,
  label,
  value,
  success = false,
}) {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
            success
              ? "bg-emerald-50 text-emerald-600"
              : "bg-[#f9e9e4] text-[#b9563e]"
          }`}
        >
          <Icon size={17} />
        </div>

        <div className="min-w-0">
          <p className="text-xs font-medium text-neutral-400">
            {label}
          </p>

          <p className="mt-0.5 text-xl font-bold text-neutral-900">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}


/* =========================================================
   TENANT ROW
========================================================= */

function TenantReceiptRow({
  tenant,
  selected = false,
  sent = false,
  disabled = false,
  onToggle,
}) {
  return (
    <div
      className={`flex flex-col gap-4 px-5 py-4 transition sm:flex-row sm:items-center ${
        sent
          ? "bg-neutral-50/70"
          : selected
          ? "bg-[#fffaf8]"
          : "hover:bg-neutral-50"
      }`}
    >
      {/* CHECKBOX */}

      <button
        type="button"
        onClick={onToggle}
        disabled={
          sent || disabled
        }
        aria-label={
          sent
            ? `${tenant.name} receipt already sent`
            : selected
            ? `Deselect ${tenant.name}`
            : `Select ${tenant.name}`
        }
        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition ${
          sent
            ? "cursor-not-allowed border-emerald-300 bg-emerald-500 text-white"
            : selected
            ? "border-[#b9563e] bg-[#b9563e] text-white"
            : "border-neutral-300 bg-white hover:border-neutral-400"
        }`}
      >
        {(sent || selected) && (
          <Check
            size={13}
            strokeWidth={3}
          />
        )}
      </button>


      {/* RESIDENT */}

      <div className="flex min-w-0 flex-1 items-center gap-3">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${
            sent
              ? "bg-emerald-50 text-emerald-600"
              : "bg-[#f9e9e4] text-[#b9563e]"
          }`}
        >
          {tenant.name
            ?.charAt(0)
            ?.toUpperCase()}
        </div>

        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-neutral-900">
            {tenant.name}
          </p>

          <div className="mt-0.5 flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-xs text-neutral-400">
            <span>
              Room {tenant.room}
            </span>

            <span>·</span>

            <span className="capitalize">
              {tenant.sharing}
            </span>

            <span>·</span>

            <span className="max-w-[240px] truncate">
              {tenant.email ||
                "No email"}
            </span>
          </div>
        </div>
      </div>


      {/* RENT + STATUS */}

      <div className="flex items-center justify-between gap-5 sm:justify-end">
        <div className="text-right">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400">
            Rent
          </p>

          <p className="mt-0.5 text-sm font-bold text-neutral-900">
            ₹
            {formatAmount(
              tenant.rent
            )}
          </p>
        </div>

        {sent ? (
          <div className="flex min-w-[100px] items-center justify-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
            <CheckCircle2
              size={13}
            />

            Sent
          </div>
        ) : (
          <div className="flex min-w-[100px] items-center justify-center gap-1.5 rounded-full bg-neutral-100 px-3 py-1.5 text-xs font-medium text-neutral-500">
            <Mail size={13} />

            Ready
          </div>
        )}
      </div>
    </div>
  );
}


export default ReceiptGeneration;