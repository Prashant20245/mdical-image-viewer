"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { uploadMedicalImage } from "@/lib/api";

import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";

interface UploadBoxProps {
  onAnalysisComplete: (data: any) => void;
}

export default function UploadBox({ onAnalysisComplete }: UploadBoxProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;

    const imageUrl = URL.createObjectURL(file);
    setPreview(imageUrl);

    try {
      setLoading(true);

      const result = await uploadMedicalImage(file);

      console.log("Backend Response:", result);

      onAnalysisComplete(result);
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
        <h2 className="text-xl font-semibold">Upload CT Scan</h2>

        {/* Upload Box */}
        <label className="border-2 border-dashed border-slate-400 rounded-xl p-10 w-full text-center cursor-pointer hover:border-cyan-500 transition">
          <input
            type="file"
            accept="image/png, image/jpeg"
            className="hidden"
            onChange={handleImageUpload}
          />
          {loading ? "Uploading..." : "Click to Upload JPG/PNG"}
        </label>

        {/* Zoomable Preview */}
        {preview && (
          <div className="w-full border rounded-2xl p-4 bg-slate-50">
            <TransformWrapper>
              {({ zoomIn, zoomOut, resetTransform }) => (
                <>
                  {/* Horizontal Toolbar */}
                  <div className="flex flex-wrap gap-3 justify-center mb-4">
                    <button
                      onClick={() => zoomIn()}
                      className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition"
                    >
                      Zoom In
                    </button>

                    <button
                      onClick={() => zoomOut()}
                      className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition"
                    >
                      Zoom Out
                    </button>

                    <button
                      onClick={() => resetTransform()}
                      className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-800 transition"
                    >
                      Reset
                    </button>
                  </div>

                  {/* Image Viewer */}
                  <div className="w-full h-96 flex items-center justify-center overflow-hidden border rounded-xl bg-white">
                    <TransformComponent>
                      <img
                        src={preview}
                        alt="Preview"
                        className="max-h-full max-w-full object-contain cursor-grab"
                      />
                    </TransformComponent>
                  </div>
                </>
              )}
            </TransformWrapper>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// "use client";

// import { useState } from "react";
// import { Card, CardContent } from "@/components/ui/card";
// import { uploadMedicalImage } from "@/lib/api";

// interface UploadBoxProps {
//   onAnalysisComplete: (data: any) => void;
// }

// export default function UploadBox({ onAnalysisComplete }: UploadBoxProps) {
//   const [preview, setPreview] = useState<string | null>(null);
//   const [loading, setLoading] = useState(false);

//   const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];

//     if (!file) return;

//     const imageUrl = URL.createObjectURL(file);
//     setPreview(imageUrl);

//     try {
//       setLoading(true);

//       const result = await uploadMedicalImage(file);

//       console.log("Backend Response:", result);

//       onAnalysisComplete(result);
//     } catch (error) {
//       console.error("Upload Failed:", error);

//       alert("Backend connection failed.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <Card className="rounded-2xl shadow-lg p-6">
//       <CardContent className="flex flex-col items-center justify-center space-y-4">
//         <h2 className="text-xl font-semibold">Upload CT Scan</h2>

//         <label className="border-2 border-dashed border-slate-400 rounded-xl p-10 w-full text-center cursor-pointer hover:border-cyan-500 transition">
//           <input
//             type="file"
//             accept="image/png, image/jpeg"
//             className="hidden"
//             onChange={handleImageUpload}
//           />
//           {loading ? "Uploading..." : "Click to Upload JPG/PNG"}
//         </label>

//         {preview && (
//           <div className="w-full h-72 flex items-center justify-center border rounded-xl overflow-hidden bg-slate-50">
//             <img
//               src={preview}
//               alt="Preview"
//               className="max-h-full max-w-full object-contain"
//             />
//           </div>
//         )}
//       </CardContent>
//     </Card>
//   );
// }
