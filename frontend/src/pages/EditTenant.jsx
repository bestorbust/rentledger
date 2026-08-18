import {
  ArrowLeft,
  Mail,
  Phone,
  UserRound,
  Home,
  IndianRupee,
  Save,
  Archive,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useTenants } from "../context/TenantContext";
import { useEffect, useState } from "react";

function EditTenant() {
  const navigate = useNavigate();
  const { id } = useParams();

  const {
    getTenant,
    updateTenant,
    deactivateTenant,
  } = useTenants();

  const tenant = getTenant(id);

  const [formData, setFormData] = useState(null);

  // Load tenant data into the form
  useEffect(() => {
    if (tenant) {
      setFormData({
        name: tenant.name || "",
        room: tenant.room || "",
        rent: tenant.rent ?? "",
        sharing: tenant.sharing || "single",
        rent_month: tenant.rent_month || "",
        mobile: tenant.mobile || "",
        email: tenant.email || "",
      });
    }
  }, [tenant]);

  // Handle form changes
  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  // Save changes
  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formData) {
      return;
    }

    if (!formData.rent_month) {
      window.alert("Please select a rent month.");
      return;
    }

    try {
      await updateTenant(id, {
        ...formData,
        rent: Number(formData.rent),
      });

      navigate("/");
    } catch (error) {
      console.error("Failed to update tenant:", error);

      window.alert(
        error?.message || "Failed to update resident."
      );
    }
  };

  // Deactivate resident
  const handleDeactivate = async () => {
    if (!tenant) {
      return;
    }

    const confirmed = window.confirm(
      `Deactivate ${tenant.name}? They will be moved to Archived Residents.`
    );

    if (!confirmed) {
      return;
    }

    try {
      await deactivateTenant(id);
      navigate("/archived");
    } catch (error) {
      console.error("Failed to deactivate tenant:", error);

      window.alert(
        error?.message || "Failed to deactivate resident."
      );
    }
  };

  // Tenant hasn't loaded yet
  if (!tenant || !formData) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f7f7f5]">
        <div className="text-center">
          <p className="text-sm font-medium text-neutral-700">
            Loading resident...
          </p>

          <p className="mt-1 text-xs text-neutral-400">
            Please wait.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f7f5]">
      {/* Header */}
      <header className="flex h-20 items-center justify-between border-b border-neutral-200 bg-white px-8">
        <div>
          <p className="text-sm text-neutral-400">
            Resident Management
          </p>

          <h1 className="text-lg font-semibold text-neutral-900">
            Edit Resident
          </h1>
        </div>

        <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
          Active Resident
        </span>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-8">
        {/* Back */}
        <button
          type="button"
          onClick={() => navigate("/")}
          className="mb-6 flex items-center gap-2 text-sm font-medium text-neutral-500 transition hover:text-neutral-900"
        >
          <ArrowLeft size={16} />
          Back to Residents
        </button>

        {/* Page Heading */}
        <div className="mb-7">
          <p className="mb-1 text-sm font-medium text-[#b9563e]">
            Resident Management
          </p>

          <h2 className="text-2xl font-bold tracking-tight text-neutral-900">
            Edit resident details
          </h2>

          <p className="mt-1.5 text-sm text-neutral-500">
            Update the information stored for this resident.
          </p>
        </div>

        <form
          className="space-y-6"
          onSubmit={handleSubmit}
        >
          {/* Resident Details */}
          <section className="rounded-xl border border-neutral-200 bg-white">
            <div className="border-b border-neutral-100 px-6 py-5">
              <h3 className="text-base font-semibold text-neutral-900">
                Resident Details
              </h3>

              <p className="mt-1 text-sm text-neutral-500">
                Basic information about the resident.
              </p>
            </div>

            <div className="grid gap-5 p-6 md:grid-cols-2">
              {/* Name */}
              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-neutral-700">
                  Resident Name
                </label>

                <div className="relative">
                  <UserRound
                    size={17}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
                  />

                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="h-11 w-full rounded-lg border border-neutral-200 bg-white pl-10 pr-4 text-sm outline-none transition focus:border-[#d77a63] focus:ring-2 focus:ring-[#f9e9e4]"
                  />
                </div>
              </div>

              {/* Room */}
              <div>
                <label className="mb-2 block text-sm font-medium text-neutral-700">
                  Room No.
                </label>

                <div className="relative">
                  <Home
                    size={17}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
                  />

                  <input
                    type="text"
                    name="room"
                    value={formData.room}
                    onChange={handleChange}
                    className="h-11 w-full rounded-lg border border-neutral-200 bg-white pl-10 pr-4 text-sm outline-none transition focus:border-[#d77a63] focus:ring-2 focus:ring-[#f9e9e4]"
                  />
                </div>
              </div>

              {/* Sharing */}
              <div>
                <label className="mb-2 block text-sm font-medium text-neutral-700">
                  Sharing
                </label>

                <select
                  name="sharing"
                  value={formData.sharing}
                  onChange={handleChange}
                  className="h-11 w-full rounded-lg border border-neutral-200 bg-white px-3 text-sm outline-none transition focus:border-[#d77a63] focus:ring-2 focus:ring-[#f9e9e4]"
                >
                  <option value="single">Single</option>
                  <option value="double">Double</option>
                  <option value="triple">Triple</option>
                  <option value="four">Four Sharing</option>
                </select>
              </div>
            </div>
          </section>

          {/* Rent Details */}
          <section className="rounded-xl border border-neutral-200 bg-white">
            <div className="border-b border-neutral-100 px-6 py-5">
              <h3 className="text-base font-semibold text-neutral-900">
                Rent Details
              </h3>

              <p className="mt-1 text-sm text-neutral-500">
                These values are used when generating future receipts.
              </p>
            </div>

            <div className="grid gap-5 p-6 md:grid-cols-2">
              {/* Rent */}
              <div>
                <label className="mb-2 block text-sm font-medium text-neutral-700">
                  Rent Amount
                </label>

                <div className="relative">
                  <IndianRupee
                    size={17}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
                  />

                  <input
                    type="number"
                    min="0"
                    name="rent"
                    value={formData.rent}
                    onChange={handleChange}
                    className="h-11 w-full rounded-lg border border-neutral-200 bg-white pl-10 pr-4 text-sm outline-none transition focus:border-[#d77a63] focus:ring-2 focus:ring-[#f9e9e4]"
                  />
                </div>
              </div>

              {/* Rent Month */}
              <div>
                <label className="mb-2 block text-sm font-medium text-neutral-700">
                  Rent Month
                </label>

                <select
                  name="rent_month"
                  value={formData.rent_month}
                  onChange={handleChange}
                  className="h-11 w-full rounded-lg border border-neutral-200 bg-white px-3 text-sm text-neutral-700 outline-none transition focus:border-[#d77a63] focus:ring-2 focus:ring-[#f9e9e4]"
                >
                  <option value="" disabled>
                    Select rent month
                  </option>

                  <option value="previous">
                    Previous
                  </option>

                  <option value="ongoing">
                    Ongoing
                  </option>
                </select>
              </div>
            </div>
          </section>

          {/* Contact */}
          <section className="rounded-xl border border-neutral-200 bg-white">
            <div className="border-b border-neutral-100 px-6 py-5">
              <h3 className="text-base font-semibold text-neutral-900">
                Contact Information
              </h3>

              <p className="mt-1 text-sm text-neutral-500">
                Contact details used for receipt delivery.
              </p>
            </div>

            <div className="grid gap-5 p-6 md:grid-cols-2">
              {/* Mobile */}
              <div>
                <label className="mb-2 block text-sm font-medium text-neutral-700">
                  Mobile Number
                </label>

                <div className="relative">
                  <Phone
                    size={17}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
                  />

                  <input
                    type="tel"
                    name="mobile"
                    value={formData.mobile}
                    onChange={handleChange}
                    className="h-11 w-full rounded-lg border border-neutral-200 bg-white pl-10 pr-4 text-sm outline-none transition focus:border-[#d77a63] focus:ring-2 focus:ring-[#f9e9e4]"
                  />
                </div>

                <p className="mt-1.5 text-xs text-neutral-400">
                  Used for WhatsApp receipt delivery.
                </p>
              </div>

              {/* Email */}
              <div>
                <label className="mb-2 block text-sm font-medium text-neutral-700">
                  Email
                </label>

                <div className="relative">
                  <Mail
                    size={17}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
                  />

                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="h-11 w-full rounded-lg border border-neutral-200 bg-white pl-10 pr-4 text-sm outline-none transition focus:border-[#d77a63] focus:ring-2 focus:ring-[#f9e9e4]"
                  />
                </div>

                <p className="mt-1.5 text-xs text-neutral-400">
                  Used for email receipt delivery.
                </p>
              </div>
            </div>
          </section>

          {/* Actions */}
          <div className="flex flex-col-reverse gap-3 pb-8 sm:flex-row sm:items-center sm:justify-between">
            {/* Deactivate */}
            <button
              type="button"
              onClick={handleDeactivate}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50"
            >
              <Archive size={16} />
              Deactivate Resident
            </button>

            <div className="flex justify-end gap-3">
              {/* Cancel */}
              <button
                type="button"
                onClick={() => navigate("/")}
                className="rounded-lg border border-neutral-200 bg-white px-5 py-2.5 text-sm font-semibold text-neutral-600 transition hover:bg-neutral-50"
              >
                Cancel
              </button>

              {/* Save */}
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-lg bg-neutral-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-neutral-800"
              >
                <Save size={16} />
                Save Changes
              </button>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}

export default EditTenant;