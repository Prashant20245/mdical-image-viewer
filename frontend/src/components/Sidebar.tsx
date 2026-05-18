"use client";

import { LayoutDashboard, Upload, Activity } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

export default function Sidebar() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const activeTab = searchParams.get("tab") || "upload";

  return (
    <div className="w-64 h-screen bg-slate-900 text-white flex flex-col p-6 fixed">
      <h1 className="text-2xl font-bold mb-10">MedVision AI</h1>

      <nav className="space-y-6">
        <div
          onClick={() => router.push("/dashboard?tab=upload")}
          className={`flex items-center gap-3 cursor-pointer hover:text-cyan-400 ${
            activeTab === "upload" ? "text-cyan-400" : ""
          }`}
        >
          <LayoutDashboard size={20} />
          <span>Dashboard</span>
        </div>

        <div
          onClick={() => router.push("/dashboard?tab=upload")}
          className={`flex items-center gap-3 cursor-pointer hover:text-cyan-400 ${
            activeTab === "upload" ? "text-cyan-400" : ""
          }`}
        >
          <Upload size={20} />
          <span>Upload Scan</span>
        </div>

        <div
          onClick={() => router.push("/dashboard?tab=history")}
          className={`flex items-center gap-3 cursor-pointer hover:text-cyan-400 ${
            activeTab === "history" ? "text-cyan-400" : ""
          }`}
        >
          <Activity size={20} />
          <span>Reports</span>
        </div>
      </nav>
    </div>
  );
}

// "use client";

// import { LayoutDashboard, Upload, Activity } from "lucide-react";

// export default function Sidebar() {
//   return (
//     <div className="w-64 h-screen bg-slate-900 text-white flex flex-col p-6 fixed">
//       <h1 className="text-2xl font-bold mb-10">MedVision AI</h1>

//       <nav className="space-y-6">
//         <div className="flex items-center gap-3 cursor-pointer hover:text-cyan-400">
//           <LayoutDashboard size={20} />
//           <span>Dashboard</span>
//         </div>

//         <div className="flex items-center gap-3 cursor-pointer hover:text-cyan-400">
//           <Upload size={20} />
//           <span>Upload Scan</span>
//         </div>

//         <div className="flex items-center gap-3 cursor-pointer hover:text-cyan-400">
//           <Activity size={20} />
//           <span>Reports</span>
//         </div>
//       </nav>
//     </div>
//   );
// }
