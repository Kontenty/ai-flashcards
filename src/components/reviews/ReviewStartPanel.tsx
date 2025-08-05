import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TagSelector } from "@/components/flashcards/TagSelector";
import { useReviewSession } from "@/hooks/useReviewSession";
import type { TagOption } from "@/hooks/useTags";

export function ReviewStartPanel() {
  const [selectedTags, setSelectedTags] = useState<TagOption[]>([]);
  const {
    state: { loading, cards, summary, dueCards, dueCardsLoading },
    startSession,
  } = useReviewSession();

  const handleStart = async () => {
    const tagIds = selectedTags.map((t) => t.id);
    await startSession(tagIds.length ? tagIds : undefined);
  };

  if (cards.length || summary) return null;

  // Show loading state while checking for due cards
  if (dueCardsLoading) {
    return (
      <div className="space-y-4 max-w-lg mx-auto" data-testid="review-start-panel-loading">
        <h2 className="text-2xl font-semibold text-center">Rozpocznij sesję powtórkową</h2>
        <div className="text-center">
          <div className="text-muted-foreground">Sprawdzanie dostępnych fiszek...</div>
        </div>
      </div>
    );
  }

  // Show info card when no due flashcards are available
  if (dueCards.length === 0) {
    return (
      <div className="space-y-4 max-w-lg mx-auto">
        <h2 className="text-2xl font-semibold text-center">Rozpocznij sesję powtórkową</h2>
        <Card>
          <CardHeader>
            <CardTitle className="text-center">Brak fiszek do powtórki</CardTitle>
            <CardDescription className="text-center">
              Nie masz żadnych fiszek do powtórki na dziś. Wybierz tagi, aby rozpocząć sesję z
              konkretnymi fiszkami.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TagSelector
              value={selectedTags}
              onChange={setSelectedTags}
              disabled={loading}
              chooseOnly
            />
            <div className="text-center mt-4">
              <Button
                onClick={handleStart}
                disabled={loading || selectedTags.length === 0}
                className="mt-4"
              >
                {loading ? "Ładowanie..." : "Rozpocznij sesję"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show normal panel when due flashcards are available
  return (
    <div className="space-y-4 max-w-lg mx-auto" data-testid="review-start-panel">
      <h2 className="text-2xl font-semibold text-center">Rozpocznij sesję powtórkową</h2>
      <TagSelector value={selectedTags} onChange={setSelectedTags} disabled={loading} chooseOnly />
      <div className="text-center">
        <Button
          data-testid="review-start-button"
          onClick={handleStart}
          disabled={loading}
          className="mt-4"
        >
          {loading ? "Ładowanie..." : "Rozpocznij sesję"}
        </Button>
      </div>
    </div>
  );
}
