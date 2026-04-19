// Nigeria Tax Act 2025 — reformed rates
export const WHT_RATES: Record<string, { corporate: number; individual: number }> = {
  'Dividends':                          { corporate: 0.10, individual: 0.10 },
  'Interest':                           { corporate: 0.10, individual: 0.10 },
  'Royalties':                          { corporate: 0.10, individual: 0.10 },
  'Rent (land & buildings)':            { corporate: 0.10, individual: 0.10 },
  'Director fees':                      { corporate: 0.10, individual: 0.10 },
  'Professional fees':                  { corporate: 0.10, individual: 0.05 },
  'Consulting / advisory fees':         { corporate: 0.10, individual: 0.05 },
  'Technical / management fees':        { corporate: 0.10, individual: 0.05 },
  'Construction & building contracts':  { corporate: 0.025, individual: 0.025 },
  'Supply of goods':                    { corporate: 0.02,  individual: 0.02  },
  'Agency / commission':                { corporate: 0.05,  individual: 0.05  },
  'Charter (vessels / aircraft)':       { corporate: 0.10, individual: 0.10 },
  'Advertising / marketing services':   { corporate: 0.05,  individual: 0.05  },
}

export const MIN_THRESHOLD = 100_000

export interface WHTEntry { type: string; recipient: 'corporate' | 'individual'; amount: number }

export function transactionTypes() { return Object.keys(WHT_RATES) }

export function calculate(entries: WHTEntry[]) {
  let total = 0
  const lines = entries.map(e => {
    const exempt   = e.amount < MIN_THRESHOLD
    const rate     = exempt ? 0 : (WHT_RATES[e.type]?.[e.recipient] ?? 0)
    const deducted = e.amount * rate
    total += deducted
    return { ...e, rate, deducted, net: e.amount - deducted, note: exempt ? 'Below ₦100k — exempt' : '' }
  })
  return { lines, total }
}
