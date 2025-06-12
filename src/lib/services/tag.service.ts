import type { SupabaseClient } from "@supabase/supabase-js";
import { Result } from "@/lib/utils/result";

export function createTagService(supabase: SupabaseClient) {
  return {
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
