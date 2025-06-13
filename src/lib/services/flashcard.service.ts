import type { SupabaseClient } from "@supabase/supabase-js";
import type { CreateFlashcardCommand, FlashcardDetailDto } from "@/types";
import type { Database } from "@/db/database.types";
import { Result } from "@/lib/utils/result";

interface TagWithName {
  tag: {
    id: string;
    name: string;
  };
}

interface FlashcardWithTags {
  id: string;
  front: string;
  back: string;
  created_at: string;
  updated_at: string;
  tags: TagWithName[];
}

export function createFlashcardService(supabase: SupabaseClient<Database>) {
  return {
    async createFlashcard(
      data: CreateFlashcardCommand,
    ): Promise<Result<FlashcardDetailDto, string>> {
      try {
        // Get the current user's ID
        /* const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          return Result.error("User not authenticated");
        } */
        // TODO: Remove this once authentication is implemented
        const user = {
          id: import.meta.env.USER_ID,
        };

        // Start a transaction
        const { data: flashcard, error: flashcardError } = await supabase
          .from("flashcards")
          .insert({
            front: data.front,
            back: data.back,
            user_id: user.id,
          })
          .select()
          .single();

        if (flashcardError) {
          return Result.error("Failed to create flashcard: " + flashcardError.message);
        }

        // Create tag associations
        if (data.tagIds.length > 0) {
          const { error: tagError } = await supabase.from("flashcard_tags").insert(
            data.tagIds.map((tagId) => ({
              flashcard_id: flashcard.id,
              tag_id: tagId,
            })),
          );

          if (tagError) {
            return Result.error("Failed to create tag associations: " + tagError.message);
          }
        }

        // Fetch the created flashcard with tags
        const { data: createdFlashcard, error: fetchError } = await supabase
          .from("flashcards")
          .select(
            `
            id,
            front,
            back,
            created_at,
            updated_at,
            tags:flashcard_tags(
              tag:tags(
                id,
                name
              )
            )
          `,
          )
          .eq("id", flashcard.id)
          .single();

        if (fetchError) {
          return Result.error("Failed to fetch created flashcard: " + fetchError.message);
        }

        // Transform the response to match FlashcardDetailDto
        const flashcardWithTags = createdFlashcard as unknown as FlashcardWithTags;
        const flashcardDto: FlashcardDetailDto = {
          id: flashcardWithTags.id,
          front: flashcardWithTags.front,
          back: flashcardWithTags.back,
          created_at: flashcardWithTags.created_at,
          updated_at: flashcardWithTags.updated_at,
          tags: flashcardWithTags.tags.map((t) => t.tag.name),
        };

        return Result.ok(flashcardDto);
      } catch (error) {
        return Result.error(error instanceof Error ? error.message : "Unknown error occurred");
      }
    },

    async createFlashcards(
      data: CreateFlashcardCommand[],
    ): Promise<Result<FlashcardDetailDto[], string>> {
      try {
        // Get the current user's ID
        const user = {
          id: import.meta.env.USER_ID,
        };

        // Create all flashcards
        const { data: flashcards, error: flashcardError } = await supabase
          .from("flashcards")
          .insert(
            data.map((card) => ({
              front: card.front,
              back: card.back,
              user_id: user.id,
            })),
          )
          .select();

        if (flashcardError) {
          return Result.error("Failed to create flashcards: " + flashcardError.message);
        }

        // Create tag associations for all flashcards
        const tagAssociations = flashcards.flatMap((flashcard, index) =>
          data[index].tagIds.map((tagId) => ({
            flashcard_id: flashcard.id,
            tag_id: tagId,
          })),
        );

        if (tagAssociations.length > 0) {
          const { error: tagError } = await supabase.from("flashcard_tags").insert(tagAssociations);

          if (tagError) {
            return Result.error("Failed to create tag associations: " + tagError.message);
          }
        }

        // Fetch all created flashcards with tags
        const { data: createdFlashcards, error: fetchError } = await supabase
          .from("flashcards")
          .select(
            `
            id,
            front,
            back,
            created_at,
            updated_at,
            tags:flashcard_tags(
              tag:tags(
                id,
                name
              )
            )
          `,
          )
          .in(
            "id",
            flashcards.map((f) => f.id),
          );

        if (fetchError) {
          return Result.error("Failed to fetch created flashcards: " + fetchError.message);
        }

        // Transform the response to match FlashcardDetailDto[]
        const flashcardsWithTags = createdFlashcards as unknown as FlashcardWithTags[];
        const flashcardDtos: FlashcardDetailDto[] = flashcardsWithTags.map((flashcard) => ({
          id: flashcard.id,
          front: flashcard.front,
          back: flashcard.back,
          created_at: flashcard.created_at,
          updated_at: flashcard.updated_at,
          tags: flashcard.tags.map((t) => t.tag.name),
        }));

        return Result.ok(flashcardDtos);
      } catch (error) {
        return Result.error(error instanceof Error ? error.message : "Unknown error occurred");
      }
    },
  };
}
