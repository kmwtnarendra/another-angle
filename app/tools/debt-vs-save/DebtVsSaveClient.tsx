"use client";

import { useState } from "react";
import ToolShell from "../../components/ToolShell";
import { calculateEMI, formatINR } from "../_lib/finance";

interface Result {
  emi: number;
  debtOutflow: number;
  inflatedCost: number;
  savingsValue: number;
  winner: "debt" | "save";
  saving: number;
  debtGain: number;
  saveGain: number;
}

function inflated(amount: number, rate: number, years: number) {
  return amount * Math.pow(1 + rate / 100, years);
}

function calculate(P: number, debtRate: number, months: number, saveRate: number, inflationRate: number): Result {
  const emi = calculateEMI(P, debtRate, months);
  const years = months / 12;
  const debtOutflow = emi * months;
  const inflatedCost = inflated(P, inflationRate, years);

  // Save: invest the same EMI each month at saveRate annually
  let savings = 0;
  for (let m = 1; m <= months; m++) {
    const yearsLeft = years - (m - 1) / 12;
    savings += emi * Math.pow(1 + saveRate / 100, yearsLeft);
  }

  const debtGain = inflatedCost - debtOutflow;   // positive = debt saves money vs future inflation
  const saveGain = savings - inflatedCost;         // positive = saving builds more than inflation costs

  const winner = debtGain > saveGain ? "debt" : "save";
  const saving = Math.abs(debtGain - saveGain);

  return { emi, debtOutflow, inflatedCost, savingsValue: savings, winner, saving, debtGain, saveGain };
}

export default function DebtVsSaveClient() {
  const [amount, setAmount]       = useState("1000000");
  const [debtRate, setDebtRate]   = useState("8");
  const [months, setMonths]       = useState("60");
  const [saveRate, setSaveRate]   = useState("6");
  const [inflation, setInflation] = useState("7");
  const [result, setResult]       = useState<Result | null>(null);
  const [error, setError]         = useState("");

  function run() {
    const P = parseFloat(amount);
    const R = parseFloat(debtRate);
    const T = parseInt(months);
    const S = parseFloat(saveRate);
    const I = parseFloat(inflation);
    if (!P || !R || !T || !S || !I || [P,R,T,S,I].some(v => v <= 0)) {
      setError("Please fill all fields with positive values.");
      return;
    }
    setError("");
    setResult(calculate(P, R, T, S, I));
  }

  const years = Math.round(parseInt(months || "0") / 12 * 10) / 10;

  return (
    <ToolShell title="Buy Now vs Save First" emoji="⚖️">
      <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginTop: "-0.5rem" }}>
        Should you take a loan now or save up first? This calculator compares both paths — factoring in loan interest, savings returns, and inflation.
      </p>

      <div className="card">
        <div className="fields-grid">
          <div className="field">
            <label>Purchase Amount (₹)</label>
            <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="e.g. 1000000" />
          </div>
          <div className="field">
            <label>Loan Interest Rate (% p.a.)</label>
            <input type="number" step="0.1" value={debtRate} onChange={e => setDebtRate(e.target.value)} placeholder="e.g. 8" />
          </div>
          <div className="field">
            <label>Loan Tenure (months)</label>
            <input type="number" value={months} onChange={e => setMonths(e.target.value)} placeholder="e.g. 60" />
          </div>
          <div className="field">
            <label>Savings Return (% p.a.)</label>
            <input type="number" step="0.1" value={saveRate} onChange={e => setSaveRate(e.target.value)} placeholder="e.g. 6" />
          </div>
          <div className="field">
            <label>Inflation Rate (% p.a.)</label>
            <input type="number" step="0.1" value={inflation} onChange={e => setInflation(e.target.value)} placeholder="e.g. 7" />
          </div>
        </div>
        <div style={{ marginTop: "1.25rem" }}>
          <button className="btn btn-primary" onClick={run}>Compare Plans</button>
        </div>
      </div>

      {error && <div className="banner banner-error">{error}</div>}

      {result && (
        <>
          {/* Winner banner */}
          <div className="banner banner-info fade-up" style={{ fontSize: "1rem", fontWeight: 700 }}>
            {result.winner === "debt"
              ? `✅ Taking the loan now is better — you save ${formatINR(result.saving)} compared to saving first.`
              : `✅ Saving first is better — you come out ${formatINR(result.saving)} ahead compared to taking the loan.`}
          </div>

          <div className="stat-grid fade-up">
            <div className="stat-card">
              <span className="stat-label">Monthly EMI</span>
              <span className="stat-value">{formatINR(result.emi)}</span>
            </div>
            <div className="stat-card">
              <span className="stat-label">Total Loan Outflow</span>
              <span className="stat-value">{formatINR(result.debtOutflow)}</span>
            </div>
            <div className="stat-card">
              <span className="stat-label">Item Cost in {years}y (inflation)</span>
              <span className="stat-value">{formatINR(result.inflatedCost)}</span>
            </div>
            <div className="stat-card">
              <span className="stat-label">Savings After {years}y</span>
              <span className="stat-value">{formatINR(result.savingsValue)}</span>
            </div>
          </div>

          {/* Explanation */}
          <div className="card fade-up" style={{ fontSize: "0.88rem", lineHeight: 1.7, color: "var(--text-muted)" }}>
            <h3 style={{ color: "var(--text)", fontWeight: 700, marginBottom: "0.75rem" }}>How this was calculated</h3>

            <p><strong style={{ color: "var(--text)" }}>Option A — Take the loan now:</strong>{" "}
              You borrow {formatINR(parseFloat(amount))} at {debtRate}% p.a. over {months} months.
              Your monthly EMI is {formatINR(result.emi)}, and your total outflow is{" "}
              {formatINR(result.debtOutflow)}.
              {result.debtGain > 0
                ? ` Because inflation will push the item's price to ${formatINR(result.inflatedCost)} in ${years} years, buying now actually saves you ${formatINR(result.debtGain)} vs waiting.`
                : ` However, the total interest you pay (${formatINR(result.debtOutflow - parseFloat(amount))}) makes this the more expensive path.`}
            </p>

            <p style={{ marginTop: "0.75rem" }}><strong style={{ color: "var(--text)" }}>Option B — Save the EMI amount monthly:</strong>{" "}
              Instead of borrowing, you invest {formatINR(result.emi)} every month at {saveRate}% p.a. for {months} months.
              After {years} years your corpus grows to {formatINR(result.savingsValue)},
              which {result.saveGain > 0 ? `exceeds the inflated cost by ${formatINR(result.saveGain)}` : `falls short of the inflated cost by ${formatINR(Math.abs(result.saveGain))}`}.
            </p>

            <p style={{ marginTop: "0.75rem", color: "var(--accent)", fontWeight: 600 }}>
              Bottom line: {result.winner === "debt"
                ? "The loan's interest cost is outweighed by buying at today's price before inflation hits."
                : "Your savings grow faster than the item's price rises — saving first wins."}
            </p>

            <p style={{ marginTop: "0.75rem", fontSize: "0.78rem", opacity: 0.6 }}>
              Disclaimer: This is a simplified model for general guidance only. Actual returns, EMI terms, and inflation vary. Consult a qualified financial advisor for personal decisions.
            </p>
          </div>

          {/* Cross-tool links */}
          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
            <a href={`/tools/emi/?p=${amount}&r=${debtRate}&t=${months}`} className="btn btn-ghost" style={{ fontSize: "0.85rem" }}>
              🏦 Open in EMI Calculator →
            </a>
            <a href={`/tools/sip/?p=${Math.round(result.emi)}&r=${saveRate}&t=${months}`} className="btn btn-ghost" style={{ fontSize: "0.85rem" }}>
              📈 Open in SIP Calculator →
            </a>
          </div>
        </>
      )}
    </ToolShell>
  );
}
