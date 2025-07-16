import type { RequestHandler, WebSocketHandler } from "msw";
import { http, HttpResponse } from "msw";

export const handlers: (RequestHandler | WebSocketHandler)[] = [
  // Define request handlers here, e.g.
  http.get("/api/flashcards", () => {
    return HttpResponse.json({ data: [] });
  }),
];
