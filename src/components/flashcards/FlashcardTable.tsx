import React, { useState } from "react";
import type { FlashcardListItemDto } from "@/types";

interface FlashcardTableProps {
  items: FlashcardListItemDto[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

const FlashcardTable: React.FC<FlashcardTableProps> = ({ items, onEdit, onDelete }) => {
  const [expandedIds, setExpandedIds] = useState<string[]>([]);
  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  };
  return (
    <table className="w-full table-auto border-collapse">
      <thead>
        <tr>
          <th className="border px-2 py-1"></th>
          <th className="border px-2 py-1">Front</th>
          <th className="border px-2 py-1">Back</th>
          <th className="border px-2 py-1">Tags</th>
          <th className="border px-2 py-1">Actions</th>
        </tr>
      </thead>
      <tbody>
        {items.map((item) => {
          const isExpanded = expandedIds.includes(item.id);
          const truncatedFront =
            item.front.length > 50 ? item.front.slice(0, 50) + "..." : item.front;
          const truncatedBack = item.back.length > 50 ? item.back.slice(0, 50) + "..." : item.back;
          return (
            <React.Fragment key={item.id}>
              <tr>
                <td className="border px-2 py-1 text-center">
                  <button onClick={() => toggleExpand(item.id)}>{isExpanded ? "-" : "+"}</button>
                </td>
                <td className="border px-2 py-1">{truncatedFront}</td>
                <td className="border px-2 py-1">{truncatedBack}</td>
                <td className="border px-2 py-1">{item.tags.join(", ")}</td>
                <td className="border px-2 py-1 space-x-2">
                  <button onClick={() => onEdit(item.id)} className="text-blue-600">
                    Edit
                  </button>
                  <button onClick={() => onDelete(item.id)} className="text-red-600">
                    Delete
                  </button>
                </td>
              </tr>
              {isExpanded && (
                <tr>
                  <td colSpan={5} className="border px-2 py-2 bg-gray-50">
                    <div className="mb-2">
                      <strong>Front:</strong> {item.front}
                    </div>
                    <div>
                      <strong>Back:</strong> {item.back}
                    </div>
                  </td>
                </tr>
              )}
            </React.Fragment>
          );
        })}
      </tbody>
    </table>
  );
};

export default FlashcardTable;
