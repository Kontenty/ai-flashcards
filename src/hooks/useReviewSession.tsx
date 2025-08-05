import React, { createContext, useCallback, useContext, useMemo, useState, useEffect } from "react";
import { toast } from "sonner";
import { fetchReviewSession, submitReview } from "@/lib/services/reviewSession.service";
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
  dueCards: ReviewCardDto[]; // List of due flashcards
  dueCardsLoading: boolean; // Loading state for due cards
}

interface ReviewSessionContextValue {
  state: ReviewSessionState;
  startSession: (tagIds?: string[]) => Promise<void>;
  flip: () => void;
  rate: (quality: number) => Promise<void>;
  refreshDueCards: () => Promise<void>;
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
    dueCards: [],
    dueCardsLoading: true,
  });
  // Centralized error handler to DRY up toast messages and state resets
  const handleError = (error: unknown, partialState: Partial<ReviewSessionState> = {}) => {
    const message = error instanceof Error ? error.message : String(error);
    toast.error(message);
    setState((prev) => ({ ...prev, ...partialState }));
  };

  const fetchDueCards = useCallback(async () => {
    setState((prev) => ({ ...prev, dueCardsLoading: true }));
    try {
      const cards = await fetchReviewSession();
      setState((s) => ({
        ...s,
        dueCards: cards ?? [],
        dueCardsLoading: false,
      }));
    } catch (err) {
      handleError(err, { dueCardsLoading: false });
    }
  }, []);

  // Fetch due cards on mount
  useEffect(() => {
    fetchDueCards();
  }, [fetchDueCards]);

  const startSession = useCallback(async (tagIds?: string[]) => {
    setState((prev) => ({ ...prev, loading: true, summary: undefined }));
    try {
      const cards = await fetchReviewSession(tagIds);
      if (cards === null) {
        toast.info("Brak fiszek do powtórki na dziś");
        setState((prev) => ({ ...prev, loading: false }));
        return;
      }
      setState((prev) => ({
        ...prev,
        cards,
        currentIndex: 0,
        side: "front",
        submitted: {},
        summary: undefined,
        loading: false,
        isSubmitting: false,
      }));
    } catch (err) {
      handleError(err, { loading: false });
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
          setState((prev) => ({ ...prev, isSubmitting: false }));
          return;
        }
        const card = cards[currentIndex];
        // show the API’s success message as a toast
        const reviewResponse = await submitReview(card.id, quality);
        toast.success(reviewResponse.message);

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
        if (err instanceof TypeError) {
          toast.error("Błąd sieci – ponawiam za 5 s…");
          setState((prev) => ({ ...prev, isSubmitting: false }));
          setTimeout(() => rate(quality), 5000);
        } else {
          handleError(err, { isSubmitting: false });
        }
      }
    },
    [state],
  );

  const refreshDueCards = useCallback(async () => {
    await fetchDueCards();
  }, [fetchDueCards]);

  const contextValue: ReviewSessionContextValue = useMemo(
    () => ({ state, startSession, flip, rate, refreshDueCards }),
    [state, startSession, flip, rate, refreshDueCards],
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
