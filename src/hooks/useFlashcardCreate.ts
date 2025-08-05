import { useCallback, useState } from "react";
import type { CreateFlashcardCommand, FlashcardDetailDto } from "@/types";
import { getStringField } from "@/lib/utils";

interface UseFlashcardCreateResult {
  create: (cmd: CreateFlashcardCommand) => Promise<FlashcardDetailDto>;
  loading: boolean;
  error: string | null;
}

/**
 * Hook responsible for creating a flashcard via POST /api/flashcards.
 * Returns loading & error state plus create() helper.
 */
export function useFlashcardCreate(): UseFlashcardCreateResult {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = useCallback(async (cmd: CreateFlashcardCommand) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/flashcards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cmd),
      });
      if (!res.ok) {
        const json = await res.json();
        throw new Error(getStringField(json, "message", res.statusText));
      }
      const detail: FlashcardDetailDto = await res.json();
      return detail;
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { create, loading, error };
}
