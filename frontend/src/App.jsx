import { BrowserRouter, Routes, Route } from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import AddTenant from "./pages/AddTenant";
import ReceiptGeneration from "./pages/ReceiptGeneration";
import ReceiptPreview from "./pages/ReceiptPreview";
import EditTenant from "./pages/EditTenant";
import ArchivedTenants from "./pages/ArchivedTenants";
import Receipts from "./pages/Receipts";
import Settings from "./pages/settings";
import Residents from "./pages/Residents";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Dashboard */}
        <Route
          path="/"
          element={<Dashboard />}
        />

        {/* Residents */}
        <Route
          path="/residents"
          element={<Residents />}
        />

        <Route
          path="/residents/new"
          element={<AddTenant />}
        />

        <Route
          path="/residents/:id/edit"
          element={<EditTenant />}
        />

        {/* Archived Residents */}
        <Route
          path="/archived"
          element={<ArchivedTenants />}
        />

        {/* ================================================= */}
        {/* RECEIPTS */}
        {/* ================================================= */}

        {/* Main monthly receipt generation page */}
        <Route
          path="/receipts"
          element={<ReceiptGeneration />}
        />

        {/* Individual receipt preview */}
        <Route
          path="/receipts/:id/preview"
          element={<ReceiptPreview />}
        />

        {/* Settings */}
        <Route
          path="/settings"
          element={<Settings />}
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;