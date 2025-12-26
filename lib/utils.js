import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"
import { formatCurrency } from "./utils/formatters";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export { formatCurrency };
