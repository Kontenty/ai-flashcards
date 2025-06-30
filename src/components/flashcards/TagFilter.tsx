import React, { useState, useRef, useEffect } from "react";
import type { TagOption } from "@/hooks/useTags";

interface TagFilterProps {
  selected: string[];
  options: TagOption[];
  onChange: (ids: string[]) => void;
  onCreate: (name: string) => void;
}

const TagFilter: React.FC<TagFilterProps> = ({ selected, options, onChange, onCreate }) => {
  const [inputValue, setInputValue] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filteredOptions = options.filter(
    (o) => o.name.toLowerCase().includes(inputValue.toLowerCase()) && !selected.includes(o.id),
  );

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && inputValue.trim()) {
      e.preventDefault();
      const match = options.find((o) => o.name.toLowerCase() === inputValue.toLowerCase());
      if (match) {
        onChange([...selected, match.id]);
      } else {
        onCreate(inputValue.trim());
      }
      setInputValue("");
      setShowDropdown(false);
    }
  };

  return (
    <div ref={containerRef} className="relative flex flex-wrap gap-2">
      {selected.map((id) => {
        const tag = options.find((o) => o.id === id);
        if (!tag) return null;
        return (
          <span key={id} className="flex items-center bg-blue-500 text-white rounded px-2 py-1">
            {tag.name}
            <button
              type="button"
              onClick={() => onChange(selected.filter((i) => i !== id))}
              className="ml-1"
            >
              ×
            </button>
          </span>
        );
      })}
      <input
        type="text"
        value={inputValue}
        onChange={(e) => {
          setInputValue(e.target.value);
          setShowDropdown(true);
        }}
        onFocus={() => setShowDropdown(true)}
        onKeyDown={handleInputKeyDown}
        placeholder="Filter or create tags..."
        className="flex-1 min-w-[150px] border rounded px-2 py-1"
      />
      {showDropdown && filteredOptions.length > 0 && (
        <ul className="absolute z-10 mt-1 max-h-48 w-full overflow-auto bg-white border rounded shadow">
          {filteredOptions.map((o) => (
            <li key={o.id}>
              <button
                type="button"
                onClick={() => {
                  onChange([...selected, o.id]);
                  setInputValue("");
                  setShowDropdown(false);
                }}
                className="w-full text-left px-2 py-1 hover:bg-gray-100"
              >
                {o.name}
              </button>
            </li>
          ))}
          {!filteredOptions.some((o) => o.name.toLowerCase() === inputValue.toLowerCase()) &&
            inputValue.trim() !== "" && (
              <li>
                <button
                  type="button"
                  onClick={() => {
                    onCreate(inputValue.trim());
                    setInputValue("");
                    setShowDropdown(false);
                  }}
                  className="w-full text-left px-2 py-1 font-medium text-green-600 hover:bg-gray-100"
                >
                  {`Create "${inputValue}"`}
                </button>
              </li>
            )}
        </ul>
      )}
    </div>
  );
};

export default TagFilter;
