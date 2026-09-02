import {
  LayoutDashboard,
  Users,
  ReceiptText,
  Archive,
  Settings,
  Menu,
  ChevronLeft
} from "lucide-react";
import { useLocation,useNavigate } from "react-router-dom";
const navigation = [
  {
    name: "Dashboard",
    icon: LayoutDashboard,
    path: "/",
  },
  // {
  //   name: "Residents",
  //   icon: Users,
  //   path: "/residents",
  // },
  {
    name: "Receipts",
    icon: ReceiptText,
    path: "/receipts",
  },
  {
    name: "Archived",
    icon: Archive,
    path: "/archived",
  },
];
function Sidebar({isOpen,setIsOpen}) {
  const navigate = useNavigate();
  const location = useLocation();
  return (
    <aside
        className={`fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-neutral-200 bg-white transition-all duration-300 ${
          isOpen ? "w-64" : "w-20"
        }`}
      >
      {/* Brand */}
      <div
        className={`flex h-20 items-center border-b border-neutral-100 ${
          isOpen ? "justify-between px-6" : "justify-center"
        }`}
      >
      {isOpen &&(
        <div>
          <h1 className="text-xl font-bold tracking-tight text-neutral-900">
            RentLedger
          </h1>

          <p className="mt-0.5 text-xs font-medium tracking-wide text-neutral-400">
            RENT MANAGEMENT
          </p>
        </div>)}
        <button
        onClick={()=> setIsOpen(!isOpen)}
        className="flex h-9 w-9 items-center justify-center rounded-lg text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-900">
          {isOpen? <ChevronLeft size={18}/> : <Menu size={18}/>}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-6">
        {isOpen && (<p className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
          Management
        </p>)}

        <div className="space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon;

            return (
              <button
                key={item.name}
                onClick={() => navigate(item.path)}
                title={!isOpen ? item.name : undefined}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                  location.pathname === item.path ||
                  location.pathname.startsWith(`${item.path}/`)
                    ? "bg-[#f9e9e4] text-[#b9563e]"
                    : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900"
                } ${!isOpen ? "justify-center" : ""}`}
              >
                <Icon size={18} strokeWidth={1.8} />

                {isOpen && <span>{item.name}</span>}
              </button>
            );
          })}
        </div>

        {isOpen && (<p className="mb-3 mt-8 px-3 text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
          System
        </p>)}

        {isOpen && (<button  onClick={()=>navigate("/settings")}
        className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-neutral-600 transition hover:bg-neutral-50 hover:text-neutral-900">
          <Settings size={18} strokeWidth={1.8} />
          Settings
        </button>)}
      </nav>

      {/* Bottom profile */}
      <div className="border-t border-neutral-100 p-4">
        <div
          className={`flex items-center gap-3 rounded-lg p-2 ${
            !isOpen ? "justify-center" : ""
          }`}
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#f9e9e4] text-sm font-semibold text-[#b9563e]">
            A
          </div>

          {isOpen && (
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-neutral-800">
                Administrator
              </p>

              <p className="text-xs text-neutral-400">
                Property Manager
              </p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;