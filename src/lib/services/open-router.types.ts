// Types and interfaces for OpenRouterService

export type OpenRouterRole = "system" | "user" | "assistant";

/**
 * Message for the OpenRouter model.
 */
export interface OpenRouterMessage {
  role: OpenRouterRole;
  content: string;
}

/**
 * JSON Schema response format for OpenRouter.
 */
export interface ResponseFormat {
  type: "json_schema";
  json_schema: {
    name: string;
    strict: boolean;
    schema: object;
  };
}

/**
 * Options for sending a chat to OpenRouter.
 */
export interface SendChatOptions {
  model?: string;
  params?: Record<string, unknown>;
  responseFormat?: ResponseFormat;
}

/**
 * Single choice in the raw OpenRouter model response.
 */
export interface OpenRouterRawChoice {
  index: number;
  message: {
    role: string;
    content: string;
  };
  finish_reason?: string;
}

/**
 * Raw response from the OpenRouter model.
 */
export interface OpenRouterRawResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: OpenRouterRawChoice[];
  usage?: Record<string, unknown>;
  error?: { message: string; code: string };
}

/**
 * Parsed response according to JSON Schema.
 */
export type OpenRouterJsonSchemaResponse = Record<string, unknown>;

/**
 * Model response (raw or parsed according to JSON Schema).
 */
export type OpenRouterResponse = OpenRouterRawResponse | OpenRouterJsonSchemaResponse;

/**
 * Error class for OpenRouterService errors.
 */
export class OpenRouterServiceError extends Error {
  code: string;
  details?: unknown;
  constructor(message: string, code: string, details?: unknown) {
    super(message);
    this.name = "OpenRouterServiceError";
    this.code = code;
    this.details = details;
  }
}
