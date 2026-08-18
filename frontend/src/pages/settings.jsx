import {
  Building2,
  Mail,
  MapPin,
  Phone,
  ReceiptText,
  Save,
  MessageCircle,
} from "lucide-react";
import { useState } from "react";

const initialSettings = {
  groupName: "Sahana Group",
  propertyName: "Sahana Ladies PG",
  address: "Bengaluru, Karnataka",
  phone: "+91 98765 43210",
  email: "admin@sahanagroup.com",
  receiptPrefix: "SLP",
};

function Settings() {
  const [settings, setSettings] = useState(initialSettings);
  const [saved, setSaved] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setSettings((current) => ({
      ...current,
      [name]: value,
    }));

    setSaved(false);
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    // Backend will persist this later.
    setSaved(true);
  };

  return (
    <div className="min-h-screen bg-[#f7f7f5]">
      {/* Header */}
      <header className="flex h-20 items-center border-b border-neutral-200 bg-white px-8">
        <div>
          <p className="text-sm text-neutral-400">System</p>

          <h1 className="text-lg font-semibold text-neutral-900">
            Settings
          </h1>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-8">
        {/* Heading */}
        <div className="mb-7">
          <p className="mb-1 text-sm font-medium text-[#b9563e]">
            Configuration
          </p>

          <h2 className="text-2xl font-bold tracking-tight text-neutral-900">
            Property settings
          </h2>

          <p className="mt-1.5 text-sm leading-6 text-neutral-500">
            Manage the information used across your RentLedger application
            and rent receipts.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Property */}
          <section className="rounded-xl border border-neutral-200 bg-white">
            <div className="border-b border-neutral-100 px-6 py-5">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#f9e9e4] text-[#b9563e]">
                  <Building2 size={18} />
                </div>

                <div>
                  <h3 className="text-base font-semibold text-neutral-900">
                    Property Information
                  </h3>

                  <p className="mt-0.5 text-sm text-neutral-500">
                    Information displayed on generated receipts.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-5 p-6 md:grid-cols-2">
              <FormField
                label="Group / Business Name"
                name="groupName"
                value={settings.groupName}
                onChange={handleChange}
                placeholder="Sahana Group"
              />

              <FormField
                label="Property Name"
                name="propertyName"
                value={settings.propertyName}
                onChange={handleChange}
                placeholder="Sahana Ladies PG"
              />

              <div className="md:col-span-2">
                <FormField
                  label="Property Address"
                  name="address"
                  value={settings.address}
                  onChange={handleChange}
                  placeholder="Enter property address"
                  icon={MapPin}
                />
              </div>

              <FormField
                label="Contact Number"
                name="phone"
                value={settings.phone}
                onChange={handleChange}
                placeholder="+91..."
                icon={Phone}
              />

              <FormField
                label="Email Address"
                name="email"
                value={settings.email}
                onChange={handleChange}
                placeholder="admin@example.com"
                icon={Mail}
                type="email"
              />
            </div>
          </section>

          {/* Receipt */}
          <section className="rounded-xl border border-neutral-200 bg-white">
            <div className="border-b border-neutral-100 px-6 py-5">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#f9e9e4] text-[#b9563e]">
                  <ReceiptText size={18} />
                </div>

                <div>
                  <h3 className="text-base font-semibold text-neutral-900">
                    Receipt Configuration
                  </h3>

                  <p className="mt-0.5 text-sm text-neutral-500">
                    Configure how receipt numbers are generated.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="max-w-sm">
                <FormField
                  label="Receipt Number Prefix"
                  name="receiptPrefix"
                  value={settings.receiptPrefix}
                  onChange={handleChange}
                  placeholder="SLP"
                />

                <p className="mt-2 text-xs leading-5 text-neutral-400">
                  Example:{" "}
                  <span className="font-medium text-neutral-500">
                    {settings.receiptPrefix || "SLP"}-2026-000124
                  </span>
                </p>
              </div>
            </div>
          </section>

          {/* WhatsApp */}
          <section className="rounded-xl border border-neutral-200 bg-white">
            <div className="border-b border-neutral-100 px-6 py-5">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                  <MessageCircle size={18} />
                </div>

                <div>
                  <h3 className="text-base font-semibold text-neutral-900">
                    WhatsApp
                  </h3>

                  <p className="mt-0.5 text-sm text-neutral-500">
                    Connect the owner's WhatsApp account for receipt delivery.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="flex flex-col justify-between gap-5 rounded-lg border border-neutral-200 bg-neutral-50 p-5 sm:flex-row sm:items-center">
                <div>
                  <p className="text-sm font-semibold text-neutral-800">
                    WhatsApp account
                  </p>

                  <p className="mt-1 text-xs leading-5 text-neutral-400">
                    The WhatsApp connection will be configured after the
                    backend and WhatsApp service are implemented.
                  </p>
                </div>

                <span className="inline-flex shrink-0 items-center rounded-full bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700">
                  Not connected
                </span>
              </div>
            </div>
          </section>

          {/* Save */}
          <div className="flex items-center justify-end gap-4 pb-8">
            {saved && (
              <p className="text-sm font-medium text-emerald-600">
                Settings saved
              </p>
            )}

            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-lg bg-neutral-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-neutral-800"
            >
              <Save size={16} />
              Save Settings
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}

function FormField({
  label,
  name,
  value,
  onChange,
  placeholder,
  icon: Icon,
  type = "text",
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-neutral-700">
        {label}
      </label>

      <div className="relative">
        {Icon && (
          <Icon
            size={17}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
          />
        )}

        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`h-11 w-full rounded-lg border border-neutral-200 bg-white pr-4 text-sm text-neutral-800 outline-none transition placeholder:text-neutral-400 focus:border-[#d77a63] focus:ring-2 focus:ring-[#f9e9e4] ${
            Icon ? "pl-10" : "pl-3"
          }`}
        />
      </div>
    </div>
  );
}

export default Settings;