import { useCallback, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface CreateFlashcardModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

import { useFlashcardCreate } from "@/hooks/useFlashcardCreate";
import { FlashcardCreationForm } from "./FlashcardCreationForm";
import type { FlashcardCreationFormHandle } from "./FlashcardCreationForm";

// Modal for manual flashcard creation.
export function CreateFlashcardModal({
  open,
  onClose,
  onCreated,
}: Readonly<CreateFlashcardModalProps>) {
  const { create, loading } = useFlashcardCreate();
  const formRef = useRef<FlashcardCreationFormHandle>(null);

  const handleSave = useCallback(async () => {
    if (!formRef.current) return;
    try {
      await formRef.current.submit();
    } catch {
      /* errors handled inside form/hook */
    }
  }, []);

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
    if (open) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [open, handleKeyDown]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Nowa fiszka</DialogTitle>
        </DialogHeader>

        <FlashcardCreationForm
          ref={formRef}
          disabled={loading}
          onSubmit={async (cmd) => {
            try {
              await create(cmd);
              toast.success("Utworzono fiszkę");
              onCreated();
              onClose();
            } catch (err) {
              const msg = err instanceof Error ? err.message : "Nie udało się zapisać fiszki";
              toast.error(msg);
            }
          }}
        />

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Anuluj
          </Button>
          <Button onClick={handleSave}>Zapisz</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
