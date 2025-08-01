import React, { forwardRef, useCallback, useImperativeHandle, useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { TagSelector } from "./TagSelector";
import { cn } from "@/lib/utils";
import { MAX_BACK_LENGTH, MAX_FRONT_LENGTH } from "@/constants";
import type { CreateFlashcardCommand } from "@/types";
import type { TagOption } from "@/hooks/useTags";

export interface FlashcardCreationFormState {
  front: string;
  back: string;
  selectedTags: TagOption[];
}

export interface FlashcardCreationFormHandle {
  submit: () => void;
}

interface FlashcardCreationFormProps {
  disabled: boolean;
  onSubmit: (cmd: CreateFlashcardCommand) => Promise<void>;
}

const BaseForm = (
  { disabled, onSubmit }: FlashcardCreationFormProps,
  ref: React.Ref<FlashcardCreationFormHandle>,
) => {
  const [state, setState] = useState<FlashcardCreationFormState>({
    front: "",
    back: "",
    selectedTags: [],
  });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const validate = useCallback((): string | null => {
    if (!state.front.trim()) return "Pole Front jest wymagane";
    if (!state.back.trim()) return "Pole Back jest wymagane";
    if (state.front.length > MAX_FRONT_LENGTH)
      return `Front nie może przekraczać ${MAX_FRONT_LENGTH} znaków`;
    if (state.back.length > MAX_BACK_LENGTH)
      return `Back nie może przekraczać ${MAX_BACK_LENGTH} znaków`;
    return null;
  }, [state]);

  const handleSubmitInternal = useCallback(async () => {
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      await onSubmit({
        front: state.front.trim(),
        back: state.back.trim(),
        tagIds: state.selectedTags.map((t) => t.id),
      });
    } finally {
      setSubmitting(false);
    }
  }, [state, validate, onSubmit]);

  useImperativeHandle(
    ref,
    () => ({
      submit: handleSubmitInternal,
    }),
    [handleSubmitInternal],
  );

  const disabledAll = disabled || submitting;

  return (
    <div className="space-y-4 py-4">
      <div className="space-y-2">
        <label htmlFor="front" className="text-sm font-medium">
          Front
        </label>
        <div className="relative">
          <Textarea
            id="front"
            value={state.front}
            onChange={(e) => setState({ ...state, front: e.target.value })}
            onInput={(e) => {
              const el = e.currentTarget;
              el.style.height = "auto";
              el.style.height = el.scrollHeight + "px";
            }}
            className="min-h-[200px] resize-none"
            disabled={disabledAll}
            aria-describedby="front-counter"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                const backTextarea = document.getElementById("back");
                backTextarea?.focus();
              } else if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
                e.preventDefault();
                handleSubmitInternal();
              }
            }}
          />
          <div
            id="front-counter"
            className={cn(
              "absolute bottom-2 right-2 text-sm",
              state.front.length > MAX_FRONT_LENGTH
                ? "text-destructive"
                : state.front.length > MAX_FRONT_LENGTH * 0.8
                ? "text-orange-500"
                : "text-muted-foreground",
            )}
          >
            {state.front.length}/{MAX_FRONT_LENGTH}
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
            value={state.back}
            onChange={(e) => setState({ ...state, back: e.target.value })}
            onInput={(e) => {
              const el = e.currentTarget;
              el.style.height = "auto";
              el.style.height = el.scrollHeight + "px";
            }}
            className="min-h-[150px] resize-none"
            disabled={disabledAll}
            aria-describedby="back-counter"
            onKeyDown={(e) => {
              if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
                e.preventDefault();
                handleSubmitInternal();
              }
            }}
          />
          <div
            id="back-counter"
            className={cn(
              "absolute bottom-2 right-2 text-sm",
              state.back.length > MAX_BACK_LENGTH
                ? "text-destructive"
                : state.back.length > MAX_BACK_LENGTH * 0.8
                ? "text-orange-500"
                : "text-muted-foreground",
            )}
          >
            {state.back.length}/{MAX_BACK_LENGTH}
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <span className="text-sm font-medium">Tagi (opcjonalnie)</span>
        <TagSelector
          value={state.selectedTags}
          onChange={(tags) => setState({ ...state, selectedTags: tags })}
          disabled={disabledAll}
        />
      </div>

      {error && (
        <Alert variant="destructive" role="alert">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Fallback button for accessibility when footer button missing */}
      <div className="sm:hidden">
        <Button onClick={handleSubmitInternal} disabled={disabledAll} className="w-full">
          {disabledAll ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Zapisz"}
        </Button>
      </div>
    </div>
  );
};

export const FlashcardCreationForm = forwardRef(BaseForm);
