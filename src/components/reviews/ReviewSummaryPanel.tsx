import { Button } from "@/components/ui/button";
import { StatsTile } from "@/components/dashboard/StatsTile";
import { useReviewSession } from "@/hooks/useReviewSession";

export function ReviewSummaryPanel() {
  const {
    state: { summary },
  } = useReviewSession();

  if (!summary) return null;

  return (
    <div className="space-y-6 max-w-lg mx-auto text-center">
      <h2 className="text-2xl font-semibold">Podsumowanie sesji</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatsTile label="Karty" value={summary.total} />
        <StatsTile
          label="Śr. ocena"
          value={summary.averageQuality.toFixed(2)}
          tooltip="Średnia wartość z ocen 0-5"
        />
        <StatsTile
          label="% poprawnych"
          value={`${summary.correctPercentage.toFixed(1)}%`}
          tooltip="Odsetek kart z oceną ≥3"
        />
      </div>
      <Button onClick={() => (window.location.href = "/dashboard")}>Powrót do dashboardu</Button>
    </div>
  );
}
