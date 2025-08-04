import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  CreateFlashcardCommand,
  FlashcardDetailDto,
  FlashcardListQueryDto,
  FlashcardListItemDto,
  FlashcardListResponseDto,
} from "@/types";
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

// For listing with next_review_date (non-nullable)
interface FlashcardListWithTags extends FlashcardWithTags {
  next_review_date: string;
}

export function createFlashcardService(supabase: SupabaseClient<Database>) {
  return {
    async createFlashcard(
      data: CreateFlashcardCommand,
    ): Promise<Result<FlashcardDetailDto, string>> {
      try {
        // Get the current user's ID
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          return Result.error("User not authenticated");
        }

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
          tags: flashcardWithTags.tags.map((t) => ({ id: t.tag.id, name: t.tag.name })),
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
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          return Result.error("User not authenticated");
        }

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
          tags: flashcard.tags.map((t) => ({ id: t.tag.id, name: t.tag.name })),
        }));

        return Result.ok(flashcardDtos);
      } catch (error) {
        return Result.error(error instanceof Error ? error.message : "Unknown error occurred");
      }
    },

    // List flashcards with pagination, tag filtering and full-text search
    async listFlashcards(
      query: FlashcardListQueryDto,
    ): Promise<Result<FlashcardListResponseDto, string>> {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          return Result.error("User not authenticated");
        }
        const page = query.page ?? 1;
        const pageSize = query.pageSize ?? 20;
        let builder = supabase
          .from("flashcards")
          .select(
            `
            id,
            front,
            back,
            next_review_date,
            tags:flashcard_tags(
              tag:tags(
                id,
                name
              )
            )
          `,
            { count: "exact" },
          )
          .eq("user_id", user.id);
        if (query.search) {
          builder = builder.textSearch("tsv", query.search);
        }
        if (query.tags && query.tags.length > 0) {
          builder = builder.in("flashcard_tags.tag_id", query.tags);
        }

        // Apply sorting if provided
        if (query.orderBy) {
          const [column, direction] = query.orderBy.split(":");
          builder = builder.order(column, { ascending: direction.toLowerCase() !== "desc" });
        }

        const from = (page - 1) * pageSize;
        const to = page * pageSize - 1;

        const { data: flashcards, count, error } = await builder.range(from, to);
        if (error) {
          return Result.error("Failed to list flashcards: " + error.message);
        }
        // Map to FlashcardListItemDto
        const list = flashcards as unknown as FlashcardListWithTags[];
        const items: FlashcardListItemDto[] = list.map((f) => ({
          id: f.id,
          front: f.front,
          back: f.back,
          next_review_date: f.next_review_date,
          tags: f.tags.map((t) => ({ id: t.tag.id, name: t.tag.name })),
        }));
        return Result.ok({
          items,
          pagination: {
            page,
            pageSize,
            totalItems: count ?? items.length,
            totalPages: Math.ceil((count ?? items.length) / pageSize),
          },
        });
      } catch (error) {
        return Result.error(error instanceof Error ? error.message : "Unknown error occurred");
      }
    },

    // Get a single flashcard by ID
    async getFlashcardById(id: string): Promise<Result<FlashcardDetailDto, string>> {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          return Result.error("User not authenticated");
        }
        const { data: flashcard, error } = await supabase
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
          .eq("id", id)
          .eq("user_id", user.id)
          .single();
        if (error) {
          return Result.error("Failed to fetch flashcard: " + error.message);
        }
        if (!flashcard) {
          return Result.error("Flashcard not found");
        }
        const f = flashcard as FlashcardWithTags;
        const dto: FlashcardDetailDto = {
          id: f.id,
          front: f.front,
          back: f.back,
          created_at: f.created_at,
          updated_at: f.updated_at,
          tags: f.tags.map((t) => ({ id: t.tag.id, name: t.tag.name })),
        };
        return Result.ok(dto);
      } catch (error) {
        return Result.error(error instanceof Error ? error.message : "Unknown error occurred");
      }
    },

    // Update a flashcard
    async updateFlashcard(
      id: string,
      data: CreateFlashcardCommand,
    ): Promise<Result<FlashcardDetailDto, string>> {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          return Result.error("User not authenticated");
        }
        const { error: updateError } = await supabase
          .from("flashcards")
          .update({ front: data.front, back: data.back })
          .eq("id", id)
          .eq("user_id", user.id);
        if (updateError) {
          return Result.error("Failed to update flashcard: " + updateError.message);
        }
        await supabase.from("flashcard_tags").delete().eq("flashcard_id", id);
        if (data.tagIds.length > 0) {
          const { error: tagError } = await supabase
            .from("flashcard_tags")
            .insert(data.tagIds.map((tagId) => ({ flashcard_id: id, tag_id: tagId })));
          if (tagError) {
            return Result.error("Failed to update tag associations: " + tagError.message);
          }
        }
        const { data: updatedFlashcard, error: fetchError } = await supabase
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
          .eq("id", id)
          .single();
        if (fetchError) {
          return Result.error("Failed to fetch updated flashcard: " + fetchError.message);
        }
        const f2 = updatedFlashcard as FlashcardWithTags;
        const dto2: FlashcardDetailDto = {
          id: f2.id,
          front: f2.front,
          back: f2.back,
          created_at: f2.created_at,
          updated_at: f2.updated_at,
          tags: f2.tags.map((t) => ({ id: t.tag.id, name: t.tag.name })),
        };
        return Result.ok(dto2);
      } catch (error) {
        return Result.error(error instanceof Error ? error.message : "Unknown error occurred");
      }
    },

    // Delete a flashcard
    async deleteFlashcard(id: string): Promise<Result<null, string>> {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          return Result.error("User not authenticated");
        }
        const { error } = await supabase
          .from("flashcards")
          .delete()
          .eq("id", id)
          .eq("user_id", user.id);
        if (error) {
          return Result.error("Failed to delete flashcard: " + error.message);
        }
        return Result.ok(null);
      } catch (error) {
        return Result.error(error instanceof Error ? error.message : "Unknown error occurred");
      }
    },
  };
}
