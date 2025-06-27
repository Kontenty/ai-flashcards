import type { APIRoute } from "astro";
import { createTagService } from "@/lib/services/tag.service";
import { logService } from "@/lib/services/log.service";
import { tagIdParamSchema, updateTagSchema } from "@/lib/validators/tag.schema";

export const prerender = false;

export const PUT: APIRoute = async ({ request, params, locals }) => {
  try {
    const parsedParams = tagIdParamSchema.safeParse(params);
    if (!parsedParams.success) {
      logService.warn("Invalid tag ID format for update", { details: parsedParams.error.format() });
      return new Response(JSON.stringify({ error: "Invalid ID format" }), { status: 400 });
    }
    const { id } = parsedParams.data;
    const body = await request.json();
    const parsedBody = updateTagSchema.safeParse(body);
    if (!parsedBody.success) {
      logService.warn("Invalid request data for updating tag", {
        details: parsedBody.error.format(),
      });
      return new Response(
        JSON.stringify({ error: "Invalid request data", details: parsedBody.error.format() }),
        { status: 400 },
      );
    }
    const service = createTagService(locals.supabase);
    const result = await service.update(id, parsedBody.data);
    if (!result.isSuccess) {
      logService.warn("Failed to update tag", { error: result.error });
      if (result.error.includes("must be unique")) {
        return new Response(
          JSON.stringify({ error: "Failed to update tag", details: result.error }),
          { status: 400 },
        );
      }
      if (result.error.includes("No rows")) {
        return new Response(JSON.stringify({ error: "Tag not found" }), { status: 404 });
      }
      return new Response(
        JSON.stringify({ error: "Failed to update tag", details: result.error }),
        { status: 500 },
      );
    }
    return new Response(JSON.stringify(result.value), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    logService.error("Internal error updating tag", {
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

export const DELETE: APIRoute = async ({ params, locals }) => {
  try {
    const parsedParams = tagIdParamSchema.safeParse(params);
    if (!parsedParams.success) {
      logService.warn("Invalid tag ID format for deletion", {
        details: parsedParams.error.format(),
      });
      return new Response(JSON.stringify({ error: "Invalid ID format" }), { status: 400 });
    }
    const { id } = parsedParams.data;
    const service = createTagService(locals.supabase);
    const result = await service.delete(id);
    if (!result.isSuccess) {
      logService.warn("Failed to delete tag", { error: result.error });
      if (result.error.includes("not authenticated")) {
        return new Response(JSON.stringify({ error: "Unauthorized", details: result.error }), {
          status: 401,
        });
      }
      if (result.error.includes("Tag not found")) {
        return new Response(JSON.stringify({ error: "Tag not found" }), { status: 404 });
      }
      return new Response(
        JSON.stringify({ error: "Failed to delete tag", details: result.error }),
        { status: 500 },
      );
    }
    return new Response(null, { status: 204 });
  } catch (error) {
    logService.error("Internal error deleting tag", {
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
