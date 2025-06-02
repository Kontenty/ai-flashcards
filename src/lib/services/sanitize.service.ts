/**
 * Sanitizes input text by removing potentially harmful content
 * and normalizing whitespace
 */
export class SanitizeService {
  /**
   * Sanitizes text input for flashcard generation
   * @param text Raw input text
   * @returns Sanitized text
   */
  sanitizeText(text: string): string {
    return (
      text
        // Remove HTML tags
        .replace(/<[^>]*>/g, "")
        // Remove script tags and their content
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
        // Remove control characters
        // eslint-disable-next-line no-control-regex
        .replace(/[\x00-\x1F\x7F-\x9F]/g, "")
        // Normalize whitespace
        .replace(/\s+/g, " ")
        // Trim
        .trim()
    );
  }

  /**
   * Checks if text contains potentially harmful content
   * @param text Text to check
   * @returns true if text is safe, false otherwise
   */
  isTextSafe(text: string): boolean {
    const unsafePatterns = [
      /<script\b[^>]*>/i, // Script tags
      /javascript:/i, // JavaScript protocol
      /data:/i, // Data URLs
      /vbscript:/i, // VBScript protocol
      /on\w+\s*=/i, // Event handlers
      /expression\s*\(/i, // CSS expressions
    ];

    return !unsafePatterns.some((pattern) => pattern.test(text));
  }
}

export const sanitizeService = new SanitizeService();
