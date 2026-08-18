import { useState } from "react";
import {
  MoreHorizontal,
  MessageCircle,
  Mail,
  FileText,
  Pencil,
  Archive,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTenants } from "../../context/TenantContext";

function TenantTable() {
  const navigate = useNavigate();

  const [openMenu, setOpenMenu] = useState(null);

  const {
    activeTenants,
    deactivateTenant,
  } = useTenants();

  const handleDeactivate = async (tenant) => {
    const confirmed = window.confirm(
      `Deactivate ${tenant.name}? They will be moved to Archived Residents.`
    );

    if (!confirmed) {
      return;
    }

    try {
      await deactivateTenant(tenant.id);

      // Close dropdown after successful deactivation
      setOpenMenu(null);
    } catch (error) {
      console.error("Failed to deactivate resident:", error);

      window.alert(
        error.message || "Failed to deactivate resident."
      );
    }
  };

  return (
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
                Sharing
              </th>

              <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-neutral-400">
                Rent Month
              </th>

              <th className="px-4 py-3.5 text-right text-xs font-semibold uppercase tracking-wide text-neutral-400">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {activeTenants.map((tenant) => (
              <tr
                key={tenant.id}
                className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50/50"
              >
                {/* Resident */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f9e9e4] text-sm font-semibold text-[#b9563e]">
                      {tenant.name?.charAt(0)?.toUpperCase()}
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

                {/* Sharing */}
                <td className="px-4 py-4 text-sm text-neutral-600">
                  {tenant.sharing}
                </td>

                {/* Rent Month */}
                <td className="px-4 py-4 text-sm text-neutral-600">
                  {tenant.rent_month}
                </td>

                {/* Actions */}
                <td className="px-4 py-4">
                  <div className="relative flex items-center justify-end gap-1">
                    {/* Generate Receipt */}
                    <button
                      type="button"
                      title="Generate receipt"
                      onClick={() =>
                        navigate(
                          `/residents/${tenant.id}/receipt`
                        )
                      }
                      className="flex h-8 w-8 items-center justify-center rounded-md text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-900"
                    >
                      <FileText size={16} />
                    </button>

                    {/* WhatsApp */}
                    <button
                      type="button"
                      title="WhatsApp"
                      className="flex h-8 w-8 items-center justify-center rounded-md text-neutral-500 transition hover:bg-[#e8f7ed] hover:text-[#168a45]"
                    >
                      <MessageCircle size={16} />
                    </button>

                    {/* Email */}
                    <button
                      type="button"
                      title="Email"
                      className="flex h-8 w-8 items-center justify-center rounded-md text-neutral-500 transition hover:bg-blue-50 hover:text-blue-600"
                    >
                      <Mail size={16} />
                    </button>

                    {/* More */}
                    <button
                      type="button"
                      title="More"
                      onClick={() =>
                        setOpenMenu(
                          openMenu === tenant.id
                            ? null
                            : tenant.id
                        )
                      }
                      className="ml-1 flex h-8 w-8 items-center justify-center rounded-md text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-800"
                    >
                      <MoreHorizontal size={18} />
                    </button>

                    {/* Dropdown */}
                    {openMenu === tenant.id && (
                      <div className="absolute right-0 top-10 z-20 w-44 rounded-lg border border-neutral-200 bg-white p-1.5 shadow-lg">
                        {/* Edit */}
                        <button
                          type="button"
                          onClick={() => {
                            setOpenMenu(null);
                            navigate(
                              `/residents/${tenant.id}/edit`
                            );
                          }}
                          className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-neutral-700 hover:bg-neutral-50"
                        >
                          <Pencil size={15} />
                          Edit Resident
                        </button>

                        {/* Deactivate */}
                        <button
                          type="button"
                          onClick={() =>
                            handleDeactivate(tenant)
                          }
                          className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                        >
                          <Archive size={15} />
                          Deactivate
                        </button>
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default TenantTable;