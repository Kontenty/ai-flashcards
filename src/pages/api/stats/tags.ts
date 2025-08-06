import type { APIRoute } from "astro";
import { createTagService } from "@/lib/services/tag.service";
import { logService } from "@/lib/services/log.service";

export const prerender = false;

export const GET: APIRoute = async ({ locals }) => {
  const { user, supabase } = locals;

  if (!user) {
    return new Response(JSON.stringify({ message: "Unauthorized" }), { status: 401 });
  }

  const tagService = createTagService(supabase);

  try {
    const result = await tagService.list();

    if (result.isError) {
      logService.error(result.error);
      return new Response(JSON.stringify({ message: "An unexpected error occurred." }), {
        status: 500,
      });
    }

    return new Response(JSON.stringify(result.value), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    logService.error("An unexpected error during tags fetch", { error });
    return new Response(JSON.stringify({ message: "An unexpected error occurred." }), {
      status: 500,
    });
  }
};
