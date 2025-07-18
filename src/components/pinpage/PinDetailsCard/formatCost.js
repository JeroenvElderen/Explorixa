export default function formatCost(amount, currency) {
  if (amount == null || !currency) return amount;
  const parsed = parseFloat(amount);
  if (isNaN(parsed)) return amount;
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(parsed);
}
