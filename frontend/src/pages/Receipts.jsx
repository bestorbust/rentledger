import {
  CalendarDays,
  ChevronDown,
  Download,
  Eye,
  FileText,
  Search,
  Send,
} from "lucide-react";

import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

import Sidebar from "../components/layout/Sidebar";
import { receiptService } from "../services/receiptService";

function Receipts() {
  const navigate = useNavigate();

  const [sidebarOpen, setSideBarOpen] = useState(true);

  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");

  useEffect(() => {
    const loadReceipts = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await receiptService.getAll();

        setReceipts(data);
      } catch (err) {
        console.error("Failed to load receipts:", err);

        setError(
          err.response?.data?.detail ||
            "Unable to load receipts."
        );
      } finally {
        setLoading(false);
      }
    };

    loadReceipts();
  }, []);

  // Search
  const filteredReceipts = receipts.filter((receipt) => {
    const query = search.toLowerCase().trim();

    if (!query) {
      return true;
    }

    return (
      receipt.receipt_number
        ?.toLowerCase()
        .includes(query) ||
      receipt.resident_name
        ?.toLowerCase()
        .includes(query) ||
      receipt.room_no
        ?.toLowerCase()
        .includes(query)
    );
  });

  // Format payment date
  const formatDate = (date) => {
    if (!date) {
      return "—";
    }

    return new Date(date).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  // Format amount
  const formatAmount = (amount) => {
    return `₹${Number(amount || 0).toLocaleString(
      "en-IN"
    )}`;
  };

  return (
    <div className="min-h-screen bg-[#f7f7f5]">
      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        setIsOpen={setSideBarOpen}
      />

      {/* Main content */}
      <div
        className={`min-h-screen transition-all duration-300 ${
          sidebarOpen ? "ml-64" : "ml-20"
        }`}
      >
        {/* Header */}
        <header className="flex h-20 items-center justify-between border-b border-neutral-200 bg-white px-8">
          <div>
            <p className="text-sm text-neutral-400">
              Financial Records
            </p>

            <h1 className="text-lg font-semibold text-neutral-900">
              Rent Receipts
            </h1>
          </div>

          <div className="flex items-center gap-2 rounded-full bg-neutral-100 px-3 py-1.5 text-xs font-medium text-neutral-600">
            <FileText size={14} />
            {receipts.length} Records
          </div>
        </header>

        <main className="mx-auto max-w-7xl px-6 py-8">
          {/* Heading */}
          <div className="mb-7">
            <p className="mb-1 text-sm font-medium text-[#b9563e]">
              Receipt History
            </p>

            <h2 className="text-2xl font-bold tracking-tight text-neutral-900">
              Rent receipts
            </h2>

            <p className="mt-1.5 max-w-2xl text-sm leading-6 text-neutral-500">
              View and manage all generated rent payment
              receipts.
            </p>
          </div>

          {/* Search */}
          <div className="mb-5 flex flex-col gap-3 rounded-xl border border-neutral-200 bg-white p-4 lg:flex-row lg:items-center">
            <div className="relative flex-1">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
              />

              <input
                type="text"
                placeholder="Search resident, room or receipt number..."
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                className="h-10 w-full rounded-lg border border-neutral-200 bg-white pl-9 pr-3 text-sm outline-none transition placeholder:text-neutral-400 focus:border-[#d77a63] focus:ring-2 focus:ring-[#f9e9e4]"
              />
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-5 py-4">
              <p className="text-sm font-medium text-red-700">
                {error}
              </p>
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div className="rounded-xl border border-neutral-200 bg-white px-6 py-12 text-center">
              <p className="text-sm text-neutral-500">
                Loading receipts...
              </p>
            </div>
          )}

          {/* Empty */}
          {!loading &&
            !error &&
            filteredReceipts.length === 0 && (
              <div className="rounded-xl border border-neutral-200 bg-white px-6 py-12 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100 text-neutral-400">
                  <FileText size={20} />
                </div>

                <h3 className="mt-4 text-sm font-semibold text-neutral-800">
                  {search
                    ? "No receipts found"
                    : "No receipts yet"}
                </h3>

                <p className="mt-1 text-sm text-neutral-500">
                  {search
                    ? "Try a different search."
                    : "Generated receipts will appear here."}
                </p>
              </div>
            )}

          {/* Table */}
          {!loading &&
            !error &&
            filteredReceipts.length > 0 && (
              <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[1100px]">
                    <thead>
                      <tr className="border-b border-neutral-200 bg-neutral-50/70">
                        <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-neutral-400">
                          Receipt
                        </th>

                        <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-neutral-400">
                          Resident
                        </th>

                        <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-neutral-400">
                          Rent Month
                        </th>

                        <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-neutral-400">
                          Payment Date
                        </th>

                        <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-neutral-400">
                          Amount
                        </th>

                        <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-neutral-400">
                          Mode
                        </th>

                        <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-neutral-400">
                          Status
                        </th>

                        <th className="px-4 py-3.5 text-right text-xs font-semibold uppercase tracking-wide text-neutral-400">
                          Actions
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {filteredReceipts.map((receipt) => (
                        <tr
                          key={receipt.id}
                          className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50/50"
                        >
                          {/* Receipt */}
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#f9e9e4] text-[#b9563e]">
                                <FileText size={16} />
                              </div>

                              <div>
                                <p className="text-sm font-semibold text-neutral-800">
                                  {receipt.receipt_number}
                                </p>

                                <p className="mt-0.5 text-xs text-neutral-400">
                                  Room {receipt.room_no}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* Resident */}
                          <td className="px-4 py-4">
                            <p className="text-sm font-medium text-neutral-800">
                              {receipt.resident_name}
                            </p>
                          </td>

                          {/* Rent month */}
                          <td className="px-4 py-4 text-sm text-neutral-600">
                            {receipt.rent_month}
                          </td>

                          {/* Payment date */}
                          <td className="px-4 py-4 text-sm text-neutral-600">
                            {formatDate(
                              receipt.payment_date
                            )}
                          </td>

                          {/* Amount */}
                          <td className="px-4 py-4 text-sm font-bold text-neutral-800">
                            {formatAmount(
                              receipt.rent_amount
                            )}
                          </td>

                          {/* Mode */}
                          <td className="px-4 py-4">
                            <span className="rounded-md bg-neutral-100 px-2.5 py-1 text-xs font-medium text-neutral-600">
                              {receipt.payment_mode}
                            </span>
                          </td>

                          {/* Status */}
                          <td className="px-4 py-4">
                            <StatusBadge
                              status={receipt.status}
                            />
                          </td>

                          {/* Actions */}
                          <td className="px-4 py-4">
                            <div className="flex justify-end gap-1">
                              {/* View */}
                              <button
                                type="button"
                                title="View receipt"
                                onClick={() =>
                                  navigate(
                                    `/receipts/${receipt.id}/preview`
                                  )
                                }
                                className="flex h-8 w-8 items-center justify-center rounded-md text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-900"
                              >
                                <Eye size={16} />
                              </button>

                              {/* Download */}
                              <button
                                type="button"
                                title="Download"
                                onClick={() =>
                                  navigate(
                                    `/receipts/${receipt.id}/preview`
                                  )
                                }
                                className="flex h-8 w-8 items-center justify-center rounded-md text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-900"
                              >
                                <Download size={16} />
                              </button>

                              {/* Send */}
                              <button
                                type="button"
                                title="Send"
                                className="flex h-8 w-8 items-center justify-center rounded-md text-neutral-500 transition hover:bg-[#e8f7ed] hover:text-[#168a45]"
                              >
                                <Send size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
        </main>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const normalizedStatus =
    status?.toUpperCase();

  const generated =
    normalizedStatus === "GENERATED";

  const sent =
    normalizedStatus === "SENT";

  const voided =
    normalizedStatus === "VOID";

  return (
    <span
      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
        sent
          ? "bg-emerald-50 text-emerald-700"
          : voided
          ? "bg-red-50 text-red-700"
          : generated
          ? "bg-amber-50 text-amber-700"
          : "bg-neutral-100 text-neutral-600"
      }`}
    >
      {status || "—"}
    </span>
  );
}

export default Receipts;