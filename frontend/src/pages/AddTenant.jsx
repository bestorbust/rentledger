import { ArrowLeft, Mail, Phone, UserRound, Home, IndianRupee } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import {useTenants} from "../context/TenantContext"
function AddTenant() {
  const navigate=useNavigate();
  const {addTenant} = useTenants();

  const [formData,setFormData] = useState({
    name:"",
    room:"",
    rent:"",
    sharing:"",
    rent_month:"",
    mobile:"",
    email:""
  })

  const handleChange=(event)=>{
    const {name,value} = event.target;

    setFormData((current)=> ({
      ...current,
      [name]:value,
    }));
  };

  const handleSubmit = (event)=>{
    event.preventDefault();

    addTenant({
      ...formData,
      rent:Number(formData.rent),
    });
    navigate("/")
  };


  return (
    <div className="min-h-screen bg-[#f7f7f5]">
      {/* Header */}
      <header className="flex h-20 items-center border-b border-neutral-200 bg-white px-8">
        <div>
          <p className="text-sm text-neutral-400">Resident Management</p>
          <h1 className="text-lg font-semibold text-neutral-900">
            Add Resident
          </h1>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-8">
        {/* Back */}
        <button
        onClick={()=>navigate("/")}
          type="button"
          className="mb-6 flex items-center gap-2 text-sm font-medium text-neutral-500 transition hover:text-neutral-900"
        >
          <ArrowLeft size={16} />
          Back to Residents
        </button>

        {/* Heading */}
        <div className="mb-7">
          <h2 className="text-2xl font-bold tracking-tight text-neutral-900">
            Add a new resident
          </h2>

          <p className="mt-1.5 text-sm text-neutral-500">
            Enter the resident details used for future rent receipts.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal details */}
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
                    placeholder="Enter resident's full name"
                    className="h-11 w-full rounded-lg border border-neutral-200 bg-white pl-10 pr-4 text-sm text-neutral-800 outline-none transition placeholder:text-neutral-400 focus:border-[#d77a63] focus:ring-2 focus:ring-[#f9e9e4]"
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
                    placeholder="e.g. 101"
                    className="h-11 w-full rounded-lg border border-neutral-200 bg-white pl-10 pr-4 text-sm text-neutral-800 outline-none transition placeholder:text-neutral-400 focus:border-[#d77a63] focus:ring-2 focus:ring-[#f9e9e4]"
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
                  className="h-11 w-full rounded-lg border border-neutral-200 bg-white px-3 text-sm text-neutral-700 outline-none transition focus:border-[#d77a63] focus:ring-2 focus:ring-[#f9e9e4]"
                  defaultValue=""
                >
                  <option value="" disabled>
                    Select sharing
                  </option>
                  <option value="single">Single</option>
                  <option value="double">Double</option>
                  <option value="triple">Triple</option>
                </select>
              </div>
            </div>
          </section>

          {/* Rent details */}
          <section className="rounded-xl border border-neutral-200 bg-white">
            <div className="border-b border-neutral-100 px-6 py-5">
              <h3 className="text-base font-semibold text-neutral-900">
                Rent Details
              </h3>

              <p className="mt-1 text-sm text-neutral-500">
                Information used when generating rent receipts.
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
                    placeholder="Enter monthly rent"
                    className="h-11 w-full rounded-lg border border-neutral-200 bg-white pl-10 pr-4 text-sm text-neutral-800 outline-none transition placeholder:text-neutral-400 focus:border-[#d77a63] focus:ring-2 focus:ring-[#f9e9e4]"
                  />
                </div>
              </div>

              {/* Rent month */}
              <div>
                <label className="mb-2 block text-sm font-medium text-neutral-700">
                  Rent Month 
                </label>

                <select
                  name="rent_month"
                  value={formData.rent_month}
                  onChange={handleChange}
                  className="h-11 w-full rounded-lg border border-neutral-200 bg-white px-3 text-sm text-neutral-700 outline-none transition focus:border-[#d77a63] focus:ring-2 focus:ring-[#f9e9e4]"
                  defaultValue=""
                >
                  <option value="" disabled>
                    Select sharing
                  </option>
                  <option value="previous">Previous</option>
                  <option value="ongoing">Ongoing</option>
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
                Used to send rent receipts to the resident.
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
                    placeholder="+91 98765 43210"
                    className="h-11 w-full rounded-lg border border-neutral-200 bg-white pl-10 pr-4 text-sm text-neutral-800 outline-none transition placeholder:text-neutral-400 focus:border-[#d77a63] focus:ring-2 focus:ring-[#f9e9e4]"
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
                    placeholder="resident@example.com"
                    className="h-11 w-full rounded-lg border border-neutral-200 bg-white pl-10 pr-4 text-sm text-neutral-800 outline-none transition placeholder:text-neutral-400 focus:border-[#d77a63] focus:ring-2 focus:ring-[#f9e9e4]"
                  />
                </div>

                <p className="mt-1.5 text-xs text-neutral-400">
                  Used for email receipt delivery.
                </p>
              </div>
            </div>
          </section>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pb-8">
            <button
              type="button"
              onClick={()=>navigate("/")}
              className="rounded-lg border border-neutral-200 bg-white px-5 py-2.5 text-sm font-semibold text-neutral-600 transition hover:bg-neutral-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="rounded-lg bg-neutral-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-neutral-800"
            >
              Save Resident
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}

export default AddTenant;