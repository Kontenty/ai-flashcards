import { useState } from "react";
import { TextInputSection } from "./TextInputSection";
import { FlashcardList } from "./FlashcardList";
import { EditCardModal } from "./EditCardModal";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import type {
  GenerateFlashcardsRequestDto,
  GenerateFlashcardsResponseDto,
  SuggestionDto,
  CreateFlashcardCommand,
} from "@/types";
import { getStringField } from "@/lib/utils";
import { TagSelector } from "./TagSelector";
import type { TagOption } from "@/hooks/useTags";

const initialEditCardState = {
  isOpen: false,
  cardIndex: -1,
};
type EditCard = typeof initialEditCardState;
type GenerationStatus = "idle" | "pending" | "success" | "error";

export function GenerateFlashcardsView() {
  const [text, setText] = useState("");
  const [status, setStatus] = useState<GenerationStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<SuggestionDto[]>([]);
  const [editCard, setEditCard] = useState<EditCard>(initialEditCardState);
  const [tags, setTags] = useState<TagOption[]>([]);

  const handleGenerate = async (text: string) => {
    setStatus("pending");
    setErrorMessage(null);

    try {
      const response = await fetch("/api/flashcards/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text } as GenerateFlashcardsRequestDto),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(getStringField(errorData, "message", "Failed to generate flashcards"));
      }

      const data: GenerateFlashcardsResponseDto = await response.json();
      setSuggestions(data.suggestions);
      toast.success(`Generated ${data.suggestions.length} flashcards`);
      setStatus("success");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "An error occurred while generating flashcards";
      setErrorMessage(message);
      setStatus("error");
      toast.error(message);
    }
  };

  const handleEdit = (index: number) => {
    setEditCard({ isOpen: true, cardIndex: index });
  };

  const handleEditSave = async (card: CreateFlashcardCommand) => {
    const originalSuggestions = [...suggestions];
    const cardIndex = editCard.cardIndex;
    originalSuggestions[cardIndex] = { ...originalSuggestions[cardIndex], ...card };
    setSuggestions(originalSuggestions);
    setEditCard(initialEditCardState);
  };

  return (
    <div className="space-y-8">
      <TextInputSection
        text={text}
        onTextChange={setText}
        onGenerate={handleGenerate}
        isGenerating={status === "pending"}
        error={errorMessage}
      />

      {status === "pending" && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      )}

      {status === "success" && (
        <>
          <div className="flex flex-col gap-2 mx-32">
            <h3 className="text-lg font-semibold">Tagi</h3>
            <TagSelector value={tags} onChange={setTags} />
          </div>
          <FlashcardList
            suggestions={suggestions}
            onEdit={handleEdit}
            onReject={(index) => {
              setSuggestions((prev) => prev.filter((_, i) => i !== index));
              toast.success("Flashcard rejected");
            }}
            onBulkSaveSuccess={() => {
              window.location.href = "/flashcards";
            }}
            tagIds={tags.map((t) => t.id)}
          />
        </>
      )}

      {status === "error" && errorMessage && (
        <Alert variant="destructive" role="alert">
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}

      {editCard.isOpen && editCard.cardIndex >= 0 && (
        <EditCardModal
          isOpen={editCard.isOpen}
          card={suggestions[editCard.cardIndex]}
          onSave={handleEditSave}
          onClose={() => setEditCard({ isOpen: false, cardIndex: -1 })}
        />
      )}
    </div>
  );
}
