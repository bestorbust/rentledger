import { BrowserRouter, Routes, Route } from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import AddTenant from "./pages/AddTenant";
import ReceiptGeneration from "./pages/ReceiptGeneration";
import ReceiptPreview from "./pages/ReceiptPreview";
import EditTenant from "./pages/EditTenant";
import ArchivedTenants from "./pages/ArchivedTenants";
import Receipts from "./pages/Receipts";
import Settings from "./pages/settings";
import TenantTable from "./components/tenants/TenantTable";
import Residents from "./pages/Residents";
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />

        <Route
          path="/residents/new"
          element={<AddTenant />}
        />

        <Route
          path="/residents/:id/receipt"
          element={<ReceiptGeneration />}
        />

        <Route
          path="/receipts/:id/preview"
          element={<ReceiptPreview />}
        />

        <Route
          path="/residents/:id/edit"
          element={<EditTenant />}
        />

        <Route
          path="/archived"
          element={<ArchivedTenants />}
        />

        <Route
          path="/receipts"
          element={<Receipts />}
        />

        <Route
          path="/settings"
          element={<Settings />}
        />

        <Route
          path="/residents"
          element={<Residents />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;