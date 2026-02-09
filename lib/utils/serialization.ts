/**
 * Serializes Prisma data to be safe for Client Components.
 * Handles Decimal, BigInt, and Date types efficiently.
 */
export function serializePrismaData<T>(data: T): T {
  if (data === null || data === undefined) {
    return data;
  }

  if (typeof data === "object") {
    // Handle Date
    if (data instanceof Date) {
      return data.toISOString() as unknown as T;
    }

    // Handle Decimal (Prisma / decimal.js) - has toNumber or internal s,e,d structure
    if (typeof (data as { toNumber?: () => number }).toNumber === "function") {
      return (
        data as unknown as { toNumber: () => number }
      ).toNumber() as unknown as T;
    }
    if (
      data.constructor &&
      (data.constructor as { name?: string }).name === "Decimal" &&
      typeof (data as { toString?: () => string }).toString === "function"
    ) {
      return (parseFloat((data as { toString: () => string }).toString()) ||
        0) as unknown as T;
    }

    // Handle BigInt
    if (typeof data === "bigint") {
      return Number(data) as unknown as T;
    }

    // Handle Array
    if (Array.isArray(data)) {
      return data.map(serializePrismaData) as unknown as T;
    }

    // Handle Object
    const result: Record<string, unknown> = {};
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        result[key] = serializePrismaData(
          (data as Record<string, unknown>)[key]
        );
      }
    }
    return result as unknown as T;
  }

  return data;
}
