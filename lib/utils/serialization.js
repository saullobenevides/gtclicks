/**
 * Serializes Prisma data to be safe for Client Components.
 * Handles Decimal, BigInt, and Date types efficiently.
 *
 * @param {any} data - The data to serialize
 * @returns {any} - Serialized data
 */
export function serializePrismaData(data) {
  if (data === null || data === undefined) {
    return data;
  }

  if (typeof data === "object") {
    // Handle Date
    if (data instanceof Date) {
      return data.toISOString();
    }

    // Handle Decimal (Prisma)
    if (
      data.constructor &&
      data.constructor.name === "Decimal" &&
      typeof data.toNumber === "function"
    ) {
      return data.toNumber();
    }

    // Handle BigInt
    if (typeof data === "bigint") {
      return Number(data); // Be careful with very large numbers
    }

    // Handle Array
    if (Array.isArray(data)) {
      return data.map(serializePrismaData);
    }

    // Handle Object
    const result = {};
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        result[key] = serializePrismaData(data[key]);
      }
    }
    return result;
  }

  return data;
}
