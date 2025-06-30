import { useState, useEffect, useCallback } from "react";
import type { TagDto } from "@/types";

export interface TagOption {
  id: string;
  name: string;
}

export function useTags() {
  const [options, setOptions] = useState<TagOption[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTags = useCallback(async (search = "") => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      const res = await fetch(`/api/tags?${params.toString()}`);
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.message || res.statusText);
      }
      const data: TagDto[] = await res.json();
      setOptions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTags();
  }, [fetchTags]);

  const createTag = async (name: string): Promise<TagOption> => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/tags`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.message || res.statusText);
      }
      const newTag: TagDto = await res.json();
      const tagOption: TagOption = { id: newTag.id, name: newTag.name };
      setOptions((prev) => [...prev, tagOption]);
      return tagOption;
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateTag = async (id: string, name: string): Promise<TagOption> => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/tags/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.message || res.statusText);
      }
      const updatedTag: TagDto = await res.json();
      const tagOption: TagOption = { id: updatedTag.id, name: updatedTag.name };
      setOptions((prev) => prev.map((tag) => (tag.id === id ? tagOption : tag)));
      return tagOption;
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteTag = async (id: string): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/tags/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.message || res.statusText);
      }
      setOptions((prev) => prev.filter((tag) => tag.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { options, loading, error, fetchTags, createTag, updateTag, deleteTag };
}
