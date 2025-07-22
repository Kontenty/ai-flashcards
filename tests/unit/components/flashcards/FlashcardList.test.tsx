import React from "react";
import { render, screen, fireEvent, waitFor, within } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { FlashcardList } from "@/components/flashcards/FlashcardList";
import type { SuggestionDto } from "@/types";
import { toast } from "sonner";

// Mock toast methods
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe("FlashcardList", () => {
  const suggestions: SuggestionDto[] = [
    { front: "Question 1", back: "Answer 1" },
    { front: "Question 2", back: "Answer 2" },
  ];
  let onEdit: ReturnType<typeof vi.fn>;
  let onReject: ReturnType<typeof vi.fn>;
  let onBulkSaveSuccess: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    onEdit = vi.fn();
    onReject = vi.fn();
    onBulkSaveSuccess = vi.fn();
    vi.clearAllMocks();
  });

  it("displays empty state when no suggestions", () => {
    render(
      <FlashcardList
        suggestions={[]}
        onEdit={onEdit}
        onReject={onReject}
        onBulkSaveSuccess={onBulkSaveSuccess}
      />,
    );
    expect(
      screen.getByText(
        /No flashcards generated yet\. Enter some text and click "Generate Flashcards" to get started\./i,
      ),
    ).toBeInTheDocument();
  });

  it("calls onEdit with correct index when Edit button is clicked", () => {
    render(
      <FlashcardList
        suggestions={suggestions}
        onEdit={onEdit}
        onReject={onReject}
        onBulkSaveSuccess={onBulkSaveSuccess}
      />,
    );
    const editButtons = screen.getAllByRole("button", { name: /edit/i });
    fireEvent.click(editButtons[1]);
    expect(onEdit).toHaveBeenCalledWith(1);
  });

  it("opens and confirms reject dialog, then calls onReject and shows toast", async () => {
    render(
      <FlashcardList
        suggestions={suggestions}
        onEdit={onEdit}
        onReject={onReject}
        onBulkSaveSuccess={onBulkSaveSuccess}
      />,
    );
    const rejectButtons = screen.getAllByRole("button", { name: /reject/i });
    fireEvent.click(rejectButtons[0]);
    // Confirm dialog opens
    const dialog = screen.getByRole("alertdialog");
    expect(within(dialog).getByText(/Reject Flashcard/i)).toBeInTheDocument();
    const confirmBtn = within(dialog).getByRole("button", { name: /reject/i });
    fireEvent.click(confirmBtn);
    await waitFor(() => {
      expect(onReject).toHaveBeenCalledWith(0);
      expect(toast.success).toHaveBeenCalledWith("Flashcard rejected");
    });
  });

  it("handles bulk save success: calls fetch, clears suggestions, and shows success toast", async () => {
    // Mock fetch response
    vi.stubGlobal(
      "fetch",
      vi.fn(() => Promise.resolve({ ok: true } as Response)),
    );

    render(
      <FlashcardList
        suggestions={suggestions}
        onEdit={onEdit}
        onReject={onReject}
        onBulkSaveSuccess={onBulkSaveSuccess}
      />,
    );
    // Open bulk save confirmation
    const saveAllBtn = screen.getByRole("button", { name: /save all/i });
    fireEvent.click(saveAllBtn);
    const dialog = screen.getByRole("alertdialog");
    const confirmSave = within(dialog).getByRole("button", { name: /save all/i });
    fireEvent.click(confirmSave);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/flashcards",
        expect.objectContaining({
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify([
            { front: "Question 1", back: "Answer 1", tagIds: [] },
            { front: "Question 2", back: "Answer 2", tagIds: [] },
          ]),
        }),
      );
      // Optimistic clears call onReject for each index
      expect(onReject).toHaveBeenCalledTimes(2);
      expect(toast.success).toHaveBeenCalledWith("Saved 2 flashcards successfully");
      expect(onBulkSaveSuccess).toHaveBeenCalledTimes(1);
    });
  });

  it("handles bulk save error: shows error message and toast", async () => {
    // Mock fetch failure
    vi.stubGlobal(
      "fetch",
      vi.fn(() =>
        Promise.resolve({
          ok: false,
          json: () => Promise.resolve({ message: "Failed to save" }),
        } as unknown as Response),
      ),
    );

    render(
      <FlashcardList
        suggestions={suggestions}
        onEdit={onEdit}
        onReject={onReject}
        onBulkSaveSuccess={onBulkSaveSuccess}
      />,
    );
    // Open bulk save confirmation
    const saveAllBtn = screen.getByRole("button", { name: /save all/i });
    fireEvent.click(saveAllBtn);
    const dialog = screen.getByRole("alertdialog");
    const confirmSave = within(dialog).getByRole("button", { name: /save all/i });
    fireEvent.click(confirmSave);

    // Verify error handling
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Failed to save");
      expect(screen.getByText("Failed to save")).toBeInTheDocument();
    });
  });
});
