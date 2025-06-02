import type { APIRoute } from "astro";
import { cacheService } from "@/lib/services/cache.service";
import { logService } from "@/lib/services/log.service";
// import { rateLimit } from "../../../lib/middleware/rateLimit";

export const prerender = false;

// Security headers
const securityHeaders = {
  "Content-Security-Policy": "default-src 'self'",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "X-XSS-Protection": "1; mode=block",
};

export const GET: APIRoute = async ({ request, locals }) => {
  try {
    // Verify authentication
    const {
      data: { user },
      error: authError,
    } = await locals.supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: securityHeaders,
      });
    }

    // Get system status
    const status = {
      timestamp: new Date().toISOString(),
      services: {
        cache: {
          size: Object.keys(cacheService).length,
          lastCleanup: new Date().toISOString(),
        },
        logs: {
          recentCount: logService.getRecentLogs().length,
          lastError: logService.getRecentLogs(1).find((log) => log.level === "error")?.message,
        },
        rateLimit: {
          // This is a placeholder - in a real implementation, you'd want to expose
          // actual rate limit statistics from your rate limiting service
          activeWindows: 0,
        },
      },
    };

    return new Response(JSON.stringify(status), {
      status: 200,
      headers: {
        ...securityHeaders,
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    logService.error("Error getting system status", { error });
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: securityHeaders,
      },
    );
  }
};
