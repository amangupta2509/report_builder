/**
 * Safe UUID generation that works in both browser and server environments
 * Replaces crypto.randomUUID() which is not supported everywhere
 */

import { v4 as uuidv4 } from "uuid";

/**
 * Generate a UUID v4 identifier
 * Safe for use in client and server components
 * @returns A UUID v4 string
 */
export function generateUUID(): string {
  try {
    return uuidv4();
  } catch (error) {
    // Fallback if uuid library fails
    console.warn("UUID generation failed, using fallback");
    return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
  }
}

/**
 * Generate multiple UUIDs
 * @param count Number of UUIDs to generate
 * @returns Array of UUID strings
 */
export function generateUUIDs(count: number): string[] {
  return Array.from({ length: count }, () => generateUUID());
}
