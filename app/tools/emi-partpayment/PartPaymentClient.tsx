"use client";

import { useState } from "react";
import ToolShell from "../../components/ToolShell";
import { calculateEMI, buildSchedule, applyPartPayments, formatINR, type EmiRow } from "../_lib/finance";

interface PP { amount: string; date: string }

function defaultStart() {
  const d = new Date();
  d.setMonth(d.getMonth() + 1);
  d.setDate(1);
  return d.toISOString().split("T")[0];
}

export default function PartPaymentClient() {
  const [principal, setPrincipal] = useState("500000");
  const [rate, setRate]           = useState("10.5");
  const [months, setMonths]       = useState("60");
  const [startDate, setStartDate] = useState(defaultStart());

  const [ppAmount, setPpAmount]   = useState("");
  const [ppDate, setPpDate]       = useState("");
  const [ppList, setPpList]       = useState<PP[]>([]);
  const [ppError, setPpError]     = useState("");

  const [rows, setRows]           = useState<EmiRow[]>([]);
  const [baseRows, setBaseRows]   = useState<EmiRow[]>([]);
  const [error, setError]         = useState("");

  function calculate(pps = ppList) {
    const P = parseFloat(principal);
    const R = parseFloat(rate);
    const T = parseInt(months);
    if (!P || !R || !T || P <= 0 || R <= 0 || T <= 0) {
      setError("Please fill in all fields with positive values.");
      return;
    }
    setError("");
    const base = buildSchedule(P, R, T, startDate ? new Date(startDate) : null);
    setBaseRows(base);

    const withPP = applyPartPayments(
      base,
      pps.map(p => ({ amount: parseFloat(p.amount), date: p.date })),
      R,
      calculateEMI(P, R, T)
    );
    setRows(withPP);
  }

  function addPP() {
    if (!ppAmount || !ppDate) { setPpError("Enter both amount and date."); return; }
    if (startDate && ppDate <= startDate) { setPpError("Part payment date must be after EMI start date."); return; }
    setPpError("");
    const next = [...ppList, { amount: ppAmount, date: ppDate }];
    setPpList(next);
    setPpAmount(""); setPpDate("");
    if (rows.length) calculate(next);
  }

  function removePP(i: number) {
    const next = ppList.filter((_, idx) => idx !== i);
    setPpList(next);
    if (rows.length) calculate(next);
  }

  const emi          = baseRows.length ? baseRows[0].emi : 0;
  const baseInterest = baseRows.reduce((s, r) => s + r.interest, 0);
  const newInterest  = rows.filter(r => !r.isPartPayment).reduce((s, r) => s + r.interest, 0)
                     + rows.filter(r => r.isPartPayment).reduce((s, r) => s + r.interest, 0);
  const saved        = baseInterest - newInterest;
  const newEmiCount  = rows.filter(r => !r.isPartPayment).length;
  const baseCount    = baseRows.length;

  return (
    <ToolShell title="Part Payment Calculator" emoji="💳">
      {/* Loan inputs */}
      <div className="card">
        <div className="fields-grid">
          <div className="field">
            <label>Loan Amount (₹)</label>
            <input type="number" value={principal} onChange={e => setPrincipal(e.target.value)} />
          </div>
          <div className="field">
            <label>Interest Rate (% p.a.)</label>
            <input type="number" step="0.1" value={rate} onChange={e => setRate(e.target.value)} />
          </div>
          <div className="field">
            <label>Tenure (months)</label>
            <input type="number" value={months} onChange={e => setMonths(e.target.value)} />
          </div>
          <div className="field">
            <label>First EMI Date</label>
            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
          </div>
        </div>
        <div style={{ marginTop: "1.25rem" }}>
          <button className="btn btn-primary" onClick={() => calculate()}>Calculate</button>
        </div>
      </div>

      {error && <div className="banner banner-error">{error}</div>}

      {/* Part payments */}
      <div className="card">
        <h2 style={{ fontSize: "0.95rem", fontWeight: 700, marginBottom: "1rem" }}>Add Part Payments</h2>
        <div className="fields-grid">
          <div className="field">
            <label>Amount (₹)</label>
            <input type="number" value={ppAmount} onChange={e => setPpAmount(e.target.value)} placeholder="e.g. 50000" />
          </div>
          <div className="field">
            <label>Payment Date</label>
            <input type="date" value={ppDate} onChange={e => setPpDate(e.target.value)} />
          </div>
        </div>
        {ppError && <div className="banner banner-error" style={{ marginTop: "0.75rem" }}>{ppError}</div>}
        <button className="btn btn-ghost" style={{ marginTop: "1rem" }} onClick={addPP}>+ Add Part Payment</button>

        {ppList.length > 0 && (
          <div style={{ marginTop: "1rem" }}>
            <table className="data-table" style={{ borderRadius: 8, overflow: "hidden" }}>
              <thead><tr><th>#</th><th>Date</th><th>Amount</th><th></th></tr></thead>
              <tbody>
                {ppList.map((pp, i) => (
                  <tr key={i}>
                    <td>{i + 1}</td>
                    <td>{pp.date}</td>
                    <td>{formatINR(parseFloat(pp.amount))}</td>
                    <td>
                      <button onClick={() => removePP(i)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--danger)", fontSize: "1rem" }}>✕</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Summary */}
      {rows.length > 0 && (
        <>
          <div className="stat-grid fade-up">
            <div className="stat-card">
              <span className="stat-label">Monthly EMI</span>
              <span className="stat-value">{formatINR(emi)}</span>
            </div>
            <div className="stat-card">
              <span className="stat-label">Original Tenure</span>
              <span className="stat-value">{baseCount} months</span>
            </div>
            <div className="stat-card">
              <span className="stat-label">New Tenure</span>
              <span className="stat-value">{newEmiCount} months</span>
            </div>
            <div className="stat-card">
              <span className="stat-label">Interest Saved</span>
              <span className="stat-value" style={{ color: saved > 0 ? "var(--accent)" : "var(--danger)" }}>
                {formatINR(saved)}
              </span>
            </div>
          </div>

          {/* Schedule */}
          <div className="fade-up">
            <h2 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "0.75rem" }}>Repayment Schedule</h2>
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>#</th><th>Date</th><th>Type</th><th>Opening</th>
                    <th>Interest</th><th>Principal</th><th>Closing</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r, i) => (
                    <tr key={i} className={r.isPartPayment ? "row-highlight" : ""}>
                      <td>{r.isPartPayment ? "PP" : r.no}</td>
                      <td>{r.date ?? "—"}</td>
                      <td>{r.isPartPayment ? "Part Payment" : "EMI"}</td>
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
    </ToolShell>
  );
}
