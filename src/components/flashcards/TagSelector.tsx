import { useCallback, useState } from "react";
import { useTags, type TagOption } from "@/hooks/useTags";
import { Button } from "@/components/ui/button";
import { Loader2, X as XIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface TagSelectorProps {
  value: TagOption[];
  onChange: (value: TagOption[]) => void;
  disabled?: boolean;
}

/**
 * Very simple multi-select component for tags. Uses <select multiple> for now to avoid
 * bringing a heavier UI dependency. Can be swapped with a fancier Combobox later.
 */
export function TagSelector({ value, onChange, disabled }: TagSelectorProps) {
  const { options, createTag, fetchTags, loading } = useTags();
  const [search, setSearch] = useState("");
  const [newTagName, setNewTagName] = useState("");

  const handleSelectionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const ids = Array.from(e.target.selectedOptions).map((o) => o.value);
    const selected = options.filter((opt) => ids.includes(opt.id));
    onChange(selected);
  };

  const handleCreateTag = useCallback(async () => {
    if (!newTagName.trim()) return;
    const tag = await createTag(newTagName.trim());
    setNewTagName("");
    onChange([...value, tag]);
  }, [createTag, newTagName, onChange, value]);

  return (
    <div className="space-y-2">
      {/* Selected tag chips */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {value.map((tag) => (
            <span
              key={tag.id}
              className="flex items-center gap-1 bg-secondary text-secondary-foreground px-2 py-1 rounded text-sm"
            >
              {tag.name}
              <XIcon
                className="h-3 w-3 cursor-pointer hover:text-destructive"
                onClick={() => onChange(value.filter((t) => t.id !== tag.id))}
              />
            </span>
          ))}
        </div>
      )}
      <input
        type="text"
        placeholder="Szukaj..."
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          fetchTags(e.target.value);
        }}
        disabled={disabled}
        className="w-full border rounded px-2 py-1 mb-2"
      />
      <select
        multiple
        value={value.map((v) => v.id)}
        onChange={handleSelectionChange}
        disabled={disabled}
        size={10}
        className={cn("w-full border rounded p-2", disabled && "opacity-50")}
      >
        {options.map((opt) => (
          <option key={opt.id} value={opt.id}>
            {opt.name}
          </option>
        ))}
      </select>
      {disabled ? null : loading ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
          <Loader2 className="h-4 w-4 animate-spin" />
          Ładowanie tagów...
        </div>
      ) : null}
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Nowy tag"
          value={newTagName}
          onChange={(e) => setNewTagName(e.target.value)}
          disabled={disabled}
          className="flex-1 border rounded px-2 py-1"
        />
        <Button type="button" onClick={handleCreateTag} disabled={disabled || !newTagName.trim()}>
          Dodaj
        </Button>
      </div>
    </div>
  );
}
