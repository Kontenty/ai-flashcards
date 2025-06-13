import { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { SuggestionDto, CreateFlashcardCommand } from "@/types";

const MAX_FRONT_LENGTH = 200;
const MAX_BACK_LENGTH = 500;

interface EditCardModalProps {
  isOpen: boolean;
  card: SuggestionDto;
  onSave: (card: CreateFlashcardCommand) => Promise<void>;
  onClose: () => void;
}

export function EditCardModal({ isOpen, card, onSave, onClose }: Readonly<EditCardModalProps>) {
  const [front, setFront] = useState(card.front);
  const [back, setBack] = useState(card.back);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setFront(card.front);
    setBack(card.back);
    setError(null);
  }, [card]);

  const handleSave = useCallback(async () => {
    const validate = (): boolean => {
      if (front.trim().length === 0) {
        setError("Front cannot be empty");
        return false;
      }
      if (back.trim().length === 0) {
        setError("Back cannot be empty");
        return false;
      }
      if (front.length > MAX_FRONT_LENGTH) {
        setError(`Front cannot be longer than ${MAX_FRONT_LENGTH} characters`);
        return false;
      }
      if (back.length > MAX_BACK_LENGTH) {
        setError(`Back cannot be longer than ${MAX_BACK_LENGTH} characters`);
        return false;
      }
      return true;
    };
    if (!validate()) {
      return;
    }

    try {
      setIsSaving(true);
      setError(null);
      await onSave({ front, back, tagIds: [] });
      toast.success("Flashcard saved successfully");
      onClose();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to save flashcard";
      setError(message);
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  }, [front, back, onSave, onClose]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        handleSave();
      }
    },
    [onClose, handleSave],
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [isOpen, handleKeyDown]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edit Flashcard</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label htmlFor="front" className="text-sm font-medium">
              Front
            </label>
            <div className="relative">
              <Textarea
                id="front"
                value={front}
                onChange={(e) => setFront(e.target.value)}
                className="min-h-[100px] resize-none"
                disabled={isSaving}
                aria-describedby="front-counter"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    const backTextarea = document.getElementById("back");
                    backTextarea?.focus();
                  }
                }}
              />
              <div
                id="front-counter"
                className="absolute bottom-2 right-2 text-sm text-muted-foreground"
              >
                {front.length}/{MAX_FRONT_LENGTH}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="back" className="text-sm font-medium">
              Back
            </label>
            <div className="relative">
              <Textarea
                id="back"
                value={back}
                onChange={(e) => setBack(e.target.value)}
                className="min-h-[150px] resize-none"
                disabled={isSaving}
                aria-describedby="back-counter"
              />
              <div
                id="back-counter"
                className="absolute bottom-2 right-2 text-sm text-muted-foreground"
              >
                {back.length}/{MAX_BACK_LENGTH}
              </div>
            </div>
          </div>

          {error && (
            <Alert variant="destructive" role="alert">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
