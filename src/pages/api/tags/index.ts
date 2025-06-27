import type { APIRoute } from "astro";
import { createTagService } from "@/lib/services/tag.service";
import { logService } from "@/lib/services/log.service";
import { tagQuerySchema, createTagSchema } from "@/lib/validators/tag.schema";

export const prerender = false;

// Handler for listing tags
export const GET: APIRoute = async ({ request, locals }) => {
  try {
    const url = new URL(request.url);
    const rawQuery = { search: url.searchParams.get("search") ?? undefined };
    const parsed = tagQuerySchema.safeParse(rawQuery);
    if (!parsed.success) {
      logService.warn("Invalid query parameters for listing tags", {
        details: parsed.error.format(),
      });
      return new Response(
        JSON.stringify({ error: "Invalid query parameters", details: parsed.error.format() }),
        { status: 400 },
      );
    }
    const service = createTagService(locals.supabase);
    const result = await service.list(parsed.data.search);
    if (!result.isSuccess) {
      logService.error("Failed to list tags", { error: result.error });
      return new Response(JSON.stringify({ error: "Failed to list tags", details: result.error }), {
        status: 500,
      });
    }
    return new Response(JSON.stringify(result.value), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    logService.error("Internal error listing tags", {
      error: error instanceof Error ? error.message : error,
    });
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500 },
    );
  }
};

// Handler for creating a tag
export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const body = await request.json();
    const parsed = createTagSchema.safeParse(body);
    if (!parsed.success) {
      logService.warn("Invalid request data for creating tag", { details: parsed.error.format() });
      return new Response(
        JSON.stringify({ error: "Invalid request data", details: parsed.error.format() }),
        { status: 400 },
      );
    }
    const service = createTagService(locals.supabase);
    const result = await service.create(parsed.data);
    if (!result.isSuccess) {
      logService.warn("Failed to create tag", { error: result.error });
      const status = result.error.includes("unique") ? 400 : 500;
      return new Response(
        JSON.stringify({ error: "Failed to create tag", details: result.error }),
        { status },
      );
    }
    return new Response(JSON.stringify(result.value), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    logService.error("Error creating tag", {
      error: error instanceof Error ? error.message : error,
    });
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500 },
    );
  }
};
