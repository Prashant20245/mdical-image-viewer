"use client";

import { LayoutDashboard, Upload, Activity, LogOut, User } from "lucide-react";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { getLoggedDoctor, logoutDoctor } from "@/lib/api";

export default function Sidebar() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const activeTab = searchParams.get("tab") || "upload";

  const [doctor, setDoctor] = useState<any>(null);

  useEffect(() => {
    const loggedDoctor = getLoggedDoctor();

    setDoctor(loggedDoctor);
  }, []);

  const handleLogout = () => {
    const confirmLogout = confirm("Are you sure you want to logout?");

    if (!confirmLogout) return;

    logoutDoctor();

    router.push("/login");
  };

  return (
    <div className="w-64 h-screen bg-slate-900 text-white flex flex-col p-6 fixed">
      {/* Logo */}
      <div>
        <h1 className="text-2xl font-bold">MedVision AI</h1>

        <p className="text-xs text-slate-400 mt-1">Medical Imaging Platform</p>
      </div>

      {/* Doctor Info */}
      {doctor && (
        <div className="mt-8 p-4 rounded-xl bg-slate-800 border border-slate-700">
          <div className="flex items-center gap-2 mb-2">
            <User size={18} />
            <span className="font-semibold">Doctor</span>
          </div>

          <p className="text-sm font-medium text-cyan-400">
            {doctor.doctor_name}
          </p>

          <p className="text-xs text-slate-400 mt-1 break-all">
            {doctor.email}
          </p>

          <p className="text-xs text-slate-400 mt-2">{doctor.department}</p>

          <p className="text-xs text-slate-500">{doctor.hospital}</p>
        </div>
      )}

      {/* Navigation */}
      <nav className="space-y-6 mt-8 flex-1">
        <div
          onClick={() => router.push("/dashboard?tab=upload")}
          className={`flex items-center gap-3 cursor-pointer hover:text-cyan-400 transition ${
            activeTab === "upload" ? "text-cyan-400" : ""
          }`}
        >
          <LayoutDashboard size={20} />
          <span>Dashboard</span>
        </div>

        <div
          onClick={() => router.push("/dashboard?tab=upload")}
          className={`flex items-center gap-3 cursor-pointer hover:text-cyan-400 transition ${
            activeTab === "upload" ? "text-cyan-400" : ""
          }`}
        >
          <Upload size={20} />
          <span>Upload Scan</span>
        </div>

        <div
          onClick={() => router.push("/dashboard?tab=history")}
          className={`flex items-center gap-3 cursor-pointer hover:text-cyan-400 transition ${
            activeTab === "history" ? "text-cyan-400" : ""
          }`}
        >
          <Activity size={20} />
          <span>Reports</span>
        </div>
      </nav>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 transition rounded-xl py-3"
      >
        <LogOut size={18} />
        Logout
      </button>
    </div>
  );
}
