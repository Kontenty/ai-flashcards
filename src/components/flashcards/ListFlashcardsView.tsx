import React, { useState } from "react";
import { toast } from "sonner";
import type { CreateFlashcardCommand } from "@/types";
import { useFlashcards } from "@/hooks/useFlashcards";
import type { FilterState } from "@/hooks/useFlashcards";
import { useTags } from "@/hooks/useTags";
import SearchBar from "./SearchBar";
import TagFilter from "./TagFilter";
import StatsOverview from "./StatsOverview";
import FlashcardTable from "./FlashcardTable";
import PaginationControls from "./PaginationControls";
import { EditCardModal } from "./EditCardModal";
import DeleteConfirmDialog from "./DeleteConfirmDialog";
import { getStringField } from "@/lib/utils";

const ListFlashcardsView: React.FC = () => {
  // Initial filter state
  const initialFilter: FilterState = { page: 1, pageSize: 20, tags: [], search: "" };
  const { items, pagination, filter, setFilter, reload } = useFlashcards(initialFilter);
  const { options: tagOptions, createTag } = useTags();

  // Modal and deletion state
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedFlashcard, setSelectedFlashcard] = useState<
    (CreateFlashcardCommand & { id?: string }) | undefined
  >(undefined);
  const [toDeleteId, setToDeleteId] = useState<string | null>(null);

  // Handlers
  const handleSearchChange = (value: string) => {
    setFilter({ ...filter, search: value, page: 1 });
  };

  const handleTagChange = (tagIds: string[]) => {
    setFilter({ ...filter, tags: tagIds, page: 1 });
  };

  const handleTagCreate = async (name: string) => {
    const newTag = await createTag(name);
    setFilter({ ...filter, tags: [...filter.tags, newTag.id] });
  };

  const handleEdit = async (id: string) => {
    try {
      const res = await fetch(`/api/flashcards/${id}`);
      if (!res.ok) {
        const json = await res.json();
        throw new Error(getStringField(json, "message", res.statusText));
      }
      const data = (await res.json()) as { front: string; back: string };
      setSelectedFlashcard({ id, front: data.front, back: data.back, tagIds: [] });
      setIsEditOpen(true);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : String(err));
    }
  };

  const handleDelete = (id: string) => {
    setToDeleteId(id);
  };

  const handlePageChange = (newPage: number) => {
    setFilter({ ...filter, page: newPage });
  };

  const closeEditModal = () => {
    setIsEditOpen(false);
    setSelectedFlashcard(undefined);
  };

  const handleConfirmDelete = async () => {
    if (!toDeleteId) return;
    try {
      const res = await fetch(`/api/flashcards/${toDeleteId}`, { method: "DELETE" });
      if (!res.ok) {
        const json = await res.json();
        throw new Error(getStringField(json, "message", res.statusText));
      }
      toast.success("Flashcard deleted successfully");
      reload();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : String(err));
    } finally {
      setToDeleteId(null);
    }
  };

  return (
    <div className="space-y-6">
      <SearchBar value={filter.search} onChange={handleSearchChange} />
      <TagFilter
        selected={filter.tags}
        options={tagOptions}
        onChange={handleTagChange}
        onCreate={handleTagCreate}
      />
      {/* Compute overview stats */}
      {(() => {
        const totalReviewed = pagination.total;
        const correctPercent = 0; // Placeholder until review data available
        // Compute tag usage counts
        const tagCountMap: Record<string, number> = {};
        items.forEach((item) => {
          item.tags.forEach((tag) => {
            tagCountMap[tag] = (tagCountMap[tag] || 0) + 1;
          });
        });
        const tagStats = Object.entries(tagCountMap).map(([tag, count]) => ({ tag, count }));
        return <StatsOverview stats={{ totalReviewed, correctPercent }} tagStats={tagStats} />;
      })()}
      <FlashcardTable items={items} onEdit={handleEdit} onDelete={handleDelete} />
      <PaginationControls pagination={pagination} onPageChange={handlePageChange} />
      <EditCardModal
        isOpen={isEditOpen}
        card={
          selectedFlashcard
            ? { front: selectedFlashcard.front, back: selectedFlashcard.back }
            : { front: "", back: "" }
        }
        onSave={async ({ front, back, tagIds }) => {
          try {
            const method = selectedFlashcard?.id ? "PUT" : "POST";
            const url = selectedFlashcard?.id
              ? `/api/flashcards/${selectedFlashcard.id}`
              : "/api/flashcards";
            const res = await fetch(url, {
              method,
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ front, back, tagIds }),
            });
            if (!res.ok) {
              const json = await res.json();
              throw new Error(getStringField(json, "message", res.statusText));
            }
            toast.success("Flashcard saved successfully");
            reload();
            closeEditModal();
          } catch (err) {
            const msg = err instanceof Error ? err.message : String(err);
            toast.error(msg);
            throw err;
          }
        }}
        onClose={closeEditModal}
      />
      <DeleteConfirmDialog
        isOpen={Boolean(toDeleteId)}
        onConfirm={handleConfirmDelete}
        onCancel={() => setToDeleteId(null)}
      />
    </div>
  );
};

export default ListFlashcardsView;
