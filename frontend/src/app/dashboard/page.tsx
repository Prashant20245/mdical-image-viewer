"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import Sidebar from "@/components/Sidebar";
import UploadBox from "@/components/UploadBox";
import CompressionStats from "@/components/CompressionStats";
import PredictionCard from "@/components/PredictionCard";
import HistoryTab from "@/components/HistoryTab";
import ImageAnnotator from "@/components/ImageAnnotator";

import { saveFinalReport, getLoggedDoctor } from "@/lib/api";

export default function DashboardPage() {
  const router = useRouter();

  const [analysisData, setAnalysisData] = useState<any>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);

  const [savedAnnotations, setSavedAnnotations] = useState<any[]>([]);

  const [savingReport, setSavingReport] = useState(false);

  // =========================
  // Logged Doctor
  // =========================
  const [doctor, setDoctor] = useState<any>(null);

  useEffect(() => {
    const loggedDoctor = getLoggedDoctor();

    if (!loggedDoctor) {
      router.push("/login");
      return;
    }

    setDoctor(loggedDoctor);
  }, []);

  // =========================
  // Patient Details
  // =========================
  const [patient, setPatient] = useState({
    patient_name: "",
    patient_id: "",
    age: "",
    gender: "",
    symptoms: "",
  });

  const searchParams = useSearchParams();

  const activeTab = searchParams.get("tab") || "upload";

  // =========================
  // Save Final Report
  // =========================
  const handleFinalSave = async () => {
    if (
      !patient.patient_name ||
      !patient.patient_id ||
      !patient.age ||
      !patient.gender
    ) {
      alert("Please fill patient details.");
      return;
    }

    if (!analysisData) {
      alert("Please upload image first.");
      return;
    }

    try {
      setSavingReport(true);

      const response = await saveFinalReport({
        patient,
        doctor,
        filename: analysisData.filename,
        compression: analysisData.compression,
        prediction: analysisData.prediction,
        annotations: savedAnnotations,
      });

      alert(`Report Saved Successfully!\nReport ID: ${response.report_id}`);
    } catch (error) {
      console.error(error);

      alert("Failed to save report");
    } finally {
      setSavingReport(false);
    }
  };

  if (!doctor) return null;

  return (
    <div className="flex min-h-screen bg-slate-100">
      <Sidebar />

      <main className="ml-64 flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Medical Image Viewer Dashboard</h1>

          <p className="text-slate-600">
            Upload CT scans, compress using JPEG2000, detect tumors, annotate
            ROI, and save reports.
          </p>
        </div>

        {activeTab === "history" ? (
          <HistoryTab />
        ) : (
          <>
            {/* ========================= */}
            {/* Patient + Doctor */}
            {/* ========================= */}

            <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 space-y-6">
              <h2 className="text-2xl font-bold">
                Patient & Doctor Information
              </h2>

              {/* Patient */}

              <div>
                <h3 className="font-semibold mb-3">Patient Details</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <input
                    placeholder="Patient Name"
                    value={patient.patient_name}
                    onChange={(e) =>
                      setPatient({
                        ...patient,
                        patient_name: e.target.value,
                      })
                    }
                    className="border rounded-xl p-3"
                  />

                  <input
                    placeholder="Patient ID"
                    value={patient.patient_id}
                    onChange={(e) =>
                      setPatient({
                        ...patient,
                        patient_id: e.target.value,
                      })
                    }
                    className="border rounded-xl p-3"
                  />

                  <input
                    placeholder="Age"
                    value={patient.age}
                    onChange={(e) =>
                      setPatient({
                        ...patient,
                        age: e.target.value,
                      })
                    }
                    className="border rounded-xl p-3"
                  />

                  <select
                    value={patient.gender}
                    onChange={(e) =>
                      setPatient({
                        ...patient,
                        gender: e.target.value,
                      })
                    }
                    className="border rounded-xl p-3"
                  >
                    <option value="">Select Gender</option>

                    <option value="Male">Male</option>

                    <option value="Female">Female</option>
                  </select>

                  <input
                    placeholder="Symptoms"
                    value={patient.symptoms}
                    onChange={(e) =>
                      setPatient({
                        ...patient,
                        symptoms: e.target.value,
                      })
                    }
                    className="border rounded-xl p-3 lg:col-span-2"
                  />
                </div>
              </div>

              {/* Doctor */}

              <div>
                <h3 className="font-semibold mb-3">Logged In Doctor</h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <input
                    readOnly
                    value={doctor.doctor_name}
                    className="border rounded-xl p-3 bg-slate-100"
                  />

                  <input
                    readOnly
                    value={doctor.department}
                    className="border rounded-xl p-3 bg-slate-100"
                  />

                  <input
                    readOnly
                    value={doctor.hospital}
                    className="border rounded-xl p-3 bg-slate-100"
                  />
                </div>
              </div>
            </div>

            {/* Upload + Compression */}

            {/* <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <UploadBox
                onAnalysisComplete={setAnalysisData}
                onImageUpload={setUploadedImage}
              />

              <CompressionStats compression={analysisData?.compression} />
            </div> */}

            {/* Upload + Compression + Prediction */}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Side */}
              <UploadBox
                onAnalysisComplete={setAnalysisData}
                onImageUpload={setUploadedImage}
              />

              {/* Right Side */}
              <div className="space-y-6">
                <CompressionStats compression={analysisData?.compression} />

                <PredictionCard prediction={analysisData?.prediction} />
              </div>
            </div>

            {/* Annotation */}

            {uploadedImage && (
              <div className="mt-6">
                <ImageAnnotator
                  imageSrc={uploadedImage}
                  reportId={analysisData?.filename || "TEMP"}
                  onAnnotationsChange={setSavedAnnotations}
                />
              </div>
            )}

            {/* Prediction */}

            {/* <div className="mt-6">
              <PredictionCard prediction={analysisData?.prediction} />
            </div> */}

            {/* Save */}

            <div className="mt-8 flex justify-center">
              <button
                onClick={handleFinalSave}
                disabled={savingReport}
                className="px-8 py-4 bg-green-600 text-white rounded-2xl"
              >
                {savingReport ? "Saving..." : "Save Final Medical Report"}
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
