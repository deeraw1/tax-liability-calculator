# Nigeria Business Tax Calculator

An interactive tax liability calculator covering Nigeria's 2025 Tax Act reforms. Enter your business financials and get a full breakdown across CIT, Development Levy, VAT, and WHT — including the phased rate cuts running through 2027.

## What It Does

- Handles **2025 Tax Act** changes in full:
  - CIT banded rates by turnover tier (small, medium, large businesses)
  - Development Levy (new charge introduced in the 2025 Act)
  - Reformed WHT rates across payment categories
  - Phased CIT rate reductions scheduled through 2027
- Computes total tax liability across all applicable taxes simultaneously
- Breaks down each component line by line
- Shows effective tax rate vs statutory rate

## Taxes Covered

| Tax | Coverage |
|---|---|
| CIT (Companies Income Tax) | Banded rates, 2025 Act thresholds, 2025–2027 phase-down |
| Development Levy | New 2025 Act charge on companies |
| VAT | Standard rate on taxable supplies |
| WHT (Withholding Tax) | Reformed category rates under 2025 Act |

## Tech Stack

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- All computation is client-side — no data sent to any server

## Run Locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Data Sources

- FIRS Federal Inland Revenue Service — 2025 Finance Act provisions
- Nigeria Tax Act 2025

---

Built by [Muhammed Adediran](https://adediran.xyz/contact)
