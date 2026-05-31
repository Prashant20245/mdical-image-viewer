"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { getLoggedDoctor } from "@/lib/api";
import jsPDF from "jspdf";

interface Annotation {
  id?: number;
  roi_id?: number;
  x: number;
  y: number;
  width: number;
  height: number;
  note: string;
}

interface Report {
  report_id: string;
  filename: string;

  patient?: {
    patient_name?: string;
    patient_id?: string;
    age?: string;
    gender?: string;
    symptoms?: string;
  };

  doctor?: {
    doctor_name?: string;
    email?: string;
    department?: string;
    hospital?: string;
  };

  prediction?: {
    result?: string;
    confidence?: number;
  };

  compression?: {
    compression_ratio?: number;
    original_size_mb?: number;
    compressed_size_mb?: number;
  };

  annotations?: Annotation[];

  created_at: string;
}

export default function HistoryTab() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [doctorEmail, setDoctorEmail] = useState("");

  const [selectedReport, setSelectedReport] = useState<Report | null>(null);

  const downloadPDF = (report: Report) => {
    const doc = new jsPDF();

    let y = 20;

    doc.setFontSize(18);
    doc.text("Medical Diagnostic Report", 20, y);

    y += 15;

    doc.setFontSize(12);

    doc.text(`Report ID: ${report.report_id}`, 20, y);
    y += 10;

    doc.text(`Date: ${new Date(report.created_at).toLocaleString()}`, 20, y);

    y += 20;

    doc.text("Patient Information", 20, y);

    y += 10;

    doc.text(`Name: ${report.patient?.patient_name || "N/A"}`, 20, y);

    y += 8;

    doc.text(`Patient ID: ${report.patient?.patient_id || "N/A"}`, 20, y);

    y += 8;

    doc.text(`Age: ${report.patient?.age || "N/A"}`, 20, y);

    y += 8;

    doc.text(`Gender: ${report.patient?.gender || "N/A"}`, 20, y);

    y += 8;

    doc.text(`Symptoms: ${report.patient?.symptoms || "N/A"}`, 20, y);

    y += 20;

    doc.text("Doctor Information", 20, y);

    y += 10;

    doc.text(`Doctor: ${report.doctor?.doctor_name || "N/A"}`, 20, y);

    y += 8;

    doc.text(`Department: ${report.doctor?.department || "N/A"}`, 20, y);

    y += 8;

    doc.text(`Hospital: ${report.doctor?.hospital || "N/A"}`, 20, y);

    y += 20;

    doc.text("AI Analysis", 20, y);

    y += 10;

    doc.text(`Prediction: ${report.prediction?.result || "N/A"}`, 20, y);

    y += 8;

    doc.text(`Confidence: ${report.prediction?.confidence || "N/A"}%`, 20, y);

    y += 8;

    doc.text(
      `Compression Ratio: ${report.compression?.compression_ratio || "N/A"}%`,
      20,
      y,
    );

    y += 20;

    doc.text("ROI Notes", 20, y);

    y += 10;

    if (report.annotations && report.annotations.length > 0) {
      report.annotations.forEach((roi, index) => {
        doc.text(`${index + 1}. ${roi.note}`, 20, y);

        y += 8;
      });
    } else {
      doc.text("No ROI annotations", 20, y);
    }

    doc.save(`${report.report_id}.pdf`);
  };

  useEffect(() => {
    const loggedDoctor = getLoggedDoctor();

    if (!loggedDoctor) return;

    setDoctorEmail(loggedDoctor.email);

    const fetchReports = async () => {
      try {
        const response = await fetch("http://127.0.0.1:8000/reports");

        const data = await response.json();

        const filteredReports = (data.reports || []).filter(
          (report: Report) => report.doctor?.email === loggedDoctor.email,
        );

        setReports(filteredReports);
      } catch (error) {
        console.error("Failed to fetch reports:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  return (
    <div className="space-y-6">
      {/* =========================
          HISTORY TABLE
      ========================= */}
      <Card className="rounded-2xl shadow-lg">
        <CardContent className="p-6">
          <h2 className="text-2xl font-bold mb-2">My Medical Case History</h2>

          <p className="text-slate-500 mb-6">
            Review previously saved patient cases, AI predictions, compression,
            and ROI annotations.
          </p>

          {doctorEmail && (
            <div className="mb-4 inline-block bg-cyan-100 text-cyan-700 px-4 py-2 rounded-xl text-sm">
              Logged in as: {doctorEmail}
            </div>
          )}

          {loading ? (
            <p>Loading reports...</p>
          ) : reports.length === 0 ? (
            <p className="text-slate-500">No reports found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b bg-slate-50">
                    <th className="text-left py-3 px-2">Report ID</th>
                    <th className="text-left py-3 px-2">Patient</th>
                    <th className="text-left py-3 px-2">Doctor</th>
                    <th className="text-left py-3 px-2">Prediction</th>
                    <th className="text-left py-3 px-2">Confidence</th>
                    <th className="text-left py-3 px-2">Compression</th>
                    <th className="text-left py-3 px-2">ROI Count</th>
                    <th className="text-left py-3 px-2">Date</th>
                    <th className="text-left py-3 px-2">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {reports.map((report, index) => (
                    <tr key={index} className="border-b hover:bg-slate-50">
                      <td className="py-3 px-2 font-medium">
                        {report.report_id}
                      </td>

                      <td className="py-3 px-2">
                        {report.patient?.patient_name || "N/A"}
                      </td>

                      <td className="py-3 px-2">
                        {report.doctor?.doctor_name || "N/A"}
                      </td>

                      <td
                        className={`py-3 px-2 font-semibold ${
                          report.prediction?.result === "Tumor"
                            ? "text-red-600"
                            : "text-green-600"
                        }`}
                      >
                        {report.prediction?.result || "N/A"}
                      </td>

                      <td className="py-3 px-2">
                        {report.prediction?.confidence
                          ? `${report.prediction.confidence}%`
                          : "N/A"}
                      </td>

                      <td className="py-3 px-2">
                        {report.compression?.compression_ratio
                          ? `${report.compression.compression_ratio}%`
                          : "N/A"}
                      </td>

                      <td className="py-3 px-2">
                        {report.annotations?.length || 0}
                      </td>

                      <td className="py-3 px-2">
                        {new Date(report.created_at).toLocaleString()}
                      </td>

                      <td className="py-3 px-2">
                        <div className="flex gap-2">
                          <button
                            onClick={() => setSelectedReport(report)}
                            className="px-3 py-1 bg-cyan-600 text-white rounded-lg"
                          >
                            View
                          </button>

                          <button
                            onClick={() => downloadPDF(report)}
                            className="px-3 py-1 bg-green-600 text-white rounded-lg"
                          >
                            PDF
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* =========================
          REPORT DETAIL VIEW
      ========================= */}
      {selectedReport && (
        <Card className="rounded-2xl shadow-lg border-cyan-200">
          <CardContent className="p-6 space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">
                Report Details: {selectedReport.report_id}
              </h2>

              <button
                onClick={() => setSelectedReport(null)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Close
              </button>
            </div>

            {/* Patient */}
            <div>
              <h3 className="text-lg font-semibold mb-2">
                Patient Information
              </h3>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                <p>
                  <strong>Name:</strong>{" "}
                  {selectedReport.patient?.patient_name || "N/A"}
                </p>

                <p>
                  <strong>ID:</strong>{" "}
                  {selectedReport.patient?.patient_id || "N/A"}
                </p>

                <p>
                  <strong>Age:</strong> {selectedReport.patient?.age || "N/A"}
                </p>

                <p>
                  <strong>Gender:</strong>{" "}
                  {selectedReport.patient?.gender || "N/A"}
                </p>

                <p className="md:col-span-2">
                  <strong>Symptoms:</strong>{" "}
                  {selectedReport.patient?.symptoms || "N/A"}
                </p>
              </div>
            </div>

            {/* Doctor */}
            <div>
              <h3 className="text-lg font-semibold mb-2">Doctor Information</h3>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                <p>
                  <strong>Name:</strong>{" "}
                  {selectedReport.doctor?.doctor_name || "N/A"}
                </p>

                <p>
                  <strong>Department:</strong>{" "}
                  {selectedReport.doctor?.department || "N/A"}
                </p>

                <p>
                  <strong>Hospital:</strong>{" "}
                  {selectedReport.doctor?.hospital || "N/A"}
                </p>
              </div>
            </div>

            {/* AI + Compression */}
            <div>
              <h3 className="text-lg font-semibold mb-2">AI Analysis</h3>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <p>
                  <strong>Prediction:</strong>{" "}
                  {selectedReport.prediction?.result || "N/A"}
                </p>

                <p>
                  <strong>Confidence:</strong>{" "}
                  {selectedReport.prediction?.confidence || "N/A"}%
                </p>

                <p>
                  <strong>Compression:</strong>{" "}
                  {selectedReport.compression?.compression_ratio || "N/A"}%
                </p>

                <p>
                  <strong>Filename:</strong> {selectedReport.filename}
                </p>
              </div>
            </div>

            {/* ROI Notes */}
            <div>
              <h3 className="text-lg font-semibold mb-3">
                ROI Diagnostic Notes
              </h3>

              {selectedReport.annotations &&
              selectedReport.annotations.length > 0 ? (
                <div className="space-y-3">
                  {selectedReport.annotations.map((roi, index) => (
                    <div
                      key={index}
                      className="border rounded-xl p-4 bg-yellow-50"
                    >
                      <p>
                        <strong>ROI #:</strong>{" "}
                        {roi.id || roi.roi_id || index + 1}
                      </p>

                      <p>
                        <strong>Note:</strong> {roi.note}
                      </p>

                      <p className="text-sm text-slate-600">
                        Position: ({Math.round(roi.x)}, {Math.round(roi.y)})
                      </p>

                      <p className="text-sm text-slate-600">
                        Size: {Math.round(Math.abs(roi.width))} ×{" "}
                        {Math.round(Math.abs(roi.height))}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500">No annotations available.</p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
