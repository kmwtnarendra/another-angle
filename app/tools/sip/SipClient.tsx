"use client";

import { useState } from "react";
import ToolShell from "../../components/ToolShell";
import { formatINR } from "../_lib/finance";

interface SipRow {
  no: number;
  date: string | null;
  opening: number;
  invested: number;
  gain: number;
  closing: number;
}

function buildSipSchedule(
  monthly: number,
  annualRate: number,
  months: number,
  startDate?: Date | null
): SipRow[] {
  const r = annualRate / 12 / 100;
  const rows: SipRow[] = [];
  let total = 0;
  const date = startDate ? new Date(startDate) : null;

  for (let i = 1; i <= months; i++) {
    const opening = total;
    total = (total + monthly) * (1 + r);
    const gain = +(total - opening - monthly).toFixed(2);

    rows.push({
      no: i,
      date: date ? date.toISOString().split("T")[0] : null,
      opening: +opening.toFixed(2),
      invested: monthly,
      gain,
      closing: +total.toFixed(2),
    });

    if (date) date.setMonth(date.getMonth() + 1);
  }

  return rows;
}

function defaultStart() {
  const d = new Date();
  d.setDate(1);
  return d.toISOString().split("T")[0];
}

export default function SipClient() {
  const [monthly, setMonthly]     = useState("5000");
  const [rate, setRate]           = useState("12");
  const [months, setMonths]       = useState("60");
  const [startDate, setStartDate] = useState(defaultStart());
  const [rows, setRows]           = useState<SipRow[]>([]);
  const [error, setError]         = useState("");

  function calculate() {
    const M = parseFloat(monthly);
    const R = parseFloat(rate);
    const T = parseInt(months);
    if (!M || !R || !T || M <= 0 || R <= 0 || T <= 0) {
      setError("Please fill in all fields with positive values.");
      return;
    }
    setError("");
    setRows(buildSipSchedule(M, R, T, startDate ? new Date(startDate) : null));
  }

  const totalInvested = rows.reduce((s, r) => s + r.invested, 0);
  const futureValue   = rows.length ? rows[rows.length - 1].closing : 0;
  const estimatedGain = futureValue - totalInvested;

  return (
    <ToolShell title="SIP Calculator" emoji="📈">
      <div className="card">
        <div className="fields-grid">
          <div className="field">
            <label>Monthly Investment (₹)</label>
            <input type="number" value={monthly} onChange={e => setMonthly(e.target.value)} placeholder="e.g. 5000" />
          </div>
          <div className="field">
            <label>Expected Return (% p.a.)</label>
            <input type="number" step="0.1" value={rate} onChange={e => setRate(e.target.value)} placeholder="e.g. 12" />
          </div>
          <div className="field">
            <label>Duration (months)</label>
            <input type="number" value={months} onChange={e => setMonths(e.target.value)} placeholder="e.g. 60" />
          </div>
          <div className="field">
            <label>Start Date</label>
            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
          </div>
        </div>
        <div style={{ marginTop: "1.25rem" }}>
          <button className="btn btn-primary" onClick={calculate}>Calculate</button>
        </div>
      </div>

      {error && <div className="banner banner-error">{error}</div>}

      {rows.length > 0 && (
        <>
          <div className="stat-grid fade-up">
            <div className="stat-card">
              <span className="stat-label">Total Invested</span>
              <span className="stat-value">{formatINR(totalInvested)}</span>
            </div>
            <div className="stat-card">
              <span className="stat-label">Estimated Gain</span>
              <span className="stat-value">{formatINR(estimatedGain)}</span>
            </div>
            <div className="stat-card">
              <span className="stat-label">Future Value</span>
              <span className="stat-value">{formatINR(futureValue)}</span>
            </div>
          </div>

          <div className="fade-up">
            <h2 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "0.75rem" }}>SIP Schedule</h2>
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>#</th><th>Date</th><th>Opening</th>
                    <th>Invested</th><th>Gain</th><th>Closing</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map(r => (
                    <tr key={r.no}>
                      <td>{r.no}</td>
                      <td>{r.date ?? "—"}</td>
                      <td>{formatINR(r.opening)}</td>
                      <td>{formatINR(r.invested)}</td>
                      <td>{formatINR(r.gain)}</td>
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
