import {
  ArchiveRestore,
  FileText,
  MoreHorizontal,
  Search,
  UserRound,
} from "lucide-react";
import { useState } from "react";
import { useTenants } from "../context/TenantContext";
import Sidebar from "../components/layout/Sidebar";

function ArchivedTenants() {
  const {
    archivedTenants,
    restoreTenant,
    loading,
  } = useTenants();

  const [sidebarOpen, setSideBarOpen] = useState(true);
  const [search, setSearch] = useState("");

  const handleRestore = async (tenant) => {
    const confirmed = window.confirm(
      `Restore ${tenant.name}? They will be moved back to Active Residents.`
    );

    if (!confirmed) {
      return;
    }

    try {
      await restoreTenant(tenant.id);
    } catch (error) {
      console.error("Failed to restore resident:", error);

      window.alert(
        error.message || "Failed to restore resident."
      );
    }
  };

  const filteredTenants = archivedTenants.filter((tenant) => {
    const query = search.toLowerCase().trim();

    if (!query) {
      return true;
    }

    return (
      tenant.name?.toLowerCase().includes(query) ||
      tenant.room?.toLowerCase().includes(query) ||
      tenant.mobile?.toLowerCase().includes(query) ||
      tenant.email?.toLowerCase().includes(query)
    );
  });

  return (
    <div className="min-h-screen bg-[#f7f7f5]">
      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        setIsOpen={setSideBarOpen}
      />

      {/* Main Content */}
      <div
        className={`min-h-screen transition-all duration-300 ${
          sidebarOpen ? "ml-64" : "ml-20"
        }`}
      >
        {/* Header */}
        <header className="flex h-20 items-center justify-between border-b border-neutral-200 bg-white px-8">
          <div>
            <p className="text-sm text-neutral-400">
              Resident Management
            </p>

            <h1 className="text-lg font-semibold text-neutral-900">
              Archived Residents
            </h1>
          </div>

          <span className="rounded-full bg-neutral-100 px-3 py-1.5 text-xs font-medium text-neutral-500">
            {archivedTenants.length} Archived
          </span>
        </header>

        <main className="mx-auto max-w-6xl px-6 py-8">
          {/* Heading */}
          <div className="mb-7">
            <p className="mb-1 text-sm font-medium text-[#b9563e]">
              Resident History
            </p>

            <h2 className="text-2xl font-bold tracking-tight text-neutral-900">
              Archived residents
            </h2>

            <p className="mt-1.5 max-w-2xl text-sm leading-6 text-neutral-500">
              Residents who are no longer active are kept here
              for historical records and receipt history.
            </p>
          </div>

          {/* Info Banner */}
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-5 py-4">
            <div className="mt-0.5 rounded-full bg-amber-100 p-1.5 text-amber-700">
              <ArchiveRestore size={15} />
            </div>

            <div>
              <p className="text-sm font-semibold text-amber-900">
                Historical records are preserved
              </p>

              <p className="mt-1 text-xs leading-5 text-amber-800">
                Archiving a resident removes them from the
                active list without deleting their previous
                receipts or information.
              </p>
            </div>
          </div>

          {/* Search */}
          <div className="mb-4 flex items-center justify-between gap-4">
            <div className="relative">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
              />

              <input
                type="text"
                placeholder="Search archived residents..."
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                className="h-10 w-64 rounded-lg border border-neutral-200 bg-white pl-9 pr-3 text-sm outline-none transition placeholder:text-neutral-400 focus:border-[#d77a63] focus:ring-2 focus:ring-[#f9e9e4]"
              />
            </div>
          </div>

          {/* Loading */}
          {loading && (
            <div className="rounded-xl border border-neutral-200 bg-white px-6 py-12 text-center">
              <p className="text-sm text-neutral-500">
                Loading archived residents...
              </p>
            </div>
          )}

          {/* Empty State */}
          {!loading && filteredTenants.length === 0 && (
            <div className="rounded-xl border border-neutral-200 bg-white px-6 py-12 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100 text-neutral-400">
                <ArchiveRestore size={20} />
              </div>

              <h3 className="mt-4 text-sm font-semibold text-neutral-800">
                {search
                  ? "No residents found"
                  : "No archived residents"}
              </h3>

              <p className="mt-1 text-sm text-neutral-500">
                {search
                  ? "Try a different search."
                  : "Deactivated residents will appear here."}
              </p>
            </div>
          )}

          {/* Table */}
          {!loading && filteredTenants.length > 0 && (
            <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px]">
                  <thead>
                    <tr className="border-b border-neutral-200 bg-neutral-50/70">
                      <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-neutral-400">
                        Resident
                      </th>

                      <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-neutral-400">
                        Room
                      </th>

                      <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-neutral-400">
                        Rent
                      </th>

                      <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-neutral-400">
                        Last Rent Month
                      </th>

                      <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-neutral-400">
                        Archived On
                      </th>

                      <th className="px-4 py-3.5 text-right text-xs font-semibold uppercase tracking-wide text-neutral-400">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredTenants.map((tenant) => (
                      <tr
                        key={tenant.id}
                        className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50/50"
                      >
                        {/* Resident */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-100 text-neutral-500">
                              <UserRound size={17} />
                            </div>

                            <div>
                              <p className="text-sm font-semibold text-neutral-800">
                                {tenant.name}
                              </p>

                              <p className="mt-0.5 text-xs text-neutral-400">
                                {tenant.mobile}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Room */}
                        <td className="px-4 py-4">
                          <span className="rounded-md bg-neutral-100 px-2.5 py-1 text-sm font-medium text-neutral-700">
                            {tenant.room}
                          </span>
                        </td>

                        {/* Rent */}
                        <td className="px-4 py-4 text-sm font-semibold text-neutral-800">
                          ₹{tenant.rent}
                        </td>

                        {/* Rent Month */}
                        <td className="px-4 py-4 text-sm text-neutral-600">
                          {tenant.rent_month}
                        </td>

                        {/* Archived On */}
                        <td className="px-4 py-4 text-sm text-neutral-500">
                          {tenant.updated_at
                            ? new Date(
                                tenant.updated_at
                              ).toLocaleDateString("en-IN")
                            : "—"}
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-4">
                          <div className="flex justify-end gap-1">
                            {/* View Receipts */}
                            <button
                              type="button"
                              title="View receipts"
                              onClick={() =>
                                console.log(
                                  "View receipts:",
                                  tenant.id
                                )
                              }
                              className="flex h-8 w-8 items-center justify-center rounded-md text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-900"
                            >
                              <FileText size={16} />
                            </button>

                            {/* Restore */}
                            <button
                              type="button"
                              title="Restore resident"
                              onClick={() =>
                                handleRestore(tenant)
                              }
                              className="flex h-8 w-8 items-center justify-center rounded-md text-neutral-500 transition hover:bg-emerald-50 hover:text-emerald-600"
                            >
                              <ArchiveRestore size={16} />
                            </button>

                            {/* More */}
                            <button
                              type="button"
                              title="More"
                              className="flex h-8 w-8 items-center justify-center rounded-md text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-800"
                            >
                              <MoreHorizontal size={18} />
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

export default ArchivedTenants;