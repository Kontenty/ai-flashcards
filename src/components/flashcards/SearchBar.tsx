import React, { useState, useEffect, useRef } from "react";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ value, onChange }) => {
  const [inputValue, setInputValue] = useState(value);
  const timerRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.slice(0, 100);
    setInputValue(val);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    timerRef.current = window.setTimeout(() => {
      onChange(val);
    }, 300);
  };

  return (
    <div>
      <input
        type="text"
        value={inputValue}
        onChange={handleChange}
        maxLength={100}
        className="w-full border rounded px-2 py-1"
        placeholder="Search flashcards..."
        aria-label="Search flashcards"
      />
    </div>
  );
};

export default SearchBar;
