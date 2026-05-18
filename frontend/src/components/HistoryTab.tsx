"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";

interface Report {
  filename: string;
  prediction: string;
  confidence: number;
  compression_ratio: number;
  created_at: string;
}

export default function HistoryTab() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await fetch("http://127.0.0.1:8000/reports");
        const data = await response.json();
        setReports(data.reports || []);
      } catch (error) {
        console.error("Failed to fetch reports:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  return (
    <Card className="rounded-2xl shadow-lg">
      <CardContent className="p-6">
        <h2 className="text-2xl font-bold mb-6">Scan History</h2>

        {loading ? (
          <p>Loading reports...</p>
        ) : reports.length === 0 ? (
          <p className="text-slate-500">No reports found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3">Filename</th>
                  <th className="text-left py-3">Prediction</th>
                  <th className="text-left py-3">Confidence</th>
                  <th className="text-left py-3">Compression</th>
                  <th className="text-left py-3">Date</th>
                </tr>
              </thead>

              <tbody>
                {reports.map((report, index) => (
                  <tr key={index} className="border-b hover:bg-slate-50">
                    <td className="py-3">{report.filename}</td>

                    <td
                      className={`py-3 font-semibold ${
                        report.prediction === "Tumor"
                          ? "text-red-600"
                          : "text-green-600"
                      }`}
                    >
                      {report.prediction}
                    </td>

                    <td className="py-3">{report.confidence}%</td>

                    <td className="py-3">{report.compression_ratio}%</td>

                    <td className="py-3">
                      {new Date(report.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
