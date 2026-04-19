'use client'
import { useState } from 'react'
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import { transactionTypes } from '@/lib/wht'

// ─── types ────────────────────────────────────────────────────────────────────
interface CITInput  { turnover: string; profit: string; deductions: string; year: string }
interface VATInput  { taxableSupplies: string; inputCredit: string }
interface WHTEntry  { type: string; recipient: 'corporate' | 'individual'; amount: string }

interface CITResult {
  band: string; rate: number; taxableProfit: number; citCharge: number;
  minTax: number; citPayable: number; devRate: number; devLevy: number; total: number;
}
interface VATResult {
  rate: number; taxableSupplies: number; outputVat: number;
  inputCredit: number; netPayable: number; refundable: number;
}
interface WHTLine {
  type: string; recipient: string; amount: number;
  rate: number; deducted: number; net: number; note: string;
}
interface WHTResult  { lines: WHTLine[]; total: number }

interface Results { citResult: CITResult; vatResult: VATResult; whtResult: WHTResult }

// ─── helpers ──────────────────────────────────────────────────────────────────
const fmt = (n: number) =>
  '₦' + n.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const pct = (n: number) => (n * 100).toFixed(2) + '%'

const ACCENT  = '#17c082'
const COLORS  = ['#17c082', '#3a7bd5', '#f5a623', '#e74c3c']

const defaultCIT: CITInput   = { turnover: '', profit: '', deductions: '0', year: '2025' }
const defaultVAT: VATInput   = { taxableSupplies: '', inputCredit: '0' }
const defaultEntry: WHTEntry = { type: transactionTypes()[0], recipient: 'corporate', amount: '' }

// ─── sub-components ───────────────────────────────────────────────────────────
function Label({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--muted)',
      textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 4 }}>
      {children}
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <Label>{label}</Label>
      {children}
    </div>
  )
}

function KV({ k, v, highlight }: { k: string; v: string; highlight?: boolean }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
      <span style={{ color: 'var(--muted)', fontSize: '0.88rem' }}>{k}</span>
      <span style={{ fontWeight: highlight ? 700 : 500,
        color: highlight ? ACCENT : 'var(--text)', fontSize: highlight ? '1rem' : '0.92rem' }}>
        {v}
      </span>
    </div>
  )
}

function SectionTitle({ label, title }: { label: string; title: string }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div className="section-label">{label}</div>
      <div className="section-title">{title}</div>
    </div>
  )
}

// ─── main ─────────────────────────────────────────────────────────────────────
export default function TaxApp() {
  const [citInput, setCIT] = useState<CITInput>(defaultCIT)
  const [vatInput, setVAT] = useState<VATInput>(defaultVAT)
  const [whtEntries, setWHT] = useState<WHTEntry[]>([{ ...defaultEntry }])
  const [results, setResults] = useState<Results | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const addRow = () => setWHT(r => [...r, { ...defaultEntry }])
  const removeRow = (i: number) => setWHT(r => r.filter((_, idx) => idx !== i))
  const updateRow = (i: number, k: keyof WHTEntry, v: string) =>
    setWHT(r => r.map((row, idx) => idx === i ? { ...row, [k]: v } : row))

  async function handleCalculate() {
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ citInput, vatInput, whtEntries }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setResults(data)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setLoading(false)
    }
  }

  // donut data
  const donutData = results
    ? [
        { name: 'CIT', value: results.citResult.citPayable },
        { name: 'Dev Levy', value: results.citResult.devLevy },
        { name: 'VAT Payable', value: results.vatResult.netPayable },
        { name: 'WHT', value: results.whtResult.total },
      ].filter(d => d.value > 0)
    : []

  const totalTax = results
    ? results.citResult.total + results.vatResult.netPayable + results.whtResult.total
    : 0

  const inputStyle: React.CSSProperties = {
    background: 'var(--surface2)', border: '1px solid var(--border2)',
    borderRadius: 8, color: 'var(--text)', padding: '9px 12px',
    fontSize: '0.9rem', width: '100%', outline: 'none',
  }
  const selectStyle = { ...inputStyle }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', padding: '32px 16px' }}>
      <div style={{ maxWidth: 960, margin: '0 auto' }}>

        {/* ── Header ── */}
        <div style={{ marginBottom: 40, textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10,
            background: 'rgba(23,192,130,0.12)', border: '1px solid rgba(23,192,130,0.25)',
            borderRadius: 24, padding: '5px 16px', marginBottom: 16 }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: 1.5,
              color: ACCENT, textTransform: 'uppercase' }}>Nigeria Tax Act 2025</span>
          </div>
          <h1 style={{ fontSize: 'clamp(1.6rem, 4vw, 2.4rem)', fontWeight: 800,
            color: 'var(--text)', marginBottom: 8 }}>
            Tax Liability Calculator
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: '0.95rem', maxWidth: 560, margin: '0 auto' }}>
            CIT · VAT · WHT — computed against Tinubu&apos;s 2025 tax reform
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))',
          gap: 20, marginBottom: 20 }}>

          {/* ── CIT ── */}
          <div className="card">
            <SectionTitle label="Corporation Tax" title="Company Income Tax (CIT)" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <Field label="Annual Turnover (₦)">
                <input style={inputStyle} type="number" placeholder="e.g. 120000000"
                  value={citInput.turnover}
                  onChange={e => setCIT(p => ({ ...p, turnover: e.target.value }))} />
              </Field>
              <Field label="Net Profit Before Tax (₦)">
                <input style={inputStyle} type="number" placeholder="e.g. 30000000"
                  value={citInput.profit}
                  onChange={e => setCIT(p => ({ ...p, profit: e.target.value }))} />
              </Field>
              <Field label="Allowable Deductions (₦)">
                <input style={inputStyle} type="number" placeholder="0"
                  value={citInput.deductions}
                  onChange={e => setCIT(p => ({ ...p, deductions: e.target.value }))} />
              </Field>
              <Field label="Tax Year">
                <select style={selectStyle} value={citInput.year}
                  onChange={e => setCIT(p => ({ ...p, year: e.target.value }))}>
                  <option value="2025">2025</option>
                  <option value="2026">2026</option>
                  <option value="2027">2027</option>
                </select>
              </Field>
            </div>
          </div>

          {/* ── VAT ── */}
          <div className="card">
            <SectionTitle label="Value Added Tax" title="VAT (7.5%)" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <Field label="Taxable Supplies (₦)">
                <input style={inputStyle} type="number" placeholder="e.g. 5000000"
                  value={vatInput.taxableSupplies}
                  onChange={e => setVAT(p => ({ ...p, taxableSupplies: e.target.value }))} />
              </Field>
              <Field label="Input VAT Credit (₦)">
                <input style={inputStyle} type="number" placeholder="0"
                  value={vatInput.inputCredit}
                  onChange={e => setVAT(p => ({ ...p, inputCredit: e.target.value }))} />
              </Field>
              <div style={{ marginTop: 8, padding: '12px 14px',
                background: 'rgba(23,192,130,0.06)', border: '1px solid rgba(23,192,130,0.15)',
                borderRadius: 8 }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: ACCENT,
                  textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>
                  VAT-Exempt Categories
                </div>
                {[
                  'Basic food items (unprocessed)',
                  'Medical & pharmaceutical products',
                  'Educational materials & tuition',
                  'Baby products',
                  'Exported goods & services',
                  'Agricultural equipment & produce',
                  'Renewable energy equipment',
                  'Residential rent',
                  'Financial services',
                ].map(c => (
                  <div key={c} style={{ fontSize: '0.78rem', color: 'var(--muted)',
                    padding: '2px 0', display: 'flex', gap: 6, alignItems: 'flex-start' }}>
                    <span style={{ color: ACCENT, marginTop: 2 }}>·</span>{c}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── WHT ── */}
        <div className="card" style={{ marginBottom: 20 }}>
          <SectionTitle label="Withholding Tax" title="WHT Transactions" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {whtEntries.map((row, i) => (
              <div key={i} style={{ display: 'grid',
                gridTemplateColumns: '1fr 160px 160px 36px', gap: 10, alignItems: 'end' }}>
                <Field label={i === 0 ? 'Transaction Type' : ''}>
                  <select style={selectStyle} value={row.type}
                    onChange={e => updateRow(i, 'type', e.target.value)}>
                    {transactionTypes().map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </Field>
                <Field label={i === 0 ? 'Recipient' : ''}>
                  <select style={selectStyle} value={row.recipient}
                    onChange={e => updateRow(i, 'recipient', e.target.value)}>
                    <option value="corporate">Corporate</option>
                    <option value="individual">Individual</option>
                  </select>
                </Field>
                <Field label={i === 0 ? 'Amount (₦)' : ''}>
                  <input style={inputStyle} type="number" placeholder="0"
                    value={row.amount}
                    onChange={e => updateRow(i, 'amount', e.target.value)} />
                </Field>
                <button onClick={() => removeRow(i)}
                  style={{ background: 'rgba(231,76,60,0.15)', color: '#e74c3c',
                    padding: '9px 10px', alignSelf: 'flex-end' }}>
                  ✕
                </button>
              </div>
            ))}
            <button onClick={addRow}
              style={{ background: 'rgba(23,192,130,0.12)', color: ACCENT,
                border: '1px dashed rgba(23,192,130,0.3)', width: 'fit-content', marginTop: 4 }}>
              + Add Transaction
            </button>
          </div>
        </div>

        {/* ── Calculate button ── */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 32 }}>
          <button onClick={handleCalculate} disabled={loading}
            style={{ background: ACCENT, color: '#000', fontWeight: 700,
              fontSize: '0.95rem', padding: '12px 40px', borderRadius: 10,
              opacity: loading ? 0.6 : 1 }}>
            {loading ? 'Calculating…' : 'Calculate Tax Liability'}
          </button>
        </div>

        {error && (
          <div style={{ background: 'rgba(231,76,60,0.12)', border: '1px solid #e74c3c',
            borderRadius: 8, padding: '12px 16px', color: '#e74c3c',
            marginBottom: 24, fontSize: '0.9rem' }}>
            {error}
          </div>
        )}

        {/* ── Results ── */}
        {results && (
          <div>
            {/* summary donut */}
            <div className="card" style={{ marginBottom: 20 }}>
              <SectionTitle label="Summary" title="Total Tax Liability" />
              <div style={{ display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20 }}>
                <div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--muted)',
                    textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>
                    Total Tax Payable
                  </div>
                  <div style={{ fontSize: '2rem', fontWeight: 800, color: ACCENT }}>
                    {fmt(totalTax)}
                  </div>
                  <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <KV k="CIT Payable" v={fmt(results.citResult.citPayable)} />
                    <KV k="Development Levy" v={fmt(results.citResult.devLevy)} />
                    <KV k="VAT Payable" v={fmt(results.vatResult.netPayable)} />
                    <KV k="WHT Deducted" v={fmt(results.whtResult.total)} />
                    <KV k="Grand Total" v={fmt(totalTax)} highlight />
                  </div>
                </div>
                {donutData.length > 0 && (
                  <div style={{ height: 240 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={donutData} cx="50%" cy="50%" innerRadius={60}
                          outerRadius={90} paddingAngle={3} dataKey="value">
                          {donutData.map((_, idx) => (
                            <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(v: number) => fmt(v)} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            </div>

            {/* CIT detail */}
            <div className="card" style={{ marginBottom: 20 }}>
              <SectionTitle label="Corporation Tax Detail" title="CIT Breakdown" />
              <KV k="Company Band" v={results.citResult.band} />
              <KV k="CIT Rate" v={pct(results.citResult.rate)} />
              <KV k="Taxable Profit" v={fmt(results.citResult.taxableProfit)} />
              <KV k="CIT on Profit" v={fmt(results.citResult.citCharge)} />
              <KV k="Minimum Tax (1% of turnover)" v={fmt(results.citResult.minTax)} />
              <KV k="CIT Payable (higher of above)" v={fmt(results.citResult.citPayable)} highlight />
              <KV k="Development Levy Rate" v={pct(results.citResult.devRate)} />
              <KV k="Development Levy" v={fmt(results.citResult.devLevy)} />
              <KV k="CIT + Dev Levy" v={fmt(results.citResult.total)} highlight />
            </div>

            {/* VAT detail */}
            <div className="card" style={{ marginBottom: 20 }}>
              <SectionTitle label="VAT Detail" title="VAT Breakdown" />
              <KV k="VAT Rate" v={pct(results.vatResult.rate)} />
              <KV k="Taxable Supplies" v={fmt(results.vatResult.taxableSupplies)} />
              <KV k="Output VAT" v={fmt(results.vatResult.outputVat)} />
              <KV k="Input VAT Credit" v={fmt(results.vatResult.inputCredit)} />
              {results.vatResult.netPayable > 0
                ? <KV k="Net VAT Payable" v={fmt(results.vatResult.netPayable)} highlight />
                : <KV k="VAT Refundable" v={fmt(results.vatResult.refundable)} highlight />}
            </div>

            {/* WHT lines */}
            {results.whtResult.lines.length > 0 && (
              <div className="card" style={{ marginBottom: 20 }}>
                <SectionTitle label="Withholding Tax Detail" title="WHT Breakdown" />
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', minWidth: 620, borderCollapse: 'collapse',
                    fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--border2)' }}>
                        {['Type','Recipient','Gross','Rate','WHT','Net','Note'].map(h => (
                          <th key={h} style={{ textAlign: 'left', padding: '8px 10px',
                            color: 'var(--muted)', fontWeight: 600,
                            fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: 0.8 }}>
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {results.whtResult.lines.map((l, i) => (
                        <tr key={i} style={{ borderBottom: '1px solid var(--border)',
                          background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)' }}>
                          <td style={{ padding: '8px 10px', color: 'var(--text)' }}>{l.type}</td>
                          <td style={{ padding: '8px 10px', color: 'var(--muted)', textTransform: 'capitalize' }}>{l.recipient}</td>
                          <td style={{ padding: '8px 10px', color: 'var(--text)' }}>{fmt(l.amount)}</td>
                          <td style={{ padding: '8px 10px', color: l.rate > 0 ? ACCENT : 'var(--muted)' }}>{pct(l.rate)}</td>
                          <td style={{ padding: '8px 10px', fontWeight: 600, color: ACCENT }}>{fmt(l.deducted)}</td>
                          <td style={{ padding: '8px 10px' }}>{fmt(l.net)}</td>
                          <td style={{ padding: '8px 10px', color: 'var(--muted)', fontSize: '0.78rem' }}>{l.note}</td>
                        </tr>
                      ))}
                      <tr style={{ borderTop: '2px solid var(--border2)', fontWeight: 700 }}>
                        <td colSpan={4} style={{ padding: '8px 10px', color: 'var(--muted)' }}>Total WHT</td>
                        <td style={{ padding: '8px 10px', color: ACCENT }}>{fmt(results.whtResult.total)}</td>
                        <td colSpan={2} />
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Footer ── */}
        <div style={{ marginTop: 48, textAlign: 'center', color: 'var(--muted)',
          fontSize: '0.8rem', borderTop: '1px solid var(--border)', paddingTop: 24 }}>
          <p>Based on the <strong style={{ color: 'var(--text)' }}>Nigeria Tax Act 2025</strong> — Tinubu reform.
            {' '}For professional advice contact your tax consultant.
          </p>
          <p style={{ marginTop: 8 }}>
            Built by{' '}
            <a href="https://adediran.xyz/contact"
              style={{ color: ACCENT, textDecoration: 'none', fontWeight: 600 }}>
              Muhammed Adediran
            </a>
          </p>
        </div>

      </div>
    </div>
  )
}
