const CurrencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0
});

const CountFormatter = new Intl.NumberFormat('en-US', {
  style: 'decimal',
  maximumFractionDigits: 0,
  localeMatcher: 'best fit'
});

export function formatCurrency(value: string) {
  const [integer, decimal] = value.split('.');
  return CurrencyFormatter.format(BigInt(integer)) + (decimal ? `.${decimal}` : '');
}

export function formatCount(value: number) {
  return CountFormatter.format(value);
}
