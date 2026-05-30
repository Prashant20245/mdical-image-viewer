import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface PredictionCardProps {
  prediction?: {
    prediction: string;
    confidence: number;
  };
}

export default function PredictionCard({ prediction }: PredictionCardProps) {
  if (!prediction) {
    return (
      <Card className="rounded-2xl shadow-lg p-6">
        <CardContent>
          <h2 className="text-xl font-semibold mb-4">Tumor Prediction</h2>
          <p className="text-slate-500">
            Upload an image to view AI prediction.
          </p>
        </CardContent>
      </Card>
    );
  }

  const isTumor = prediction.prediction === "Tumor";

  return (
    <Card className="rounded-2xl shadow-lg p-6">
      <CardContent className="space-y-4">
        <h2 className="text-xl font-semibold">Tumor Prediction</h2>

        <div>
          <p
            className={`text-lg font-bold ${
              isTumor ? "text-red-600" : "text-green-600"
            }`}
          >
            {prediction.prediction}
          </p>

          <p className="text-sm text-slate-500">
            Confidence Score: {prediction.confidence}%
          </p>
        </div>

        <Progress value={prediction.confidence} />
      </CardContent>
    </Card>
  );
}
