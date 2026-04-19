import { NextRequest, NextResponse } from 'next/server'
import * as cit from '@/lib/cit'
import * as vat from '@/lib/vat'
import * as wht from '@/lib/wht'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { citInput, vatInput, whtEntries } = body

    const citResult = cit.calculate(
      Number(citInput.turnover),
      Number(citInput.profit),
      Number(citInput.deductions),
      Number(citInput.year),
    )

    const vatResult = vat.calculate(
      Number(vatInput.taxableSupplies),
      Number(vatInput.inputCredit),
    )

    const whtResult = wht.calculate(whtEntries as wht.WHTEntry[])

    return NextResponse.json({ citResult, vatResult, whtResult })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 400 })
  }
}
