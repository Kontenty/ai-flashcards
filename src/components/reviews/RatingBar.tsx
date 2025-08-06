import { Button } from "@/components/ui/button";
import React from "react";

interface RatingBarProps {
  onRate: (quality: number) => void;
  disabled?: boolean;
}

import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

const ratings = [
  { q: 0, label: "0", desc: "Total blackout" },
  { q: 1, label: "1", desc: "Incorrect, but remembered" },
  { q: 2, label: "2", desc: "Incorrect answer after a delay" },
  { q: 3, label: "3", desc: "Correct with effort" },
  { q: 4, label: "4", desc: "Correct response" },
  { q: 5, label: "5", desc: "Perfect recall" },
];

export const RatingBar: React.FC<RatingBarProps> = ({ onRate, disabled }) => {
  return (
    <div className="flex flex-wrap justify-center gap-2">
      {ratings.map(({ q, label, desc }) => (
        <Tooltip key={q}>
          <TooltipTrigger asChild>
            <Button size="sm" onClick={() => onRate(q)} disabled={disabled}>
              {label}
            </Button>
          </TooltipTrigger>
          <TooltipContent>{desc}</TooltipContent>
        </Tooltip>
      ))}
    </div>
  );
};
