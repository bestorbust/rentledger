import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  FileText,
  IndianRupee,
  UserRound,
  Home,
  CreditCard,
  MessageCircle,
  Mail,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useState } from "react";
import { receiptService } from "../services/receiptService";
import { useTenants } from "../context/TenantContext";


function ReceiptGeneration() {
  const navigate = useNavigate();
  const { id } = useParams();

  const {getTenant} = useTenants();

  const tenant = getTenant(id);

  const [paymentDate,setPaymentDate]=useState("");
  const [paymentMode,setPaymentMode]=useState("");
  const [generating,setGenerating]=useState(false);
  const [error,setError]=useState("");
  
  const handleGenerate = async () => {
      setError("");

      if (!paymentDate) {
        setError("Please select the payment date.");
        return;
      }

      if (!paymentMode) {
        setError("Please select the payment mode.");
        return;
      }

      try {
        setGenerating(true);

        const receipt = await receiptService.generate(
          tenant.id,
          {
            paymentDate,
            paymentMode,
          }
        );

        navigate(
          `/receipts/${receipt.id}/preview`
        );
      } catch (err) {
        console.error(err);

        setError(
          err.response?.data?.detail ||
            "Unable to generate receipt."
        );
      } finally {
        setGenerating(false);
      }
    };

  if (!tenant) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f7f7f5]">
        <div className="text-center">
          <h2 className="text-lg font-semibold text-neutral-900">
            Resident not found
          </h2>

          <button
            onClick={() => navigate("/")}
            className="mt-4 rounded-lg bg-neutral-900 px-4 py-2 text-sm font-semibold text-white"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f7f5]">
      {/* Header */}
      <header className="flex h-20 items-center justify-between border-b border-neutral-200 bg-white px-8">
        <div>
          <p className="text-sm text-neutral-400">Receipt Management</p>
          <h1 className="text-lg font-semibold text-neutral-900">
            Generate Receipt
          </h1>
        </div>

        <div className="flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700">
          <CheckCircle2 size={14} />
          Resident Active
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8">
        {/* Back */}
        <button
          type="button"
          onClick={() => navigate("/")}
          className="mb-6 flex items-center gap-2 text-sm font-medium text-neutral-500 transition hover:text-neutral-900"
        >
          <ArrowLeft size={16} />
          Back to Residents
        </button>

        {/* Heading */}
        <div className="mb-7">
          <p className="mb-1 text-sm font-medium text-[#b9563e]">
            Rent Payment
          </p>

          <h2 className="text-2xl font-bold tracking-tight text-neutral-900">
            Generate rent receipt
          </h2>

          <p className="mt-1.5 text-sm text-neutral-500">
            Confirm the payment details before generating the receipt.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_420px]">
          {/* LEFT */}
          <div className="space-y-6">
            {/* Resident */}
            <section className="rounded-xl border border-neutral-200 bg-white">
              <div className="border-b border-neutral-100 px-6 py-5">
                <h3 className="text-base font-semibold text-neutral-900">
                  Resident
                </h3>

                <p className="mt-1 text-sm text-neutral-500">
                  Saved resident information.
                </p>
              </div>

              <div className="p-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#f9e9e4] text-base font-semibold text-[#b9563e]">
                    {tenant.name.charAt(0)}
                  </div>

                  <div>
                    <h4 className="font-semibold text-neutral-900">
                      {tenant.name}
                    </h4>

                    <p className="mt-0.5 text-sm text-neutral-500">
                      Room {tenant.room} · {tenant.sharing} Sharing
                    </p>
                  </div>
                </div>

                <div className="mt-6 grid gap-4 sm:grid-cols-3">
                  <InfoItem
                    icon={Home}
                    label="Room"
                    value={tenant.room}
                  />

                  <InfoItem
                    icon={IndianRupee}
                    label="Rent"
                    value={`₹${tenant.rent.toLocaleString("en-IN")}`}
                  />

                  <InfoItem
                    icon={CalendarDays}
                    label="Rent Month"
                    value={tenant.rent_month}
                  />
                </div>
              </div>
            </section>

            {/* Payment */}
            <section className="rounded-xl border border-neutral-200 bg-white">
              <div className="border-b border-neutral-100 px-6 py-5">
                <h3 className="text-base font-semibold text-neutral-900">
                  Payment Details
                </h3>

                <p className="mt-1 text-sm text-neutral-500">
                  These details apply only to this receipt.
                </p>
              </div>

              <div className="grid gap-5 p-6 sm:grid-cols-2">
                {/* Date */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-neutral-700">
                    Date of Payment
                  </label>

                  <div className="relative">
                    <CalendarDays
                      size={17}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
                    />

                    <input
                      type="date"
                      value={paymentDate}
                      onChange={(event)=>setPaymentDate(event.target.value)}
                      className="h-11 w-full rounded-lg border border-neutral-200 bg-white pl-10 pr-3 text-sm text-neutral-700 outline-none transition focus:border-[#d77a63] focus:ring-2 focus:ring-[#f9e9e4]"
                    />
                  </div>
                </div>

                {/* Payment mode */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-neutral-700">
                    Mode of Payment
                  </label>

                  <div className="relative">
                    <CreditCard
                      size={17}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
                    />

                    <select
                      value={paymentMode}
                      onChange={(event)=>setPaymentMode(event.target.value)}
                      className="h-11 w-full appearance-none rounded-lg border border-neutral-200 bg-white pl-10 pr-3 text-sm text-neutral-700 outline-none transition focus:border-[#d77a63] focus:ring-2 focus:ring-[#f9e9e4]"
                    >
                      <option value="" disabled>
                        Select payment mode
                      </option>
                      <option value="upi">UPI</option>
                      <option value="cash">Cash</option>
                      <option value="bank_transfer">
                        Bank Transfer
                      </option>
                      <option value="card">Card</option>
                    </select>
                  </div>
                </div>
              </div>
            </section>

            {/* Contact */}
            <section className="rounded-xl border border-neutral-200 bg-white">
              <div className="border-b border-neutral-100 px-6 py-5">
                <h3 className="text-base font-semibold text-neutral-900">
                  Delivery
                </h3>

                <p className="mt-1 text-sm text-neutral-500">
                  Choose how the generated receipt should be delivered.
                </p>
              </div>

              <div className="grid gap-3 p-6 sm:grid-cols-2">
                <DeliveryOption
                  icon={MessageCircle}
                  title="WhatsApp"
                  value={tenant.mobile}
                  available
                />

                <DeliveryOption
                  icon={Mail}
                  title="Email"
                  value={tenant.email}
                  available
                />
              </div>
            </section>
          </div>

          {/* RIGHT */}
          <aside>
            <div className="sticky top-6 rounded-xl border border-neutral-200 bg-white">
              <div className="border-b border-neutral-100 px-6 py-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#f9e9e4] text-[#b9563e]">
                    <FileText size={19} />
                  </div>

                  <div>
                    <h3 className="font-semibold text-neutral-900">
                      Receipt Summary
                    </h3>

                    <p className="text-xs text-neutral-400">
                      Ready to generate
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4 p-6">
                <SummaryRow
                  label="Resident"
                  value={tenant.name}
                />

                <SummaryRow
                  label="Room"
                  value={tenant.room}
                />

                <SummaryRow
                  label="Rent Month"
                  value={tenant.rent_month}
                />

                <div className="my-4 border-t border-dashed border-neutral-200" />

                <SummaryRow
                  label="Rent Amount"
                  value={`₹${tenant.rent.toLocaleString("en-IN")}`}
                  strong
                />

                <div className="rounded-lg bg-neutral-50 p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-neutral-500">
                      Receipt No.
                    </span>

                    <span className="text-sm font-semibold text-neutral-800">
                      Auto-generated
                    </span>
                  </div>
                </div>

                {error && (
                  <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                  </div>
                )}

                <button
                onClick={handleGenerate}
                disabled={generating}
                //  onClick={()=> navigate(`/receipts/${id}/preview`)}
                 className="mt-2 flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-neutral-900 text-sm font-semibold text-white shadow-sm transition hover:bg-neutral-800">
                  <FileText size={17} />
                  {generating ? "Generating..." : "Generate Receipt"}
                </button>

                <p className="text-center text-xs leading-5 text-neutral-400">
                  A PDF receipt will be generated using the official Sahana
                  Group receipt template.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}

function InfoItem({ icon: Icon, label, value }) {
  return (
    <div className="rounded-lg bg-neutral-50 p-3.5">
      <div className="flex items-center gap-2 text-neutral-400">
        <Icon size={15} />
        <span className="text-xs font-medium">{label}</span>
      </div>

      <p className="mt-2 text-sm font-semibold text-neutral-800">
        {value}
      </p>
    </div>
  );
}

function SummaryRow({ label, value, strong = false }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-sm text-neutral-500">{label}</span>

      <span
        className={`text-right text-sm ${
          strong
            ? "font-bold text-neutral-900"
            : "font-medium text-neutral-800"
        }`}
      >
        {value}
      </span>
    </div>
  );
}

function DeliveryOption({ icon: Icon, title, value, available }) {
  return (
    <button
      type="button"
      disabled={!available}
      className="flex items-center gap-3 rounded-lg border border-neutral-200 p-4 text-left transition hover:border-neutral-300 hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50"
    >
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-neutral-100 text-neutral-600">
        <Icon size={17} />
      </div>

      <div className="min-w-0">
        <p className="text-sm font-semibold text-neutral-800">{title}</p>
        <p className="truncate text-xs text-neutral-400">{value}</p>
      </div>
    </button>
  );
}

export default ReceiptGeneration;