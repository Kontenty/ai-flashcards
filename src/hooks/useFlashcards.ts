import { useState, useEffect, useCallback } from "react";
import type { FlashcardListItemDto, PaginationDto } from "@/types";

export interface FilterState {
  page: number;
  pageSize: number;
  tags: string[];
  search: string;
}

export function useFlashcards(initialFilter: FilterState) {
  const [filter, setFilter] = useState<FilterState>(initialFilter);
  const [items, setItems] = useState<FlashcardListItemDto[]>([]);
  const [pagination, setPagination] = useState<PaginationDto>({
    page: initialFilter.page,
    pageSize: initialFilter.pageSize,
    total: 0,
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.append("page", filter.page.toString());
      params.append("pageSize", filter.pageSize.toString());
      if (filter.search) params.append("search", filter.search);
      filter.tags.forEach((tag) => params.append("tags", tag));
      const res = await fetch(`/api/flashcards?${params.toString()}`);
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.message || res.statusText);
      }
      const data: { items: FlashcardListItemDto[]; pagination: PaginationDto } = await res.json();
      setItems(data.items);
      setPagination(data.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const reload = () => {
    fetchData();
  };

  return { items, pagination, loading, error, reload, filter, setFilter };
}
