import {
  Users,
  ReceiptText,
  Clock3,
  Plus,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/layout/Sidebar";
import Header from "../components/layout/Header";
import TenantTable from "../components/tenants/TenantTable";
import { useState } from "react";

const stats = [
  {
    label: "Active Residents",
    value: "24",
    icon: Users,
    description: "Currently staying",
  },
  {
    label: "Receipts This Month",
    value: "18",
    icon: ReceiptText,
    description: "Generated receipts",
  },
  {
    label: "Pending",
    value: "6",
    icon: Clock3,
    description: "Awaiting payment",
  },
];

function Dashboard() {
  const [sidebarOpen,setSideBarOpen] =useState(true);
  const navigate = useNavigate()
  return (
    <div className="min-h-screen bg-[#f7f7f5]">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSideBarOpen}/>

      {/* <div className="ml-64"> */}
      <div
        className={`transition-all duration-300 ${
          sidebarOpen ? "ml-64" : "ml-20"
        }`}
      >
        <Header />

        <main className="px-8 py-8">
          {/* Page heading */}
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="mb-1 text-sm font-medium text-[#b9563e]">
                Dashboard
              </p>

              <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
                Rent & Residents
              </h1>

              <p className="mt-1 text-sm text-neutral-500">
                Manage residents and generate rent payment receipts.
              </p>
            </div>

            <button 
            onClick={() => navigate("/residents/new")}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-neutral-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-neutral-800">
              <Plus size={17} />
              Add Resident
            </button>
          </div>

          {/* Stats */}
          {/* <div className="mt-7 grid gap-4 md:grid-cols-3">
            {stats.map((stat) => {
              const Icon = stat.icon;

              return (
                <div
                  key={stat.label}
                  className="rounded-xl border border-neutral-200 bg-white p-5"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-neutral-500">
                        {stat.label}
                      </p>

                      <p className="mt-2 text-3xl font-bold tracking-tight text-neutral-900">
                        {stat.value}
                      </p>

                      <p className="mt-1 text-xs text-neutral-400">
                        {stat.description}
                      </p>
                    </div>

                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#f9e9e4] text-[#b9563e]">
                      <Icon size={19} strokeWidth={1.8} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div> */}

          {/* Tenant section */}
          <section className="mt-8">
            <div className="mb-4 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <h2 className="text-lg font-semibold text-neutral-900">
                  Active Residents
                </h2>

                <p className="mt-0.5 text-sm text-neutral-500">
                  Residents currently registered in the property.
                </p>
              </div>

              <div className="flex gap-2">
                {/* Search */}
                <div className="relative">
                  <Search
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
                  />

                  <input
                    type="text"
                    placeholder="Search resident..."
                    className="h-10 w-52 rounded-lg border border-neutral-200 bg-white pl-9 pr-3 text-sm outline-none transition placeholder:text-neutral-400 focus:border-[#d77a63] focus:ring-2 focus:ring-[#f9e9e4]"
                  />
                </div>

                {/* Filter */}
                <button className="flex h-10 items-center gap-2 rounded-lg border border-neutral-200 bg-white px-3 text-sm font-medium text-neutral-600 transition hover:bg-neutral-50">
                  <SlidersHorizontal size={15} />
                  Filter
                </button>
              </div>
            </div>

            <TenantTable />
          </section>
        </main>
      </div>
    </div>
  );
}

export default Dashboard;