import { useCallback, useState } from "react";
import { useTags, type TagOption } from "@/hooks/useTags";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MultiSelect } from "@/components/ui/multi-select";

interface TagSelectorProps {
  value: TagOption[];
  onChange: (value: TagOption[]) => void;
  disabled?: boolean;
  chooseOnly?: boolean;
}

export function TagSelector({ value, onChange, disabled, chooseOnly = false }: TagSelectorProps) {
  const { options, createTag, fetchTags } = useTags();
  const [newTagName, setNewTagName] = useState("");

  const handleCreateTag = useCallback(async () => {
    if (!newTagName.trim()) return;
    const tag = await createTag(newTagName.trim());
    setNewTagName("");
    onChange([...value, tag]);
  }, [createTag, newTagName, onChange, value]);

  const handleSelectionChange = (selectedIds: string[]) => {
    const selected = options.filter((opt) => selectedIds.includes(opt.id));
    onChange(selected);
  };

  const handleSearch = (query: string) => {
    fetchTags(query);
  };

  return (
    <div className="space-y-2">
      <MultiSelect
        options={options.map((o) => ({ label: o.name, value: o.id }))}
        onValueChange={handleSelectionChange}
        value={value.map((v) => v.id)}
        placeholder="Wybierz tagi..."
        onSearch={handleSearch}
        disabled={disabled}
        className="w-full"
      />
      {!chooseOnly && (
        <div className="flex gap-2">
          <Input
            type="text"
            placeholder="Nowy tag"
            value={newTagName}
            onChange={(e) => setNewTagName(e.target.value)}
            disabled={disabled}
            className="flex-1"
          />
          <Button type="button" onClick={handleCreateTag} disabled={disabled || !newTagName.trim()}>
            Dodaj
          </Button>
        </div>
      )}
    </div>
  );
}
