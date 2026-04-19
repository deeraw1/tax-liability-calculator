// Nigeria Tax Act 2025
export const CIT_BANDS = [
  { label: 'Small',  maxTurnover: 50_000_000,   baseRate: 0.00 },
  { label: 'Medium', maxTurnover: 250_000_000,  baseRate: 0.20 },
  { label: 'Large',  maxTurnover: Infinity,      baseRate: 0.30 },
]

const LARGE_CIT: Record<number, number> = { 2025: 0.30, 2026: 0.275, 2027: 0.25 }
const DEV_LEVY:  Record<number, number> = { 2025: 0.04, 2026: 0.03,  2027: 0.03 }
const DEV_LEVY_DEFAULT = 0.02
const MIN_TAX_RATE     = 0.01

export function classifyCompany(turnover: number) {
  return CIT_BANDS.find(b => turnover <= b.maxTurnover) ?? CIT_BANDS[2]
}

export function citRate(band: typeof CIT_BANDS[0], year: number): number {
  if (band.label === 'Large') return LARGE_CIT[year] ?? 0.25
  return band.baseRate
}

export function devLevyRate(year: number): number {
  return DEV_LEVY[year] ?? DEV_LEVY_DEFAULT
}

export function calculate(turnover: number, profit: number, deductions: number, year: number) {
  const band         = classifyCompany(turnover)
  const rate         = citRate(band, year)
  const taxableProfit = Math.max(profit - deductions, 0)
  const citCharge    = taxableProfit * rate
  const minTax       = band.label !== 'Small' ? turnover * MIN_TAX_RATE : 0
  const citPayable   = Math.max(citCharge, minTax)
  const devRate      = devLevyRate(year)
  const devLevy      = band.label !== 'Small' ? profit * devRate : 0

  return { band: band.label, rate, taxableProfit, citCharge, minTax, citPayable, devRate, devLevy, total: citPayable + devLevy }
}
