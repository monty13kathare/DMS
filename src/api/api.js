import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add token to requests (from localStorage)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers.token = token;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

//------------------ AUTH APIs -----------------------------------
export const authAPI = {
  generateOTP: (mobileNumber) => {
    return api.post("/generateOTP", { mobile_number: mobileNumber });
  },

  validateOTP: (mobileNumber, otp) => {
    return api
      .post("/validateOTP", { mobile_number: mobileNumber, otp })
      .then((res) => {
        if (res.data?.token) {
          localStorage.setItem("authToken", res.data.token);
        }
        return res;
      });
  },
};

//------------------------------ DOCUMENT APIs ---------------------------------------
export const documentAPI = {
  uploadFile: (file, metadata, token) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("data", JSON.stringify(metadata));

    return api.post("/documentManagement/saveDocumentEntry", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        token: token,
      },
    });
  },

  searchDocuments: (filters) => {
    const payload = {
      major_head: filters.major_head || "",
      minor_head: filters.minor_head || "",
      from_date: filters.from_date || "",
      to_date: filters.to_date || "",
      tags: (filters.tags || []).map((t) => ({ tag_name: t })),
      uploaded_by: filters.uploaded_by || "",
      start: filters.start || 0,
      length: filters.length || 10,
      filterId: filters.filterId || "",
      search: { value: filters.searchValue || "" },
    };

    return api.post("/searchDocumentEntry", payload);
  },

  getTags: (term = "") => {
    return api.post("/documentTags", { term });
  },

  downloadFile: (fileId) => {
    return api.get(`/download/${fileId}`, { responseType: "blob" });
  },

  downloadAllAsZip: (fileIds) => {
    return api.post("/downloadZip", { fileIds }, { responseType: "blob" });
  },
};

export default api;
