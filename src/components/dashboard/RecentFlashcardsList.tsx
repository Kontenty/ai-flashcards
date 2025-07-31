import React from "react";
import type { FlashcardListItemDto } from "@/types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface RecentFlashcardsListProps {
  items: FlashcardListItemDto[];
}

// RecentFlashcardsList shows recently added flashcards
export function RecentFlashcardsList({ items }: RecentFlashcardsListProps) {
  if (!items || !items.length) {
    return <p className="p-4 text-center">Brak ostatnio dodanych fiszek.</p>;
  }
  return (
    <Card>
      <CardHeader>
        <CardTitle>Ostatnio dodane fiszki</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="divide-y">
          {items.map((item) => (
            <li key={item.id}>
              <a
                href="/flashcards#recent"
                className="block p-2 hover:bg-accent/50 transition-colors"
              >
                <div className="font-medium">{item.front}</div>
                <div className="text-sm text-muted-foreground">{item.back}</div>
              </a>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
