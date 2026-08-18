import api from "./api";

export const tenantService = {
  getAll: async () => {
    const response = await api.get("/tenants");
    return response.data;
  },

  getArchived: async () => {
    const response = await api.get("/tenants/archived");
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/tenants/${id}`);
    return response.data;
  },

  create: async (tenant) => {
    const response = await api.post("/tenants", tenant);
    return response.data;
  },

  update: async (id, tenant) => {
    const response = await api.put(`/tenants/${id}`, tenant);
    return response.data;
  },

  deactivate: async (id) => {
    const response = await api.patch(
      `/tenants/${id}/deactivate`
    );

    return response.data;
  },

  restore: async (id) => {
    const response = await api.patch(
      `/tenants/${id}/restore`
    );

    return response.data;
  },
};