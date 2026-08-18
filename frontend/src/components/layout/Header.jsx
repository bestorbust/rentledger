import { Bell, ChevronDown } from "lucide-react";

function Header() {
  return (
    <header className="flex h-20 items-center justify-between border-b border-neutral-200 bg-white px-8">
      <div>
        <p className="text-sm text-neutral-400">Property Management</p>
        <h2 className="text-lg font-semibold text-neutral-900">
          Rent & Residents
        </h2>
      </div>

      <div className="flex items-center gap-5">
        <button className="relative flex h-10 w-10 items-center justify-center rounded-full text-neutral-500 transition hover:bg-neutral-50 hover:text-neutral-900">
          <Bell size={19} strokeWidth={1.8} />

          <span className="absolute right-2.5 top-2 h-1.5 w-1.5 rounded-full bg-[#c85f47]" />
        </button>

        <div className="h-7 w-px bg-neutral-200" />

        <button className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-neutral-900 text-xs font-semibold text-white">
            A
          </div>

          <div className="hidden text-left sm:block">
            <p className="text-sm font-medium text-neutral-800">
              Admin
            </p>
            <p className="text-xs text-neutral-400">
              Sahana Group
            </p>
          </div>

          <ChevronDown size={16} className="text-neutral-400" />
        </button>
      </div>
    </header>
  );
}

export default Header;