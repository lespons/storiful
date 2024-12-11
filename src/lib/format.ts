const CurrencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0
});

export function formatCurrency(value: string) {
  const [integer, decimal] = value.split('.');
  return CurrencyFormatter.format(BigInt(integer)) + (decimal ? `.${decimal}` : '');
}
