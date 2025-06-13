import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { MAX_TEXT_LENGTH, MIN_TEXT_LENGTH } from "@/constants";

interface TextInputSectionProps {
  text: string;
  onTextChange: (text: string) => void;
  onGenerate: (text: string) => Promise<void>;
  isGenerating: boolean;
  error: string | null;
}

export function TextInputSection({
  text,
  onTextChange,
  onGenerate,
  isGenerating,
  error,
}: Readonly<TextInputSectionProps>) {
  const [progress, setProgress] = useState(0);
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    setProgress((text.length / MAX_TEXT_LENGTH) * 100);
  }, [text]);

  const validate = (): boolean => {
    if (text.trim().length === 0) {
      setLocalError("Please enter some text to generate flashcards");
      return false;
    }
    if (text.length < MIN_TEXT_LENGTH) {
      setLocalError(`Text cannot be shorter than ${MIN_TEXT_LENGTH} characters`);
      return false;
    }

    if (text.length > MAX_TEXT_LENGTH) {
      setLocalError(`Text cannot be longer than ${MAX_TEXT_LENGTH} characters`);
      return false;
    }
    setLocalError(null);
    return true;
  };

  const handleGenerate = async () => {
    if (!validate()) {
      return;
    }

    try {
      await onGenerate(text);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "An error occurred while generating flashcards";
      toast.error(message);
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    if (newText.length <= MAX_TEXT_LENGTH) {
      onTextChange(newText);
      setLocalError(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <Textarea
          value={text}
          onChange={handleTextChange}
          placeholder="Enter your text here..."
          className="min-h-[200px] max-h-[400px] resize-none"
          disabled={isGenerating}
          aria-describedby="text-counter"
        />
        <div id="text-counter" className="absolute bottom-2 right-2 text-sm text-muted-foreground">
          {text.length}/{MAX_TEXT_LENGTH}
        </div>
      </div>

      <Progress value={progress} className="h-2" />

      {(error || localError) && (
        <Alert variant="destructive" role="alert">
          <AlertDescription>{error ?? localError}</AlertDescription>
        </Alert>
      )}

      <Button
        onClick={handleGenerate}
        disabled={isGenerating || text.trim().length === 0 || text.trim().length > MAX_TEXT_LENGTH}
        className="w-full"
      >
        {isGenerating ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Generating...
          </>
        ) : (
          "Generate Flashcards"
        )}
      </Button>
    </div>
  );
}
