import api from "./api";

export const receiptService = {
  // Get all receipts
  getAll: async () => {
    const response = await api.get("/receipts");
    return response.data;
  },

  // Get one receipt
  getById: async (id) => {
    const response = await api.get(`/receipts/${id}`);
    return response.data;
  },

  // Generate receipt
  generate: async (tenantId, receiptData) => {
    const response = await api.post("/receipts", {
      tenant_id: tenantId,
      payment_date: receiptData.paymentDate,
      payment_mode: receiptData.paymentMode,
    });

    return response.data;
  },

  // Download stored receipt PDF
  download: async (id) => {
    const response = await api.get(
      `/receipts/${id}/pdf`,
      {
        responseType: "blob",
      }
    );

    return response.data;
  },

  // Send receipt PDF through email
  sendEmail: async (formData) => {
    const response = await api.post(
      "/receipts/send-email",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return response.data;
  },
};