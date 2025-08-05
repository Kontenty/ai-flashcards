import {
  type OpenRouterMessage,
  type ResponseFormat,
  type SendChatOptions,
  type OpenRouterResponse,
  type OpenRouterRawResponse,
  OpenRouterServiceError,
} from "./open-router.types";

// Import logService if available
import { logService } from "./log.service";

export class OpenRouterService {
  private readonly _apiKey: string;
  private readonly _baseUrl: string = "https://openrouter.ai/api/v1";
  private _defaultModel = "openai/gpt-4.1-mini";
  private _defaultParams: Record<string, unknown> = {
    temperature: 0.7,
    top_p: 1,
  };

  /**
   * Main service for communicating with the OpenRouter API.
   */
  constructor({
    apiKey,
    model,
    defaultParams,
  }: {
    apiKey: string;
    model?: string;
    defaultParams?: Record<string, unknown>;
  }) {
    if (!apiKey) {
      logService.error("Missing OpenRouter API key");
      throw new Error("OpenRouter API key is required.");
    }
    this._apiKey = apiKey;
    this._defaultModel = model ?? this._defaultModel;
    this._defaultParams = defaultParams ?? this._defaultParams;
  }

  /**
   * Sets the default LLM model.
   */
  public setDefaultModel(model: string): void {
    this._defaultModel = model;
  }

  /**
   * Sets the default model parameters.
   */
  public setDefaultParams(params: Record<string, unknown>): void {
    this._defaultParams = params;
  }

  /**
   * Sends a chat to the OpenRouter API with support for system/user messages, response_format, model, and parameters.
   * @param messages Array of messages (system, user, assistant)
   * @param options Optional model, params, and response format
   * @returns Model response (raw or parsed according to JSON Schema)
   * @throws OpenRouterServiceError on error
   */
  public async sendChat(
    messages: OpenRouterMessage[],
    options?: SendChatOptions,
  ): Promise<OpenRouterResponse> {
    if (!this._apiKey) {
      throw new OpenRouterServiceError("Missing API key", "NO_API_KEY");
    }
    if (!Array.isArray(messages) || messages.length === 0) {
      throw new OpenRouterServiceError("No messages to send", "NO_MESSAGES");
    }
    try {
      const payload = this._buildPayload(messages, options);
      const response = await fetch(`${this._baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this._apiKey}`,
          "HTTP-Referer": "10x-ai-flashcards",
        },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        return this._handleError(await response.json());
      }
      return await this._handleResponse(response, options?.responseFormat);
    } catch (error) {
      this._handleError(error);
    }
  }

  private _buildPayload(
    messages: OpenRouterMessage[],
    options?: SendChatOptions,
  ): Record<string, unknown> {
    const model = options?.model ?? this._defaultModel;
    if (!model) {
      throw new OpenRouterServiceError("No model specified", "NO_MODEL");
    }
    const params = { ...this._defaultParams, ...options?.params };
    const payload: Record<string, unknown> = {
      model,
      messages,
      ...params,
    };
    if (options?.responseFormat) {
      payload.response_format = options.responseFormat;
    }
    return payload;
  }

  private async _handleResponse(
    response: Response,
    responseFormat?: ResponseFormat,
  ): Promise<OpenRouterResponse> {
    const data = await this._parseJsonResponse(response);
    if (data.error) {
      throw new OpenRouterServiceError(
        data.error.message || "API error",
        data.error.code || "API_ERROR",
        { error: String(data.error) },
      );
    }
    if (responseFormat && responseFormat.type === "json_schema") {
      return this._parseAndValidateJsonSchema(data, responseFormat);
    }
    return data;
  }

  private async _parseJsonResponse(response: Response): Promise<OpenRouterRawResponse> {
    try {
      return (await response.json()) as OpenRouterRawResponse;
    } catch (e) {
      throw new OpenRouterServiceError("Invalid JSON response", "INVALID_JSON", {
        error: String(e),
      });
    }
  }

  private _parseAndValidateJsonSchema(
    data: OpenRouterRawResponse,
    responseFormat: ResponseFormat,
  ): Record<string, unknown> {
    let contentObj: Record<string, unknown> = {};
    try {
      contentObj = JSON.parse(data.choices[0].message.content);
    } catch (e) {
      throw new OpenRouterServiceError("Invalid JSON in model response", "INVALID_MODEL_JSON", {
        error: String(e),
      });
    }
    const required = (responseFormat.json_schema.schema as { required?: string[] }).required;
    if (required && Array.isArray(required)) {
      for (const field of required) {
        if (!(field in contentObj)) {
          throw new OpenRouterServiceError(
            `Missing required property: ${field}`,
            "RESPONSE_FORMAT_VALIDATION",
            { error: String(field) },
          );
        }
      }
    }
    return contentObj;
  }

  private _handleError(error: unknown): never {
    logService.error("OpenRouterService error", { error });
    if (error instanceof OpenRouterServiceError) {
      throw error;
    }
    if (
      typeof error === "object" &&
      error !== null &&
      "message" in error &&
      "code" in error &&
      typeof (error as { message: unknown }).message === "string" &&
      typeof (error as { code: unknown }).code === "string"
    ) {
      throw new OpenRouterServiceError(
        (error as { message: string }).message,
        (error as { code: string }).code,
        { error: JSON.stringify(error, null, 2) },
      );
    }
    throw new OpenRouterServiceError("Unknown OpenRouterService error", "UNKNOWN", {
      error: JSON.stringify(error, null, 2),
    });
  }
}
