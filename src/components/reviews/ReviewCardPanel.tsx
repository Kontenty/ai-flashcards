import { Progress } from "@/components/ui/progress";
import { useReviewSession } from "@/hooks/useReviewSession";
import { FlashcardFrontBack } from "./FlashcardFrontBack";
import { RatingBar } from "./RatingBar";
import { Button } from "@/components/ui/button";

export function ReviewCardPanel() {
  const {
    state: { cards, currentIndex, side, isSubmitting, summary },
    flip,
    rate,
  } = useReviewSession();

  // hide when no cards or summary exists (completed)
  if (!cards.length || summary) return null;

  const card = cards[currentIndex];
  const progress = (currentIndex / cards.length) * 100;

  return (
    <div className="space-y-4">
      <Progress value={progress} />
      <FlashcardFrontBack card={card} side={side} onFlip={flip} />
      <div className="text-center">
        <Button variant="outline" onClick={flip} className="mt-2">
          {side === "front" ? "Pokaż odpowiedź" : "Ukryj odpowiedź"}
        </Button>
      </div>
      <RatingBar onRate={rate} disabled={isSubmitting || side === "front"} />
    </div>
  );
}
