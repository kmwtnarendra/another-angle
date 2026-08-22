"use client";

import { useState } from "react";
import ToolShell from "../../components/ToolShell";
import { calculateEMI, buildSchedule, formatINR, type EmiRow } from "../_lib/finance";

function defaultStart() {
  const d = new Date();
  d.setMonth(d.getMonth() + 1);
  d.setDate(1);
  return d.toISOString().split("T")[0];
}

export default function EmiClient() {
  const [principal, setPrincipal] = useState("100000");
  const [rate, setRate] = useState("10.5");
  const [months, setMonths] = useState("24");
  const [startDate, setStartDate] = useState(defaultStart());
  const [rows, setRows] = useState<EmiRow[]>([]);
  const [error, setError] = useState("");

  function calculate() {
    const P = parseFloat(principal);
    const R = parseFloat(rate);
    const T = parseInt(months);
    if (!P || !R || !T || P <= 0 || R <= 0 || T <= 0) {
      setError("Please fill in all fields with positive values.");
      return;
    }
    setError("");
    setRows(buildSchedule(P, R, T, startDate ? new Date(startDate) : null));
  }

  function share() {
    const url = `${window.location.origin}/tools/emi/?p=${principal}&r=${rate}&t=${months}&d=${startDate}`;
    if (navigator.share) {
      navigator.share({ title: "EMI Calculator", url });
    } else {
      navigator.clipboard.writeText(url);
    }
  }

  const emi = rows.length ? rows[0].emi : 0;
  const totalInterest = rows.reduce((s, r) => s + r.interest, 0);
  const totalPayment = rows.reduce((s, r) => s + r.emi, 0);

  return (
    <ToolShell title="EMI Calculator" emoji="🏦">
      {/* Inputs */}
      <div className="card">
        <div className="fields-grid">
          <div className="field">
            <label>Loan Amount (₹)</label>
            <input type="number" value={principal} onChange={e => setPrincipal(e.target.value)} placeholder="e.g. 500000" />
          </div>
          <div className="field">
            <label>Interest Rate (% p.a.)</label>
            <input type="number" step="0.1" value={rate} onChange={e => setRate(e.target.value)} placeholder="e.g. 10.5" />
          </div>
          <div className="field">
            <label>Tenure (months)</label>
            <input type="number" value={months} onChange={e => setMonths(e.target.value)} placeholder="e.g. 24" />
          </div>
          <div className="field">
            <label>First EMI Date</label>
            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
          </div>
        </div>
        <div style={{ marginTop: "1.25rem" }}>
          <button className="btn btn-primary" onClick={calculate}>Calculate EMI</button>
        </div>
      </div>

      {error && <div className="banner banner-error">{error}</div>}

      {/* Summary */}
      {rows.length > 0 && (
        <>
          <div className="stat-grid fade-up">
            <div className="stat-card">
              <span className="stat-label">Monthly EMI</span>
              <span className="stat-value">{formatINR(emi)}</span>
            </div>
            <div className="stat-card">
              <span className="stat-label">Total Interest</span>
              <span className="stat-value">{formatINR(totalInterest)}</span>
            </div>
            <div className="stat-card">
              <span className="stat-label">Total Payment</span>
              <span className="stat-value">{formatINR(totalPayment)}</span>
            </div>
          </div>

          {/* Part Payment link */}
          <div className="banner banner-info fade-up" style={{ fontSize: "0.85rem" }}>
            💡 Want to see how a part payment reduces your loan?{" "}
            <a
              href={`/tools/emi-partpayment/?p=${principal}&r=${rate}&t=${months}&d=${startDate}`}
              style={{ color: "var(--accent)", fontWeight: 600 }}
            >
              Try the Part Payment Calculator →
            </a>
          </div>

          {/* Schedule */}
          <div className="fade-up">
            <h2 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "0.75rem" }}>Repayment Schedule</h2>
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Date</th>
                    <th>EMI</th>
                    <th>Opening</th>
                    <th>Interest</th>
                    <th>Principal</th>
                    <th>Closing</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.no}>
                      <td>{r.no}</td>
                      <td>{r.date ?? "—"}</td>
                      <td>{formatINR(r.emi)}</td>
                      <td>{formatINR(r.opening)}</td>
                      <td>{formatINR(r.interest)}</td>
                      <td>{formatINR(r.principal)}</td>
                      <td>{formatINR(r.closing)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {rows.length > 0 && (
        <button className="share-fab" onClick={share} title="Share this calculation">🔗</button>
      )}
    </ToolShell>
  );
}
