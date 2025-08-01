import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Utility to safely extract a string field from a JSON body with a default value
export function getStringField(body: unknown, field: string, defaultValue: string): string {
  if (body && typeof body === "object") {
    const val = (body as Record<string, unknown>)[field];
    if (typeof val === "string") {
      return val;
    }
  }
  return defaultValue;
}
