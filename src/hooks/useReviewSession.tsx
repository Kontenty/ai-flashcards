import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import { toast } from "sonner";
import type { ReviewCardDto } from "@/types";

interface SummaryStats {
  total: number;
  averageQuality: number; // 0-5
  correctPercentage: number; // quality ≥3
}

interface ReviewSessionState {
  cards: ReviewCardDto[];
  currentIndex: number;
  side: "front" | "back";
  submitted: Record<string, number>; // flashcardId → quality
  summary?: SummaryStats;
  loading: boolean;
  isSubmitting: boolean;
}

interface ReviewSessionContextValue {
  state: ReviewSessionState;
  startSession: (tagIds?: string[]) => Promise<void>;
  flip: () => void;
  rate: (quality: number) => Promise<void>;
}

const ReviewSessionContext = createContext<ReviewSessionContextValue | undefined>(undefined);

export const ReviewSessionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<ReviewSessionState>({
    cards: [],
    currentIndex: 0,
    side: "front",
    submitted: {},
    loading: false,
    isSubmitting: false,
  });

  const startSession = useCallback(async (tagIds?: string[]) => {
    setState((s) => ({ ...s, loading: true, summary: undefined }));
    try {
      const { fetchReviewSession } = await import("@/lib/services/reviewSession.service");
      const cards = await fetchReviewSession(tagIds);
      if (cards === null) {
        toast.info("Brak fiszek do powtórki na dziś");
        setState((s) => ({ ...s, loading: false }));
        return;
      }
      setState({
        cards,
        currentIndex: 0,
        side: "front",
        submitted: {},
        summary: undefined,
        loading: false,
        isSubmitting: false,
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : String(err));
      setState((s) => ({ ...s, loading: false }));
    }
  }, []);

  const flip = useCallback(() => {
    setState((s) => ({ ...s, side: s.side === "front" ? "back" : "front" }));
  }, []);

  const rate = useCallback(
    async (quality: number) => {
      setState((prev) => ({ ...prev, isSubmitting: true }));
      try {
        const { cards, currentIndex, side } = state;
        if (side === "front" || !cards[currentIndex]) {
          setState((s) => ({ ...s, isSubmitting: false }));
          return;
        }
        const card = cards[currentIndex];
        const { submitReview } = await import("@/lib/services/reviewSession.service");
        await submitReview(card.id, quality);

        setState((prev) => {
          const newSubmitted = { ...prev.submitted, [card.id]: quality };
          const nextIndex = prev.currentIndex + 1;
          if (nextIndex >= prev.cards.length) {
            // Compute summary
            const qualities = Object.values(newSubmitted);
            const total = qualities.length;
            const averageQuality = qualities.reduce((a, b) => a + b, 0) / total;
            const correctPercentage = (qualities.filter((q) => q >= 3).length / total) * 100;
            return {
              ...prev,
              submitted: newSubmitted,
              isSubmitting: false,
              summary: { total, averageQuality, correctPercentage },
            };
          }

          return {
            ...prev,
            currentIndex: nextIndex,
            side: "front",
            submitted: newSubmitted,
            isSubmitting: false,
          };
        });
      } catch (err) {
        // Network error -> retry after delay
        if (err instanceof TypeError) {
          toast.error("Błąd sieci – ponawiam za 5 s…");
          setTimeout(() => rate(quality), 5000);
        } else {
          toast.error(err instanceof Error ? err.message : String(err));
        }
        setState((s) => ({ ...s, isSubmitting: false }));
      }
    },
    [state],
  );

  const contextValue: ReviewSessionContextValue = useMemo(
    () => ({ state, startSession, flip, rate }),
    [state, startSession, flip, rate],
  );

  return (
    <ReviewSessionContext.Provider value={contextValue}>{children}</ReviewSessionContext.Provider>
  );
};

export const useReviewSession = () => {
  const ctx = useContext(ReviewSessionContext);
  if (!ctx) {
    throw new Error("useReviewSession must be used within a ReviewSessionProvider");
  }
  return ctx;
};
