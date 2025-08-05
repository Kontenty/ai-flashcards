import React from "react";
import type { ReviewCardDto } from "@/types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface DueFlashcardsListProps {
  items: ReviewCardDto[];
}

// DueFlashcardsList shows flashcards scheduled for review today
export function DueFlashcardsList({ items }: DueFlashcardsListProps) {
  if (!items.length) {
    return <p className="p-4 text-center">Brak fiszek do powtórki.</p>;
  }
  return (
    <Card>
      <CardHeader>
        <CardTitle>Fiszki do powtórki</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="divide-y">
          {items.map((item) => (
            <li key={item.id}>
              <a href="/reviews" className="block p-2 hover:bg-accent/50 transition-colors">
                <div className="font-medium">{item.front}</div>
                <div className="text-sm text-muted-foreground">
                  Interval: {item.interval}, EF: {item.ease_factor}
                </div>
              </a>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
