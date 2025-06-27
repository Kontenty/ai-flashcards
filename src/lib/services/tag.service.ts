import type { SupabaseClient } from "@supabase/supabase-js";
import { Result } from "@/lib/utils/result";
import type { Database } from "@/db/database.types";
import type { TagDto, CreateTagCommand, UpdateTagCommand } from "@/types";

export function createTagService(supabase: SupabaseClient<Database>) {
  return {
    // List tags with optional search
    async list(search?: string): Promise<Result<TagDto[], string>> {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          return Result.error("User not authenticated");
        }
        let builder = supabase.from("tags").select("id, name").eq("user_id", user.id);
        if (search) {
          builder = builder.ilike("name", `%${search}%`);
        }
        const { data: tags, error } = await builder;
        if (error) {
          return Result.error("Failed to list tags: " + error.message);
        }
        return Result.ok(tags as TagDto[]);
      } catch (error) {
        return Result.error(error instanceof Error ? error.message : "Unknown error occurred");
      }
    },

    // Create a new tag
    async create(command: CreateTagCommand): Promise<Result<TagDto, string>> {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          return Result.error("User not authenticated");
        }
        const { data, error } = await supabase
          .from("tags")
          .insert({ name: command.name, user_id: user.id })
          .select()
          .single();
        if (error) {
          if (error.code === "23505") {
            return Result.error("Tag name must be unique");
          }
          return Result.error("Failed to create tag: " + error.message);
        }
        return Result.ok({ id: data.id, name: data.name });
      } catch (error) {
        return Result.error(error instanceof Error ? error.message : "Unknown error occurred");
      }
    },

    // Update an existing tag
    async update(id: string, command: UpdateTagCommand): Promise<Result<TagDto, string>> {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          return Result.error("User not authenticated");
        }
        const { data, error } = await supabase
          .from("tags")
          .update({ name: command.name })
          .eq("id", id)
          .eq("user_id", user.id)
          .select()
          .single();
        if (error) {
          if (error.code === "23505") {
            return Result.error("Tag name must be unique");
          }
          return Result.error("Failed to update tag: " + error.message);
        }
        return Result.ok({ id: data.id, name: data.name });
      } catch (error) {
        return Result.error(error instanceof Error ? error.message : "Unknown error occurred");
      }
    },

    // Delete a tag
    async delete(id: string): Promise<Result<null, string>> {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          return Result.error("User not authenticated");
        }
        const { data, error } = await supabase
          .from("tags")
          .delete()
          .eq("id", id)
          .eq("user_id", user.id)
          .select();
        if (error) {
          return Result.error("Failed to delete tag: " + error.message);
        }
        if (!data || data.length === 0) {
          return Result.error("Tag not found");
        }
        return Result.ok(null);
      } catch (error) {
        return Result.error(error instanceof Error ? error.message : "Unknown error occurred");
      }
    },

    async validateTags(tagIds: string[]): Promise<Result<true, string>> {
      try {
        // Get the current user's ID
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          return Result.error("User not authenticated");
        }

        // Check if all tags exist and belong to the user
        const { data: tags, error } = await supabase
          .from("tags")
          .select("id")
          .in("id", tagIds)
          .eq("user_id", user.id);

        if (error) {
          return Result.error("Failed to validate tags: " + error.message);
        }

        // Check if all requested tags were found
        if (tags.length !== tagIds.length) {
          const foundIds = new Set(tags.map((t) => t.id));
          const missingIds = tagIds.filter((id) => !foundIds.has(id));
          return Result.error(`Tags not found or not accessible: ${missingIds.join(", ")}`);
        }

        return Result.ok(true);
      } catch (error) {
        return Result.error(error instanceof Error ? error.message : "Unknown error occurred");
      }
    },
  };
}
