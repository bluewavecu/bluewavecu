export function formatCurrency(value: number) {
  const absoluteValue = Math.abs(value);

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(absoluteValue);
}

export function formatSignedCurrency(value: number) {
  const formatted = formatCurrency(value);
  if (value > 0) {
    return `+${formatted}`;
  }

  if (value < 0) {
    return `-${formatted}`;
  }

  return formatted;
}
