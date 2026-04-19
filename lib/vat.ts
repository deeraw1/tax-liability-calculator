// Nigeria Tax Act 2025 — rate held at 7.5%
export const VAT_RATE = 0.075

export const EXEMPT = [
  'Basic food items (unprocessed & primary)',
  'Medical, pharmaceutical & healthcare products',
  'Educational materials & tuition fees',
  'Baby products',
  'Exported goods & services',
  'Agricultural equipment, seeds & produce',
  'Commercial aircraft, helicopters & spare parts',
  'Renewable energy equipment (solar, wind, hydro)',
  'Humanitarian donor-funded goods & services',
  'Residential rent',
  'Financial services (loans, deposits, insurance premiums)',
]

export function calculate(taxableSupplies: number, inputCredit: number) {
  const outputVat   = taxableSupplies * VAT_RATE
  const netPayable  = Math.max(outputVat - inputCredit, 0)
  const refundable  = Math.max(inputCredit - outputVat, 0)
  return { rate: VAT_RATE, taxableSupplies, outputVat, inputCredit, netPayable, refundable }
}
