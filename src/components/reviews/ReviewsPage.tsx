import { ReviewSessionProvider } from "@/hooks/useReviewSession";
import { ReviewStartPanel } from "./ReviewStartPanel";
import { ReviewCardPanel } from "./ReviewCardPanel";
import { ReviewSummaryPanel } from "./ReviewSummaryPanel";

export function ReviewsPage() {
  return (
    <ReviewSessionProvider>
      <div className="container mx-auto px-4 py-8 space-y-8" data-testid="reviews-page">
        <ReviewStartPanel />
        <ReviewCardPanel />
        <ReviewSummaryPanel />
      </div>
    </ReviewSessionProvider>
  );
}
