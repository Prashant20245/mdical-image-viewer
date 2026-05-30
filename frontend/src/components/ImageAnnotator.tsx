"use client";

import { useState } from "react";
import { Stage, Layer, Image as KonvaImage, Rect, Text } from "react-konva";
import useImage from "use-image";
import { Card, CardContent } from "@/components/ui/card";
import { saveAnnotation } from "@/lib/api";

interface SavedROI {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  note: string;
}

interface ImageAnnotatorProps {
  imageSrc: string;
  reportId: string;
  onAnnotationsChange?: (annotations: SavedROI[]) => void;
}

export default function ImageAnnotator({
  imageSrc,
  reportId,
  onAnnotationsChange,
}: ImageAnnotatorProps) {
  const [image] = useImage(imageSrc);

  const [savedROIs, setSavedROIs] = useState<SavedROI[]>([]);
  const [currentROI, setCurrentROI] = useState<any>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [note, setNote] = useState("");
  const [selectedROI, setSelectedROI] = useState<SavedROI | null>(null);
  const [saving, setSaving] = useState(false);

  // =========================
  // DYNAMIC IMAGE FIT
  // =========================
  const maxWidth = 1280;
  const maxHeight = 500;

  const imageWidth = image?.width || maxWidth;
  const imageHeight = image?.height || maxHeight;

  const scale = Math.min(maxWidth / imageWidth, maxHeight / imageHeight);

  const stageWidth = imageWidth * scale;
  const stageHeight = imageHeight * scale;

  // =========================
  // START DRAW
  // =========================
  const handleMouseDown = (e: any) => {
    const pos = e.target.getStage().getPointerPosition();

    if (!pos) return;

    setIsDrawing(true);

    setCurrentROI({
      x: pos.x,
      y: pos.y,
      width: 0,
      height: 0,
    });
  };

  // =========================
  // DRAWING
  // =========================
  const handleMouseMove = (e: any) => {
    if (!isDrawing || !currentROI) return;

    const pos = e.target.getStage().getPointerPosition();

    if (!pos) return;

    setCurrentROI({
      ...currentROI,
      width: pos.x - currentROI.x,
      height: pos.y - currentROI.y,
    });
  };

  // =========================
  // STOP DRAW
  // =========================
  const handleMouseUp = () => {
    setIsDrawing(false);
  };

  // =========================
  // SAVE ROI TO FRONTEND + MONGODB
  // =========================
  const saveROI = async () => {
    if (!currentROI || !note.trim()) {
      alert("Draw ROI and write note first.");
      return;
    }

    if (!reportId) {
      alert("Report ID missing. Please upload image first.");
      return;
    }

    setSaving(true);

    try {
      const newROI: SavedROI = {
        id: savedROIs.length + 1,
        ...currentROI,
        note,
      };

      // Save to backend
      await saveAnnotation({
        report_id: reportId,
        roi_id: newROI.id,
        x: newROI.x,
        y: newROI.y,
        width: newROI.width,
        height: newROI.height,
        note: newROI.note,
      });

      // Update frontend state
      const updatedROIs = [...savedROIs, newROI];
      setSavedROIs(updatedROIs);

      // Send annotations to parent (Dashboard)
      if (onAnnotationsChange) {
        onAnnotationsChange(updatedROIs);
      }

      // Reset current drawing
      setCurrentROI(null);
      setNote("");

      alert("ROI saved successfully!");
    } catch (error) {
      console.error(error);
      alert("Failed to save ROI.");
    } finally {
      setSaving(false);
    }
  };

  // =========================
  // CLEAR CURRENT
  // =========================
  const clearCurrent = () => {
    setCurrentROI(null);
    setNote("");
  };

  return (
    <Card className="rounded-2xl shadow-lg p-6">
      <CardContent className="space-y-6">
        {/* Header */}
        <h2 className="text-2xl font-bold text-center">
          Annotate Suspicious Region
        </h2>

        {/* Buttons */}
        <div className="flex gap-4 justify-center">
          <button
            onClick={saveROI}
            disabled={saving}
            className="px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save ROI"}
          </button>

          <button
            onClick={clearCurrent}
            className="px-5 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Clear Current
          </button>
        </div>

        {/* Annotation Canvas */}
        <div className="w-full flex justify-center">
          <div
            className="border rounded-2xl overflow-auto shadow-md bg-black"
            style={{
              maxWidth: "100%",
              maxHeight: "600px",
            }}
          >
            <Stage
              width={stageWidth}
              height={stageHeight}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
            >
              <Layer>
                {/* Image */}
                {image && (
                  <KonvaImage
                    image={image}
                    width={stageWidth}
                    height={stageHeight}
                  />
                )}

                {/* Saved ROIs */}
                {savedROIs.map((roi) => (
                  <>
                    <Rect
                      key={`rect-${roi.id}`}
                      x={roi.x}
                      y={roi.y}
                      width={roi.width}
                      height={roi.height}
                      stroke="red"
                      strokeWidth={2}
                    />

                    <Text
                      key={`text-${roi.id}`}
                      x={roi.x + 4}
                      y={roi.y + 4}
                      text={`${roi.id}`}
                      fill="yellow"
                      fontSize={18}
                      fontStyle="bold"
                    />
                  </>
                ))}

                {/* Current ROI */}
                {currentROI && (
                  <Rect
                    x={currentROI.x}
                    y={currentROI.y}
                    width={currentROI.width}
                    height={currentROI.height}
                    stroke="lime"
                    strokeWidth={2}
                    dash={[5, 5]}
                  />
                )}
              </Layer>
            </Stage>
          </div>
        </div>

        {/* Note Input */}
        <div>
          <label className="block font-semibold mb-2">
            Diagnostic Observation Note
          </label>

          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Example: Possible lesion in right frontal lobe..."
            className="w-full min-h-[120px] border rounded-xl p-4 resize-none focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />
        </div>

        {/* Saved ROI Buttons */}
        {savedROIs.length > 0 && (
          <div className="border rounded-xl p-4 bg-slate-50">
            <h3 className="text-lg font-bold mb-3">Saved Diagnostic Markers</h3>

            <div className="flex flex-wrap gap-3">
              {savedROIs.map((roi) => (
                <button
                  key={roi.id}
                  onClick={() => setSelectedROI(roi)}
                  className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700"
                >
                  ROI #{roi.id}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ROI Details */}
        {selectedROI && (
          <div className="border rounded-xl p-4 bg-yellow-50">
            <h3 className="text-lg font-bold">ROI #{selectedROI.id} Details</h3>

            <p className="mt-2">
              <span className="font-semibold">Note:</span> {selectedROI.note}
            </p>

            <p className="mt-2 text-sm text-slate-600">
              Position: ({Math.round(selectedROI.x)},{" "}
              {Math.round(selectedROI.y)})
            </p>

            <p className="mt-2 text-sm text-slate-600">
              Size: {Math.round(Math.abs(selectedROI.width))} ×{" "}
              {Math.round(Math.abs(selectedROI.height))}
            </p>
          </div>
        )}

        {/* Footer */}
        <p className="text-sm text-slate-500 text-center">
          Draw ROI → Add Note → Save → Stored in MongoDB → Click ROI Button to
          Review
        </p>
      </CardContent>
    </Card>
  );
}

// "use client";

// import { useState } from "react";
// import { Stage, Layer, Image as KonvaImage, Rect, Text } from "react-konva";
// import useImage from "use-image";
// import { Card, CardContent } from "@/components/ui/card";
// import { saveAnnotation } from "@/lib/api";

// interface SavedROI {
//   id: number;
//   x: number;
//   y: number;
//   width: number;
//   height: number;
//   note: string;
// }

// interface ImageAnnotatorProps {
//   imageSrc: string;
//   reportId: string;
//   onAnnotationsChange?: (annotations: SavedROI[]) => void;
// }

// export default function ImageAnnotator({
//   imageSrc,
//   reportId,
//   onAnnotationsChange,
// }: ImageAnnotatorProps) {
//   const [image] = useImage(imageSrc);

//   const [savedROIs, setSavedROIs] = useState<SavedROI[]>([]);
//   const [currentROI, setCurrentROI] = useState<any>(null);
//   const [isDrawing, setIsDrawing] = useState(false);
//   const [note, setNote] = useState("");
//   const [selectedROI, setSelectedROI] = useState<SavedROI | null>(null);
//   const [saving, setSaving] = useState(false);

//   // =========================
//   // DYNAMIC IMAGE FIT (FIXED ASPECT RATIO)
//   // =========================
//   const maxWidth = 1280;
//   const maxHeight = 500;

//   const imageWidth = image?.width || maxWidth;
//   const imageHeight = image?.height || maxHeight;

//   const scale = Math.min(maxWidth / imageWidth, maxHeight / imageHeight);

//   const stageWidth = imageWidth * scale;
//   const stageHeight = imageHeight * scale;

//   // =========================
//   // START DRAW
//   // =========================
//   const handleMouseDown = (e: any) => {
//     const pos = e.target.getStage().getPointerPosition();

//     if (!pos) return;

//     setIsDrawing(true);

//     setCurrentROI({
//       x: pos.x,
//       y: pos.y,
//       width: 0,
//       height: 0,
//     });
//   };

//   // =========================
//   // DRAWING
//   // =========================
//   const handleMouseMove = (e: any) => {
//     if (!isDrawing || !currentROI) return;

//     const pos = e.target.getStage().getPointerPosition();

//     if (!pos) return;

//     setCurrentROI({
//       ...currentROI,
//       width: pos.x - currentROI.x,
//       height: pos.y - currentROI.y,
//     });
//   };

//   // =========================
//   // STOP DRAW
//   // =========================
//   const handleMouseUp = () => {
//     setIsDrawing(false);
//   };

//   // =========================
//   // SAVE ROI TO FRONTEND + MONGODB
//   // =========================
//   const saveROI = async () => {
//     if (!currentROI || !note.trim()) {
//       alert("Draw ROI and write note first.");
//       return;
//     }

//     if (!reportId) {
//       alert("Report ID missing. Please upload image first.");
//       return;
//     }

//     const roiId = savedROIs.length + 1;

//     const newROI: SavedROI = {
//       id: roiId,
//       ...currentROI,
//       note,
//     };

//     try {
//       setSaving(true);

//       await saveAnnotation({
//         report_id: reportId,
//         roi_id: roiId,
//         x: currentROI.x,
//         y: currentROI.y,
//         width: currentROI.width,
//         height: currentROI.height,
//         note,
//       });

//       setSavedROIs([...savedROIs, newROI]);

//       setCurrentROI(null);
//       setNote("");

//       alert("ROI saved to MongoDB successfully!");
//     } catch (error) {
//       console.error("Save ROI Failed:", error);

//       alert("Failed to save ROI.");
//     } finally {
//       setSaving(false);
//     }
//   };

//   // =========================
//   // CLEAR CURRENT ROI
//   // =========================
//   const clearCurrent = () => {
//     setCurrentROI(null);
//     setNote("");
//   };

//   return (
//     <Card className="rounded-2xl shadow-lg p-6">
//       <CardContent className="space-y-6">
//         <h2 className="text-2xl font-bold text-center">
//           Annotate Suspicious Region
//         </h2>

//         {/* Buttons */}
//         <div className="flex gap-4 justify-center">
//           <button
//             onClick={saveROI}
//             disabled={saving}
//             className="px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
//           >
//             {saving ? "Saving..." : "Save ROI"}
//           </button>

//           <button
//             onClick={clearCurrent}
//             className="px-5 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
//           >
//             Clear Current
//           </button>
//         </div>

//         {/* Canvas */}
//         <div className="w-full flex justify-center items-center border rounded-xl overflow-auto shadow-md bg-black p-4">
//           <Stage
//             width={stageWidth}
//             height={stageHeight}
//             onMouseDown={handleMouseDown}
//             onMouseMove={handleMouseMove}
//             onMouseUp={handleMouseUp}
//           >
//             <Layer>
//               {/* Main Image */}
//               {image && (
//                 <KonvaImage
//                   image={image}
//                   width={stageWidth}
//                   height={stageHeight}
//                 />
//               )}

//               {/* Saved ROIs */}
//               {savedROIs.map((roi) => (
//                 <>
//                   <Rect
//                     key={`rect-${roi.id}`}
//                     x={roi.x}
//                     y={roi.y}
//                     width={roi.width}
//                     height={roi.height}
//                     stroke="red"
//                     strokeWidth={2}
//                     onClick={() => setSelectedROI(roi)}
//                   />

//                   <Text
//                     key={`text-${roi.id}`}
//                     x={roi.x}
//                     y={roi.y - 20}
//                     text={`#${roi.id}`}
//                     fontSize={18}
//                     fill="yellow"
//                     fontStyle="bold"
//                   />
//                 </>
//               ))}

//               {/* Current ROI */}
//               {currentROI && (
//                 <Rect
//                   x={currentROI.x}
//                   y={currentROI.y}
//                   width={currentROI.width}
//                   height={currentROI.height}
//                   stroke="lime"
//                   dash={[5, 5]}
//                   strokeWidth={2}
//                 />
//               )}
//             </Layer>
//           </Stage>
//         </div>

//         {/* Note Box */}
//         <div className="space-y-2">
//           <h3 className="text-lg font-semibold">Diagnostic Observation Note</h3>

//           <textarea
//             value={note}
//             onChange={(e) => setNote(e.target.value)}
//             placeholder="Example: Possible lesion in right frontal lobe..."
//             className="w-full min-h-[120px] border rounded-xl p-4 resize-none focus:outline-none focus:ring-2 focus:ring-cyan-500"
//           />
//         </div>

//         {/* Saved ROI Buttons */}
//         {savedROIs.length > 0 && (
//           <div className="border rounded-xl p-4 bg-slate-50">
//             <h3 className="text-lg font-bold mb-3">Saved Diagnostic Markers</h3>

//             <div className="flex flex-wrap gap-3">
//               {savedROIs.map((roi) => (
//                 <button
//                   key={roi.id}
//                   onClick={() => setSelectedROI(roi)}
//                   className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700"
//                 >
//                   ROI #{roi.id}
//                 </button>
//               ))}
//             </div>
//           </div>
//         )}

//         {/* ROI Details */}
//         {selectedROI && (
//           <div className="border rounded-xl p-4 bg-yellow-50">
//             <h3 className="text-lg font-bold">ROI #{selectedROI.id} Details</h3>

//             <p className="mt-2">
//               <span className="font-semibold">Note:</span> {selectedROI.note}
//             </p>

//             <p className="mt-2 text-sm text-slate-600">
//               Position: ({Math.round(selectedROI.x)},{" "}
//               {Math.round(selectedROI.y)})
//             </p>

//             <p className="mt-2 text-sm text-slate-600">
//               Size: {Math.round(Math.abs(selectedROI.width))} ×{" "}
//               {Math.round(Math.abs(selectedROI.height))}
//             </p>
//           </div>
//         )}

//         <p className="text-sm text-slate-500 text-center">
//           Draw ROI → Add Note → Save → Stored in MongoDB → Click ROI Button to
//           Review
//         </p>
//       </CardContent>
//     </Card>
//   );
// }
