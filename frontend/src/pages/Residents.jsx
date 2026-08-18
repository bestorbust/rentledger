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

function Residents() {
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
        <div className="py-3 px-5">
        <TenantTable/>
        </div>
        </div>
        </div>
  )}

export default Residents;
