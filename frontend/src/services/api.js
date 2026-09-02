import axios from "axios";

const api = axios.create({
    baseURL:import.meta.env.VITE_API_URL || "http://localhost:8000/api",
    // headers:{
    //     "Content-Type":"application/json",
    // }
});
const sendEmail = async (formData) => {
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
};
export default api;