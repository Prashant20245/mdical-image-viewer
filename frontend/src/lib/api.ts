import axios from "axios";

const API = axios.create({
  baseURL: "http://127.0.0.1:8000",
});

// =========================
// Upload Medical Image
// =========================
export const uploadMedicalImage = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await API.post("/analyze", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};

// =========================
// Save ROI Annotation
// =========================
export const saveAnnotation = async (data: {
  report_id: string;
  roi_id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  note: string;
}) => {
  const response = await API.post("/save-annotation", data, {
    headers: {
      "Content-Type": "application/json",
    },
  });

  return response.data;
};

// =========================
// Fetch All Reports History
// =========================
export const fetchReports = async () => {
  const response = await API.get("/reports");

  return response.data;
};

// =========================
// Fetch Annotations By Report
// =========================
export const fetchAnnotationsByReport = async (reportId: string) => {
  const response = await API.get(`/annotations/${reportId}`);

  return response.data;
};

// =========================
// Save Final Medical Report
// =========================
export const saveFinalReport = async (data: {
  patient: {
    patient_name: string;
    patient_id: string;
    age: string;
    gender: string;
    symptoms: string;
  };
  doctor: {
    doctor_name: string;
    department: string;
    hospital: string;
  };
  filename: string;
  compression: any;
  prediction: any;
  annotations: any[];
}) => {
  const response = await API.post("/save-report", data, {
    headers: {
      "Content-Type": "application/json",
    },
  });

  return response.data;
};
