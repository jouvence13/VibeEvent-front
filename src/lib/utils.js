import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

// Organizer revenue can span multiple currencies (each event picks its own),
// so it's summed and displayed per currency instead of under one misleading symbol.
export function formatRevenueByCurrency(revenueByCurrency) {
  const entries = Object.entries(revenueByCurrency || {});
  if (entries.length === 0) return '0€';
  return entries
    .map(([currency, amount]) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency }).format(amount))
    .join(' + ');
}
