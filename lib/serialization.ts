import { Prisma } from "@prisma/client";

/**
 * Serializes a Prisma Decimal or number to a plain JavaScript number.
 * Handles null/undefined gracefully.
 */
export function serializeDecimal(
  value: Prisma.Decimal | number | string | null | undefined,
): number {
  if (value === null || value === undefined) {
    return 0;
  }

  if (typeof value === "number") {
    return value;
  }

  if (typeof value === "string") {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? 0 : parsed;
  }

  // Handle Prisma.Decimal
  if (typeof value === "object" && "toNumber" in value) {
    return (value as any).toNumber();
  }

  // Fallback for string-like decimal objects
  return Number(value);
}

/**
 * Recursively serializes an object, converting any Decimal values to numbers.
 * Safe to use on Prisma results before sending to client components.
 */
export function serializeModel<T>(data: T): T {
  if (data === null || data === undefined) {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map((item) => serializeModel(item)) as unknown as T;
  }

  if (typeof data === "object") {
    // Check if it's a Decimal
    if (
      Prisma.Decimal.isDecimal(data) ||
      ("toNumber" in data && typeof (data as any).toNumber === "function")
    ) {
      return (data as any).toNumber() as unknown as T;
    }

    // Handle Date objects (optional, but often good to serialize dates too if needed, keeping as Date for now)
    if (data instanceof Date) {
      return data;
    }

    const newObj: any = {};
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        newObj[key] = serializeModel((data as any)[key]);
      }
    }
    return newObj as T;
  }

  return data;
}
