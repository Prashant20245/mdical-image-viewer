"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";

import Sidebar from "@/components/Sidebar";
import UploadBox from "@/components/UploadBox";
import CompressionStats from "@/components/CompressionStats";
import PredictionCard from "@/components/PredictionCard";
import HistoryTab from "@/components/HistoryTab";
import ImageAnnotator from "@/components/ImageAnnotator";

import { saveFinalReport } from "@/lib/api";

export default function DashboardPage() {
  // =========================
  // Analysis + Image
  // =========================
  const [analysisData, setAnalysisData] = useState<any>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);

  // =========================
  // SAVED ROI ANNOTATIONS
  // =========================
  const [savedAnnotations, setSavedAnnotations] = useState<any[]>([]);

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

  // =========================
  // Doctor Details
  // =========================
  const [doctor, setDoctor] = useState({
    doctor_name: "",
    department: "",
    hospital: "",
  });

  const [savingReport, setSavingReport] = useState(false);

  const searchParams = useSearchParams();
  const activeTab = searchParams.get("tab") || "upload";

  // =========================
  // Final Save
  // =========================
  const handleFinalSave = async () => {
    if (
      !patient.patient_name ||
      !patient.patient_id ||
      !patient.age ||
      !patient.gender ||
      !doctor.doctor_name
    ) {
      alert("Please fill all required patient and doctor details.");
      return;
    }

    if (!analysisData) {
      alert("Please upload and analyze image first.");
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

      alert(
        `Final Report Saved Successfully! Report ID: ${response.report_id}`,
      );

      console.log("Final Saved Report:", response);
    } catch (error) {
      console.error(error);

      alert("Failed to save final report.");
    } finally {
      setSavingReport(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-100">
      <Sidebar />

      <main className="ml-64 flex-1 p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Medical Image Viewer Dashboard</h1>

          <p className="text-slate-600">
            Upload CT scans, compress using JPEG2000, detect tumors using AI,
            annotate suspicious regions, and save full medical reports.
          </p>
        </div>

        {/* HISTORY TAB */}
        {activeTab === "history" ? (
          <HistoryTab />
        ) : (
          <>
            {/* =========================
                PATIENT + DOCTOR FORM
            ========================= */}
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 space-y-6">
              <h2 className="text-2xl font-bold">
                Patient & Doctor Information
              </h2>

              {/* Patient Section */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Patient Details</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <input
                    type="text"
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
                    type="text"
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
                    type="number"
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
                    <option value="Other">Other</option>
                  </select>

                  <input
                    type="text"
                    placeholder="Symptoms / Clinical Notes"
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

              {/* Doctor Section */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Doctor Details</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <input
                    type="text"
                    placeholder="Doctor Name"
                    value={doctor.doctor_name}
                    onChange={(e) =>
                      setDoctor({
                        ...doctor,
                        doctor_name: e.target.value,
                      })
                    }
                    className="border rounded-xl p-3"
                  />

                  <input
                    type="text"
                    placeholder="Department"
                    value={doctor.department}
                    onChange={(e) =>
                      setDoctor({
                        ...doctor,
                        department: e.target.value,
                      })
                    }
                    className="border rounded-xl p-3"
                  />

                  <input
                    type="text"
                    placeholder="Hospital Name"
                    value={doctor.hospital}
                    onChange={(e) =>
                      setDoctor({
                        ...doctor,
                        hospital: e.target.value,
                      })
                    }
                    className="border rounded-xl p-3"
                  />
                </div>
              </div>
            </div>

            {/* TOP SECTION */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
              {/* Upload */}
              <UploadBox
                onAnalysisComplete={setAnalysisData}
                onImageUpload={setUploadedImage}
              />

              {/* Compression */}
              <CompressionStats compression={analysisData?.compression} />
            </div>

            {/* Annotation */}
            {uploadedImage && (
              <div className="mt-6">
                <ImageAnnotator
                  imageSrc={uploadedImage}
                  reportId={analysisData?.report_id || "TEMP_REPORT"}
                  onAnnotationsChange={setSavedAnnotations}
                />
              </div>
            )}

            {/* Prediction */}
            <div className="mt-6">
              <PredictionCard prediction={analysisData?.prediction} />
            </div>

            {/* Annotation Counter */}
            {savedAnnotations.length > 0 && (
              <div className="mt-4 text-center">
                <p className="text-sm font-medium text-cyan-700">
                  {savedAnnotations.length} ROI annotation(s) ready for final
                  report
                </p>
              </div>
            )}

            {/* FINAL SAVE BUTTON */}
            <div className="mt-8 flex justify-center">
              <button
                onClick={handleFinalSave}
                disabled={savingReport}
                className="px-8 py-4 bg-green-600 text-white text-lg font-semibold rounded-2xl hover:bg-green-700 disabled:opacity-50"
              >
                {savingReport
                  ? "Saving Final Report..."
                  : "Save Final Medical Report"}
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

// "use client";

// import { useState } from "react";
// import { useSearchParams } from "next/navigation";

// import Sidebar from "@/components/Sidebar";
// import UploadBox from "@/components/UploadBox";
// import CompressionStats from "@/components/CompressionStats";
// import PredictionCard from "@/components/PredictionCard";
// import HistoryTab from "@/components/HistoryTab";
// import ImageAnnotator from "@/components/ImageAnnotator";

// import { saveFinalReport } from "@/lib/api";

// export default function DashboardPage() {
//   // =========================
//   // Analysis + Image
//   // =========================
//   const [analysisData, setAnalysisData] = useState<any>(null);
//   const [uploadedImage, setUploadedImage] = useState<string | null>(null);

//   // =========================
//   // Patient Details
//   // =========================
//   const [patient, setPatient] = useState({
//     patient_name: "",
//     patient_id: "",
//     age: "",
//     gender: "",
//     symptoms: "",
//   });

//   // =========================
//   // Doctor Details
//   // =========================
//   const [doctor, setDoctor] = useState({
//     doctor_name: "",
//     department: "",
//     hospital: "",
//   });

//   const [savingReport, setSavingReport] = useState(false);

//   const searchParams = useSearchParams();
//   const activeTab = searchParams.get("tab") || "upload";

//   // =========================
//   // Final Save
//   // =========================
//   const handleFinalSave = async () => {
//     if (
//       !patient.patient_name ||
//       !patient.patient_id ||
//       !patient.age ||
//       !patient.gender ||
//       !doctor.doctor_name
//     ) {
//       alert("Please fill all required patient and doctor details.");
//       return;
//     }

//     if (!analysisData) {
//       alert("Please upload and analyze image first.");
//       return;
//     }

//     try {
//       setSavingReport(true);

//       const response = await saveFinalReport({
//         patient,
//         doctor,
//         filename: analysisData.filename,
//         compression: analysisData.compression,
//         prediction: analysisData.prediction,
//         annotations: [], // Will later replace with actual ROI array
//       });

//       alert(
//         `Final Report Saved Successfully! Report ID: ${response.report_id}`,
//       );
//     } catch (error) {
//       console.error(error);

//       alert("Failed to save final report.");
//     } finally {
//       setSavingReport(false);
//     }
//   };

//   return (
//     <div className="flex min-h-screen bg-slate-100">
//       <Sidebar />

//       <main className="ml-64 flex-1 p-8">
//         {/* Header */}
//         <div className="mb-8">
//           <h1 className="text-3xl font-bold">Medical Image Viewer Dashboard</h1>

//           <p className="text-slate-600">
//             Upload CT scans, compress using JPEG2000, detect tumors using AI,
//             annotate suspicious regions, and save full medical reports.
//           </p>
//         </div>

//         {/* HISTORY TAB */}
//         {activeTab === "history" ? (
//           <HistoryTab />
//         ) : (
//           <>
//             {/* =========================
//                 PATIENT + DOCTOR FORM
//             ========================= */}
//             <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 space-y-6">
//               <h2 className="text-2xl font-bold">
//                 Patient & Doctor Information
//               </h2>

//               {/* Patient Section */}
//               <div>
//                 <h3 className="text-lg font-semibold mb-3">Patient Details</h3>

//                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//                   <input
//                     type="text"
//                     placeholder="Patient Name"
//                     value={patient.patient_name}
//                     onChange={(e) =>
//                       setPatient({
//                         ...patient,
//                         patient_name: e.target.value,
//                       })
//                     }
//                     className="border rounded-xl p-3"
//                   />

//                   <input
//                     type="text"
//                     placeholder="Patient ID"
//                     value={patient.patient_id}
//                     onChange={(e) =>
//                       setPatient({
//                         ...patient,
//                         patient_id: e.target.value,
//                       })
//                     }
//                     className="border rounded-xl p-3"
//                   />

//                   <input
//                     type="number"
//                     placeholder="Age"
//                     value={patient.age}
//                     onChange={(e) =>
//                       setPatient({
//                         ...patient,
//                         age: e.target.value,
//                       })
//                     }
//                     className="border rounded-xl p-3"
//                   />

//                   <select
//                     value={patient.gender}
//                     onChange={(e) =>
//                       setPatient({
//                         ...patient,
//                         gender: e.target.value,
//                       })
//                     }
//                     className="border rounded-xl p-3"
//                   >
//                     <option value="">Select Gender</option>
//                     <option value="Male">Male</option>
//                     <option value="Female">Female</option>
//                     <option value="Other">Other</option>
//                   </select>

//                   <input
//                     type="text"
//                     placeholder="Symptoms / Clinical Notes"
//                     value={patient.symptoms}
//                     onChange={(e) =>
//                       setPatient({
//                         ...patient,
//                         symptoms: e.target.value,
//                       })
//                     }
//                     className="border rounded-xl p-3 lg:col-span-2"
//                   />
//                 </div>
//               </div>

//               {/* Doctor Section */}
//               <div>
//                 <h3 className="text-lg font-semibold mb-3">Doctor Details</h3>

//                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//                   <input
//                     type="text"
//                     placeholder="Doctor Name"
//                     value={doctor.doctor_name}
//                     onChange={(e) =>
//                       setDoctor({
//                         ...doctor,
//                         doctor_name: e.target.value,
//                       })
//                     }
//                     className="border rounded-xl p-3"
//                   />

//                   <input
//                     type="text"
//                     placeholder="Department"
//                     value={doctor.department}
//                     onChange={(e) =>
//                       setDoctor({
//                         ...doctor,
//                         department: e.target.value,
//                       })
//                     }
//                     className="border rounded-xl p-3"
//                   />

//                   <input
//                     type="text"
//                     placeholder="Hospital Name"
//                     value={doctor.hospital}
//                     onChange={(e) =>
//                       setDoctor({
//                         ...doctor,
//                         hospital: e.target.value,
//                       })
//                     }
//                     className="border rounded-xl p-3"
//                   />
//                 </div>
//               </div>
//             </div>

//             {/* TOP SECTION */}
//             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
//               {/* Upload */}
//               <UploadBox
//                 onAnalysisComplete={setAnalysisData}
//                 onImageUpload={setUploadedImage}
//               />

//               {/* Compression */}
//               <CompressionStats compression={analysisData?.compression} />
//             </div>

//             {/* Annotation */}
//             {uploadedImage && (
//               <div className="mt-6">
//                 <ImageAnnotator
//                   imageSrc={uploadedImage}
//                   reportId={analysisData?.report_id || ""}
//                 />
//               </div>
//             )}

//             {/* Prediction */}
//             <div className="mt-6">
//               <PredictionCard prediction={analysisData?.prediction} />
//             </div>

//             {/* FINAL SAVE BUTTON */}
//             <div className="mt-8 flex justify-center">
//               <button
//                 onClick={handleFinalSave}
//                 disabled={savingReport}
//                 className="px-8 py-4 bg-green-600 text-white text-lg font-semibold rounded-2xl hover:bg-green-700 disabled:opacity-50"
//               >
//                 {savingReport
//                   ? "Saving Final Report..."
//                   : "Save Final Medical Report"}
//               </button>
//             </div>
//           </>
//         )}
//       </main>
//     </div>
//   );
// }
