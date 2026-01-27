import prisma from "@/lib/prisma";

export const CONFIG_KEYS = {
  TAXA_PLATAFORMA: "TAXA_PLATAFORMA_PCT", // e.g. "15" for 15%
  MIN_SAQUE: "MIN_SAQUE_BRL", // e.g. "50" for R$ 50.00
};

const DEFAULTS = {
  [CONFIG_KEYS.TAXA_PLATAFORMA]: "15",
  [CONFIG_KEYS.MIN_SAQUE]: "50",
};

/**
 * Get a config value (as string)
 */
export async function getConfig(key) {
  const config = await prisma.systemConfig.findUnique({
    where: { key },
  });

  if (config) return config.value;

  // If not found, prevent crash by returning default (and ideally seed it)
  // We won't auto-seed here to avoid write-side effects in GET,
  // but in a real app we might want to via seed script.
  return DEFAULTS[key] || null;
}

/**
 * Get a config value as Number
 */
export async function getConfigNumber(key) {
  const val = await getConfig(key);
  return val ? parseFloat(val) : 0;
}

/**
 * Update a config value
 */
export async function setConfig(key, value) {
  return await prisma.systemConfig.upsert({
    where: { key },
    update: { value: String(value) },
    create: { key, value: String(value) },
  });
}
