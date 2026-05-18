import { Card, CardContent } from "@/components/ui/card";

interface CompressionStatsProps {
  compression?: {
    original_size_mb: number;
    compressed_size_mb: number;
    compression_ratio: number;
  };
}

export default function CompressionStats({
  compression,
}: CompressionStatsProps) {
  return (
    <Card className="rounded-2xl shadow-lg p-6">
      <CardContent className="space-y-4">
        <h2 className="text-xl font-semibold">JPEG2000 Compression Stats</h2>

        {compression ? (
          <div className="space-y-2">
            <p>
              <span className="font-medium">Original Size:</span>{" "}
              {compression.original_size_mb} MB
            </p>

            <p>
              <span className="font-medium">Compressed Size:</span>{" "}
              {compression.compressed_size_mb} MB
            </p>

            <p>
              <span className="font-medium">Compression Ratio:</span>{" "}
              {compression.compression_ratio}%
            </p>
          </div>
        ) : (
          <p className="text-slate-500">
            Upload an image to view compression analytics.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

// import { Card, CardContent } from "@/components/ui/card";

// export default function CompressionStats() {
//   return (
//     <Card className="rounded-2xl shadow-lg p-6">
//       <CardContent className="space-y-4">
//         <h2 className="text-xl font-semibold">JPEG2000 Compression Stats</h2>

//         <div className="space-y-2">
//           <p>
//             <span className="font-medium">Original Size:</span> 4.8 MB
//           </p>

//           <p>
//             <span className="font-medium">Compressed Size:</span> 2.1 MB
//           </p>

//           <p>
//             <span className="font-medium">Compression Ratio:</span> 56%
//           </p>
//         </div>
//       </CardContent>
//     </Card>
//   );
// }
