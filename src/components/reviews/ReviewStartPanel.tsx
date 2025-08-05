import { useState } from "react";
import { Button } from "@/components/ui/button";
import { TagSelector } from "@/components/flashcards/TagSelector";
import { useReviewSession } from "@/hooks/useReviewSession";
import type { TagOption } from "@/hooks/useTags";

export function ReviewStartPanel() {
  const [selectedTags, setSelectedTags] = useState<TagOption[]>([]);
  const {
    state: { loading, cards, summary },
    startSession,
  } = useReviewSession();

  const handleStart = async () => {
    const tagIds = selectedTags.map((t) => t.id);
    await startSession(tagIds.length ? tagIds : undefined);
  };

  if (cards.length || summary) return null;

  return (
    <div className="space-y-4 max-w-lg mx-auto">
      <h2 className="text-2xl font-semibold text-center">Rozpocznij sesję powtórkową</h2>
      <TagSelector value={selectedTags} onChange={setSelectedTags} disabled={loading} />
      <div className="text-center">
        <Button onClick={handleStart} disabled={loading} className="mt-4">
          {loading ? "Ładowanie..." : "Rozpocznij sesję"}
        </Button>
      </div>
    </div>
  );
}
