import type { ReviewCardDto } from "@/types";
import React from "react";

interface FlashcardFrontBackProps {
  card: Pick<ReviewCardDto, "front" | "back">;
  side: "front" | "back";
  onFlip: () => void;
}

// Simple CSS-based flip using Tailwind classes.
// Wrapper has perspective; inner div is rotated 180deg on Y axis when showing back side.
export const FlashcardFrontBack: React.FC<FlashcardFrontBackProps> = ({ card, side, onFlip }) => {
  return (
    <button
      type="button"
      className="[perspective:1000px] mx-auto w-full max-w-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/70"
      onClick={onFlip}
      onKeyDown={(e) => {
        if (e.key === " " || e.key === "Enter") {
          e.preventDefault();
          onFlip();
        }
      }}
      aria-label="Flip card"
    >
      <div
        className={
          "relative h-48 w-full transition-transform duration-500 ease-[cubic-bezier(0.45,0,0.55,1)] [transform-style:preserve-3d] " +
          (side === "back" ? "[transform:rotateY(180deg)]" : "")
        }
      >
        <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-card p-6 text-center text-lg font-medium shadow-md [backface-visibility:hidden]">
          {card.front}
        </div>
        <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-card p-6 text-center text-lg font-medium shadow-md [transform:rotateY(180deg)] [backface-visibility:hidden]">
          {card.back}
        </div>
      </div>
    </button>
  );
};
