"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";

import Sidebar from "@/components/Sidebar";
import UploadBox from "@/components/UploadBox";
import CompressionStats from "@/components/CompressionStats";
import PredictionCard from "@/components/PredictionCard";
import HistoryTab from "@/components/HistoryTab";

export default function DashboardPage() {
  const [analysisData, setAnalysisData] = useState<any>(null);

  const searchParams = useSearchParams();
  const activeTab = searchParams.get("tab") || "upload";

  return (
    <div className="flex min-h-screen bg-slate-100">
      <Sidebar />

      <main className="ml-64 flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Medical Image Viewer Dashboard</h1>

          <p className="text-slate-600">
            Upload CT scans, compress using JPEG2000, and detect tumors using
            AI.
          </p>
        </div>

        {activeTab === "history" ? (
          <HistoryTab />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            <UploadBox onAnalysisComplete={setAnalysisData} />

            <CompressionStats compression={analysisData?.compression} />

            <div className="lg:col-span-2">
              <PredictionCard prediction={analysisData?.prediction} />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

// "use client";

// import { useState } from "react";

// import Sidebar from "@/components/Sidebar";
// import UploadBox from "@/components/UploadBox";
// import CompressionStats from "@/components/CompressionStats";
// import PredictionCard from "@/components/PredictionCard";

// export default function DashboardPage() {
//   const [analysisData, setAnalysisData] = useState<any>(null);

//   return (
//     <div className="flex min-h-screen bg-slate-100">
//       {/* Sidebar */}
//       <Sidebar />

//       {/* Main Content */}
//       <main className="ml-64 flex-1 p-8">
//         <div className="mb-8">
//           <h1 className="text-3xl font-bold">Medical Image Viewer Dashboard</h1>

//           <p className="text-slate-600">
//             Upload CT scans, compress using JPEG2000, and detect tumors using
//             AI.
//           </p>
//         </div>

//         {/* Dashboard Grid */}
//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
//           {/* Upload */}
//           <UploadBox onAnalysisComplete={setAnalysisData} />

//           {/* Compression */}
//           <CompressionStats compression={analysisData?.compression} />

//           {/* Prediction Full Width */}
//           <div className="lg:col-span-2">
//             <PredictionCard prediction={analysisData?.prediction} />
//           </div>
//         </div>
//       </main>
//     </div>
//   );
// }
