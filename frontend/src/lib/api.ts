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
  const response = await API.post("/save-annotation", data);

  return response.data;
};

// =========================
// Fetch Reports
// =========================
export const fetchReports = async () => {
  const response = await API.get("/reports");

  return response.data;
};

// =========================
// Fetch Report Annotations
// =========================
export const fetchAnnotationsByReport = async (reportId: string) => {
  const response = await API.get(`/annotations/${reportId}`);

  return response.data;
};

// =========================
// Save Final Report
// =========================
export const saveFinalReport = async (data: {
  patient: any;
  doctor: any;
  filename: string;
  compression: any;
  prediction: any;
  annotations: any[];
}) => {
  const response = await API.post("/save-report", data);

  return response.data;
};

// =========================
// Doctor Register
// =========================
export const registerDoctor = async (data: {
  doctor_name: string;
  email: string;
  password: string;
  department: string;
  hospital: string;
}) => {
  const response = await API.post("/register", data);

  return response.data;
};

// =========================
// Doctor Login
// =========================
export const loginDoctor = async (data: {
  email: string;
  password: string;
}) => {
  const response = await API.post("/login", data);

  return response.data;
};

// =========================
// Local Storage Helpers
// =========================
export const saveDoctorSession = (doctor: any) => {
  localStorage.setItem("doctor", JSON.stringify(doctor));
};

export const getLoggedDoctor = () => {
  if (typeof window === "undefined") return null;

  const doctor = localStorage.getItem("doctor");

  return doctor ? JSON.parse(doctor) : null;
};

export const logoutDoctor = () => {
  localStorage.removeItem("doctor");
};
