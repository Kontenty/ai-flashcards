import { useState } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pencil, X, Save } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { SuggestionDto, CreateFlashcardCommand } from "@/types";
import { getStringField } from "@/lib/utils";

interface FlashcardListProps {
  suggestions: SuggestionDto[];
  onEdit: (index: number) => void;
  onReject: (index: number) => void;
  onBulkSaveSuccess: () => void;
  tagIds: string[];
}

export function FlashcardList({
  suggestions,
  onEdit,
  onReject,
  onBulkSaveSuccess,
  tagIds,
}: Readonly<FlashcardListProps>) {
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rejectIndex, setRejectIndex] = useState<number | null>(null);
  const [showBulkSaveConfirm, setShowBulkSaveConfirm] = useState(false);

  const handleBulkSave = async () => {
    const originalSuggestions = [...suggestions];
    const cards: CreateFlashcardCommand[] = suggestions.map((suggestion) => ({
      front: suggestion.front,
      back: suggestion.back,
      tagIds,
    }));

    try {
      setIsSaving(true);
      setError(null);

      // Optimistically clear all suggestions
      suggestions.forEach((_, index) => onReject(index));

      const response = await fetch("/api/flashcards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cards),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(getStringField(errorData, "message", "Failed to save flashcards"));
      }

      toast.success(`Saved ${cards.length} flashcards successfully`);
      onBulkSaveSuccess();
    } catch (err) {
      // Revert optimistic update on error
      originalSuggestions.forEach((_, index) => {
        if (!suggestions.some((_, i) => i === index)) {
          onReject(index);
        }
      });

      const message =
        err instanceof Error ? err.message : "An error occurred while saving flashcards";
      setError(message);
      toast.error(message);
    } finally {
      setIsSaving(false);
      setShowBulkSaveConfirm(false);
    }
  };

  const handleReject = (index: number) => {
    setRejectIndex(index);
  };

  const confirmReject = () => {
    if (rejectIndex !== null) {
      onReject(rejectIndex);
      setRejectIndex(null);
      toast.success("Flashcard rejected");
    }
  };

  if (suggestions.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No flashcards generated yet. Enter some text and click &quot;Generate Flashcards&quot; to
        get started.
      </div>
    );
  }

  return (
    <div className="space-y-4" data-testid="flashcard-list">
      <div className="flex justify-end">
        <Button
          data-testid="flashcard-list-save-all"
          onClick={() => setShowBulkSaveConfirm(true)}
          disabled={isSaving}
          className="flex items-center gap-2"
        >
          <Save className="h-4 w-4" />
          {isSaving ? "Saving..." : "Save All"}
        </Button>
      </div>

      {error && (
        <Alert variant="destructive" role="alert" data-testid="flashcard-list-error">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {suggestions.map((suggestion, index) => (
        <Card key={index} className="relative" data-testid={`flashcard-card-${index}`}>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Front</h3>
                <p className="text-muted-foreground" data-testid={`flashcard-front-${index}`}>
                  {suggestion.front}
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Back</h3>
                <p className="text-muted-foreground" data-testid={`flashcard-back-${index}`}>
                  {suggestion.back}
                </p>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end space-x-2">
            <Button
              variant="outline"
              size="sm"
              data-testid={`flashcard-edit-button-${index}`}
              onClick={() => onEdit(index)}
              disabled={isSaving}
            >
              <Pencil className="h-4 w-4 mr-2" />
              Edit
            </Button>
            <Button
              variant="destructive"
              size="sm"
              data-testid={`flashcard-reject-button-${index}`}
              onClick={() => handleReject(index)}
              disabled={isSaving}
            >
              <X className="h-4 w-4 mr-2" />
              Reject
            </Button>
          </CardFooter>
        </Card>
      ))}

      <AlertDialog open={rejectIndex !== null} onOpenChange={() => setRejectIndex(null)}>
        <AlertDialogContent data-testid="flashcard-reject-dialog">
          <AlertDialogHeader>
            <AlertDialogTitle>Reject Flashcard</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to reject this flashcard? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="alert-dialog-cancel">Cancel</AlertDialogCancel>
            <AlertDialogAction
              data-testid="flashcard-reject-dialog-confirm"
              onClick={confirmReject}
            >
              Reject
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showBulkSaveConfirm} onOpenChange={setShowBulkSaveConfirm}>
        <AlertDialogContent data-testid="flashcard-bulk-save-dialog">
          <AlertDialogHeader>
            <AlertDialogTitle>Save All Flashcards</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to save all {suggestions.length} flashcards? This will remove
              them from the suggestions list.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="flashcard-bulk-save-dialog-cancel">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              data-testid="flashcard-bulk-save-dialog-confirm"
              onClick={handleBulkSave}
            >
              Save All
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
