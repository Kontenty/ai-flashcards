import React, { useState } from "react";
import { toast } from "sonner";
import type { CreateFlashcardCommand, FlashcardListItemDto } from "@/types";
import { useFlashcards } from "@/hooks/useFlashcards";
import type { FilterState } from "@/hooks/useFlashcards";
import { useTags } from "@/hooks/useTags";
import SearchBar from "./SearchBar";
import TagFilter from "./TagFilter";
import StatsOverview from "./StatsOverview";
import type { TagStatisticDto } from "@/types";
import FlashcardTable from "./FlashcardTable";
import PaginationControls from "./PaginationControls";
import { EditCardModal } from "./EditCardModal";
import DeleteConfirmDialog from "./DeleteConfirmDialog";
import { getStringField } from "@/lib/utils";

const ListFlashcardsView: React.FC = () => {
  // Initial filter state
  const initialFilter: FilterState = { page: 1, pageSize: 10, tags: [], search: "" };
  const { items, pagination, filter, setFilter, reload } = useFlashcards(initialFilter);
  const { options: tagOptions, createTag } = useTags();

  // Modal and deletion state
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedFlashcard, setSelectedFlashcard] = useState<FlashcardListItemDto | undefined>(
    undefined,
  );
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
      const data = (await res.json()) as FlashcardListItemDto;
      setSelectedFlashcard(data);
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

  const handleEditSave = async ({ front, back, tagIds }: CreateFlashcardCommand) => {
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
        // Compute tag usage counts
        const tagCountMap = new Map<string, { tagName: string; cardCount: number }>();
        items.forEach((item) => {
          item.tags.forEach((tag) => {
            const entry = tagCountMap.get(tag.id);
            if (entry) {
              entry.cardCount += 1;
            } else {
              tagCountMap.set(tag.id, { tagName: tag.name, cardCount: 1 });
            }
          });
        });
        const tagStats: TagStatisticDto[] = Array.from(tagCountMap.entries()).map(
          ([tagId, { tagName, cardCount }]) => ({ tagId, tagName, cardCount }),
        );
        return <StatsOverview cardsCount={pagination.totalItems} tagStats={tagStats} />;
      })()}
      <FlashcardTable items={items} onEdit={handleEdit} onDelete={handleDelete} />
      <PaginationControls pagination={pagination} onPageChange={handlePageChange} />
      <EditCardModal
        isOpen={isEditOpen}
        card={
          selectedFlashcard ?? {
            id: "",
            front: "",
            back: "",
            tags: [],
            next_review_date: new Date().toISOString(),
            ease_factor: 2.5,
            interval: 1,
          }
        }
        onSave={handleEditSave}
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
