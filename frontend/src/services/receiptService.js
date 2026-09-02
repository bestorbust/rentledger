import api from "./api";

export const receiptService = {
  async getMonthlyStatus(rentMonth) {
    const response = await api.get(
      `/receipts/monthly/${rentMonth}/status`
    );

    return response.data;
  },

  async generateAndSend({
    tenantId,
    rentMonth,
    paymentDate,
    paymentMode,
    receiptNumber,
    pdfBlob,
  }) {
    const formData = new FormData();

    formData.append(
      "tenant_id",
      String(tenantId)
    );

    formData.append(
      "rent_month",
      String(rentMonth)
    );

    formData.append(
      "payment_date",
      String(paymentDate)
    );

    formData.append(
      "payment_mode",
      String(paymentMode)
    );

    formData.append(
      "receipt_number",
      String(receiptNumber)
    );

    formData.append(
      "pdf",
      pdfBlob,
      `${receiptNumber}.pdf`
    );

    /*
     * IMPORTANT:
     *
     * Do NOT manually set:
     *
     * Content-Type: application/json
     *
     * and preferably don't manually set multipart/form-data either.
     *
     * Browser/Axios will automatically add:
     *
     * multipart/form-data; boundary=...
     */

    const response = await api.post(
      "/receipts/generate-and-send",
      formData
    );

    return response.data;
  },

  async deleteMonthlyReceipt(
    tenantId,
    rentMonth
  ) {
    const response = await api.delete(
      `/receipts/tenant/${tenantId}/month/${rentMonth}`
    );

    return response.data;
  },
};

