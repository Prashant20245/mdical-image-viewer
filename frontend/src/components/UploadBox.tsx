"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { uploadMedicalImage } from "@/lib/api";

interface UploadBoxProps {
  onAnalysisComplete: (data: any) => void;
  onImageUpload: (imageUrl: string) => void;
}

export default function UploadBox({
  onAnalysisComplete,
  onImageUpload,
}: UploadBoxProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;

    const imageUrl = URL.createObjectURL(file);

    // Local preview
    setPreview(imageUrl);

    // Send image to parent for annotator
    onImageUpload(imageUrl);

    try {
      setLoading(true);

      // Backend analyze only (no final save)
      const result = await uploadMedicalImage(file);

      console.log("Backend Response:", result);

      // Send analysis result to dashboard
      onAnalysisComplete(result);

      alert(
        "Image analyzed successfully! Now review prediction, annotate ROI, and save final report.",
      );
    } catch (error) {
      console.error("Upload Failed:", error);

      alert("Backend connection failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="rounded-2xl shadow-lg p-6">
      <CardContent className="flex flex-col items-center justify-center space-y-4">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-2xl font-bold">Upload CT / MRI Scan</h2>

          <p className="text-sm text-slate-500 mt-2">
            Step 1: Upload medical scan for JPEG2000 compression + AI analysis
          </p>
        </div>

        {/* Upload Area */}
        <label className="border-2 border-dashed border-slate-400 rounded-2xl p-5 w-full text-center cursor-pointer hover:border-cyan-500 hover:bg-cyan-50 transition">
          <input
            type="file"
            accept="image/png, image/jpeg, image/jpg"
            className="hidden"
            onChange={handleImageUpload}
          />

          <div className="space-y-3">
            <p className="text-lg font-medium">
              {loading ? "Analyzing Scan..." : "Click to Upload JPG / PNG"}
            </p>

            <p className="text-sm text-slate-500">
              Supported: Brain CT, MRI, Tumor Scan Images
            </p>
          </div>
        </label>

        {/* Loading */}
        {loading && (
          <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
            <div className="h-full bg-cyan-600 animate-pulse w-full"></div>
          </div>
        )}

        {/* Preview */}
        {preview && (
          <div className="w-full border rounded-2xl p-4 bg-slate-50 shadow-sm">
            <h3 className="text-lg font-semibold mb-4 text-center">
              Uploaded Scan Preview
            </h3>

            <div className="w-full flex items-center justify-center border rounded-xl overflow-hidden bg-black min-h-[420px]">
              <img
                src={preview}
                alt="Preview"
                className="max-h-[420px] w-auto object-contain"
              />
            </div>

            <div className="mt-4 space-y-2 text-center">
              <p className="text-sm text-slate-600">
                Image successfully loaded for:
              </p>

              <div className="flex flex-wrap justify-center gap-3 text-xs">
                <span className="px-3 py-1 bg-cyan-100 text-cyan-700 rounded-full">
                  JPEG2000 Compression
                </span>

                <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full">
                  AI Tumor Detection
                </span>

                <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full">
                  ROI Annotation
                </span>

                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full">
                  Final Medical Report
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <p className="text-sm text-slate-500 text-center">
          Workflow: Upload → Analyze → Annotate → Save Final Report
        </p>
      </CardContent>
    </Card>
  );
}
