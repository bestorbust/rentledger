import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import { tenantService } from "../services/tenantService";

const TenantContext = createContext(null);

export function TenantProvider({ children }) {
  const [tenants, setTenants] = useState([]);
  const [archivedTenants, setArchivedTenants] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadTenants = async () => {
    try {
      setLoading(true);
      setError(null);

      const [activeData, archivedData] = await Promise.all([
        tenantService.getAll(),
        tenantService.getArchived(),
      ]);

      setTenants(activeData);
      setArchivedTenants(archivedData);
    } catch (err) {
      console.error("Failed to load tenants:", err);

      setError(
        err.response?.data?.detail ||
          "Unable to load residents."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTenants();
  }, []);

  // CREATE
  const addTenant = async (tenantData) => {
    try {
      const created = await tenantService.create({
        ...tenantData,
        rent: Number(tenantData.rent),
      });

      setTenants((current) => [
        created,
        ...current,
      ]);

      return created;
    } catch (err) {
      throw new Error(
        err.response?.data?.detail ||
          "Unable to create resident."
      );
    }
  };

  // UPDATE
  const updateTenant = async (id, tenantData) => {
    try {
      const updated = await tenantService.update(
        id,
        {
          ...tenantData,
          rent: Number(tenantData.rent),
        }
      );

      setTenants((current) =>
        current.map((tenant) =>
          tenant.id === id
            ? updated
            : tenant
        )
      );

      setArchivedTenants((current) =>
        current.map((tenant) =>
          tenant.id === id
            ? updated
            : tenant
        )
      );

      return updated;
    } catch (err) {
      throw new Error(
        err.response?.data?.detail ||
          "Unable to update resident."
      );
    }
  };

  // DEACTIVATE
  const deactivateTenant = async (id) => {
    try {
      const updated =
        await tenantService.deactivate(id);

      // Remove from active list
      setTenants((current) =>
        current.filter(
          (tenant) => tenant.id !== id
        )
      );

      // Add to archived list
      setArchivedTenants((current) => [
        updated,
        ...current,
      ]);

      return updated;
    } catch (err) {
      throw new Error(
        err.response?.data?.detail ||
          "Unable to deactivate resident."
      );
    }
  };

  // RESTORE
  const restoreTenant = async (id) => {
    try {
      const updated =
        await tenantService.restore(id);

      // Remove from archived list
      setArchivedTenants((current) =>
        current.filter(
          (tenant) => tenant.id !== id
        )
      );

      // Add back to active list
      setTenants((current) => [
        updated,
        ...current,
      ]);

      return updated;
    } catch (err) {
      throw new Error(
        err.response?.data?.detail ||
          "Unable to restore resident."
      );
    }
  };

  const getTenant = (id) => {
    return (
      tenants.find(
        (tenant) => tenant.id === id
      ) ||
      archivedTenants.find(
        (tenant) => tenant.id === id
      )
    );
  };

  return (
    <TenantContext.Provider
      value={{
        tenants,
        activeTenants: tenants,
        archivedTenants,

        loading,
        error,

        addTenant,
        updateTenant,
        deactivateTenant,
        restoreTenant,

        getTenant,
        refreshTenants: loadTenants,
      }}
    >
      {children}
    </TenantContext.Provider>
  );
}

export function useTenants() {
  const context = useContext(TenantContext);

  if (!context) {
    throw new Error(
      "useTenants must be used inside TenantProvider"
    );
  }

  return context;
}