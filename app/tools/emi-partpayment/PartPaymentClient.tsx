"use client";

import { useEffect, useState } from "react";
import ToolShell from "../../components/ToolShell";
import { calculateEMI, buildSchedule, applyPartPayments, formatINR, type EmiRow } from "../_lib/finance";

interface PP { amount: string; date: string; penaltyPercent: string }

/** A schedule row enriched with display-only fields that don't live in the
 *  shared finance.ts EmiRow shape. */
type DisplayRow = EmiRow & { noProfit?: boolean; remainingInterest?: number };

function defaultStart() {
  const d = new Date();
  d.setMonth(d.getMonth() + 1);
  d.setDate(1);
  return d.toISOString().split("T")[0];
}

/** Encode the part-payment list into a compact, URL-safe string: amount:date:penalty;amount:date:penalty */
function encodePps(pps: PP[]): string {
  return pps.map(p => `${p.amount}:${p.date}:${p.penaltyPercent || "0"}`).join(";");
}

function decodePps(raw: string | null): PP[] {
  if (!raw) return [];
  return raw
    .split(";")
    .filter(Boolean)
    .map(chunk => {
      const [amount, date, penaltyPercent] = chunk.split(":");
      return { amount: amount ?? "", date: date ?? "", penaltyPercent: penaltyPercent ?? "0" };
    })
    .filter(p => p.amount && p.date);
}

function buildShareUrl(state: { principal: string; rate: string; months: string; startDate: string; ppList: PP[] }) {
  const params = new URLSearchParams();
  params.set("p", state.principal);
  params.set("r", state.rate);
  params.set("t", state.months);
  params.set("d", state.startDate);
  if (state.ppList.length) params.set("pp", encodePps(state.ppList));
  return `${window.location.pathname}?${params.toString()}`;
}

/** Convert the UI's string-based part-payment list into the numeric shape
 *  applyPartPayments expects. */
function toApplyInput(list: PP[]) {
  return list.map(p => ({
    amount: parseFloat(p.amount),
    date: p.date,
    penaltyPercent: parseFloat(p.penaltyPercent || "0") || 0,
  }));
}

/** Total interest that would still accrue paying `opening` off via regular
 *  EMIs at `emiAmt`/`annualRate`, assuming NO further part payments. Like
 *  Closing (principal), this depends only on this row's own balance — never
 *  on what happens in rows after it — so a part payment added later never
 *  changes an earlier row's value. */
function remainingInterestFrom(opening: number, annualRate: number, emiAmt: number): number {
  let remaining = opening;
  let totalInterest = 0;
  // Safety cap avoids an infinite loop on pathological inputs (e.g. EMI too small to cover interest).
  for (let guard = 0; guard < 2000 && remaining > 0.01; guard++) {
    const interest = +(remaining * (annualRate / 12 / 100)).toFixed(2);
    let principalPart = +(emiAmt - interest).toFixed(2);
    if (principalPart <= 0) break;
    if (principalPart > remaining) principalPart = remaining;
    totalInterest = +(totalInterest + interest).toFixed(2);
    remaining = +(remaining - principalPart).toFixed(2);
  }
  return totalInterest;
}

export default function PartPaymentClient() {
  const [principal, setPrincipal] = useState("500000");
  const [rate, setRate]           = useState("10.5");
  const [months, setMonths]       = useState("60");
  const [startDate, setStartDate] = useState(defaultStart());

  const [ppAmount, setPpAmount]   = useState("");
  const [ppDate, setPpDate]       = useState("");
  const [ppPenalty, setPpPenalty] = useState("0");
  const [ppList, setPpList]       = useState<PP[]>([]);
  const [ppFlags, setPpFlags]     = useState<boolean[]>([]);
  const [ppError, setPpError]     = useState("");

  const [rows, setRows]           = useState<DisplayRow[]>([]);
  const [baseRows, setBaseRows]   = useState<EmiRow[]>([]);
  const [error, setError]         = useState("");
  const [shareStatus, setShareStatus] = useState<"idle" | "copied">("idle");

  // Optional schedule columns. #, Date, Principal and Closing are always
  // shown; everything else is opt-in so the table fits without horizontal
  // scrolling. Defaults to the bare minimum (safe for SSR); on mount, if
  // we're on a wide-enough screen, Interest is switched on too. The person
  // can turn any of these on or off from the checkboxes above the table.
  const [showOpening, setShowOpening]   = useState(false);
  const [showInterest, setShowInterest] = useState(false);
  const [showPenalty, setShowPenalty]   = useState(false);
  const [showClosingI, setShowClosingI] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && window.matchMedia("(min-width: 641px)").matches) {
      setShowInterest(true);
    }
  }, []);

  /** Core calculation, taking explicit inputs so it can be called both from
   *  the UI (using current state) and on initial page load (using URL params
   *  before state has necessarily settled). */
  function runCalculation(params: { P: number; R: number; T: number; startDate: string; pps: PP[] }) {
    const { P, R, T, startDate: sd, pps } = params;
    if (!P || !R || !T || P <= 0 || R <= 0 || T <= 0) {
      setError("Please fill in all fields with positive values.");
      return;
    }
    setError("");

    const base = buildSchedule(P, R, T, sd ? new Date(sd) : null);
    setBaseRows(base);

    const emiVal = calculateEMI(P, R, T);
    const withPP = applyPartPayments(base, toApplyInput(pps), R, emiVal);
    const totalInterestWithAll = withPP.reduce((s, r) => s + r.interest, 0);

    // Look up the real, penalty-adjusted amount charged on each part-payment
    // row (computed inside applyPartPayments) by matching on date.
    const rowByDate = new Map(withPP.filter(r => r.isPartPayment).map(r => [r.date, r]));

    // For each part payment, work out how much interest it alone is
    // responsible for saving (schedule without it, vs. schedule with
    // everything). If its penalty wipes out (or exceeds) that saving,
    // flag it as no-profit.
    const flags = pps.map((pp, idx) => {
      const others = pps.filter((_, i) => i !== idx);
      const scheduleWithout = applyPartPayments(base, toApplyInput(others), R, emiVal);
      const interestWithout = scheduleWithout.reduce((s, r) => s + r.interest, 0);
      const marginalSaved = interestWithout - totalInterestWithAll;
      const actualPenalty = rowByDate.get(pp.date)?.penaltyAmount || 0;
      return actualPenalty >= marginalSaved;
    });
    setPpFlags(flags);

    // Attach the no-profit flag and "Closing (I)" — the interest that would
    // still accrue paying this row's own closing balance off via regular
    // EMIs with NO further part payments. Like Closing (principal), this
    // depends only on the row's own state, so a part payment added LATER
    // never changes an earlier row's Closing (I).
    const enriched: DisplayRow[] = withPP.map(r => {
      const idx = r.isPartPayment ? pps.findIndex(p => p.date === r.date) : -1;
      return {
        ...r,
        noProfit: idx !== -1 ? flags[idx] : undefined,
        remainingInterest: remainingInterestFrom(r.closing, R, emiVal),
      };
    });

    setRows(enriched);
  }

  function calculate(pps = ppList) {
    runCalculation({
      P: parseFloat(principal),
      R: parseFloat(rate),
      T: parseInt(months),
      startDate,
      pps,
    });
    if (typeof window !== "undefined") {
      window.history.replaceState(null, "", buildShareUrl({ principal, rate, months, startDate, ppList: pps }));
    }
  }

  function addPP() {
    if (!ppAmount || !ppDate) { setPpError("Enter both amount and date."); return; }
    if (startDate && ppDate <= startDate) { setPpError("Part payment date must be after EMI start date."); return; }
    setPpError("");
    const next = [...ppList, { amount: ppAmount, date: ppDate, penaltyPercent: ppPenalty || "0" }];
    setPpList(next);
    setPpAmount(""); setPpDate(""); setPpPenalty("0");
    if (rows.length) calculate(next);
  }

  function removePP(i: number) {
    const next = ppList.filter((_, idx) => idx !== i);
    setPpList(next);
    if (rows.length) calculate(next);
  }

  async function handleShare() {
    if (typeof window === "undefined") return;
    window.history.replaceState(null, "", buildShareUrl({ principal, rate, months, startDate, ppList }));
    const url = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({ title: "Loan Part Payment Calculator", url });
      } catch {
        // user dismissed the native share sheet — nothing to do
      }
    } else {
      try {
        await navigator.clipboard.writeText(url);
        setShareStatus("copied");
        setTimeout(() => setShareStatus("idle"), 2000);
      } catch {
        // clipboard blocked — fail silently, URL is still in the address bar
      }
    }
  }

  // Hydrate from URL query params on first load, and auto-run the calculation
  // so a shared link reproduces the exact same result.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (!params.has("p")) return;

    const p = params.get("p") ?? principal;
    const r = params.get("r") ?? rate;
    const t = params.get("t") ?? months;
    const d = params.get("d") ?? startDate;
    const pps = decodePps(params.get("pp"));

    setPrincipal(p);
    setRate(r);
    setMonths(t);
    setStartDate(d);
    setPpList(pps);

    runCalculation({ P: parseFloat(p), R: parseFloat(r), T: parseInt(t), startDate: d, pps });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const emi          = baseRows.length ? baseRows[0].emi : 0;
  const baseInterest = baseRows.reduce((s, r) => s + r.interest, 0);
  const newInterest  = rows.reduce((s, r) => s + r.interest, 0);
  const saved        = baseInterest - newInterest;
  const newEmiCount  = rows.filter(r => !r.isPartPayment).length;
  const baseCount    = baseRows.length;

  const totalPrincipalPaid = rows.reduce((s, r) => s + r.principal, 0);
  const totalPenaltyPaid   = rows.reduce((s, r) => s + (r.penaltyAmount || 0), 0);
  const totalPaid          = totalPrincipalPaid + newInterest + totalPenaltyPaid;
  const netSavings         = saved - totalPenaltyPaid;

  const hasPartPayments = ppList.length > 0;
  const hasAnyPenalty   = ppList.some(p => (parseFloat(p.penaltyPercent || "0") || 0) > 0);
  const hasFlaggedPayment = ppFlags.some(Boolean);

  return (
    <>
    <ToolShell title="Loan Part Payment Calculator" emoji="💳">
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
        <div style={{ marginTop: "1.25rem", display: "flex", gap: "0.75rem", alignItems: "center" }}>
          <button className="btn btn-primary" onClick={() => calculate()}>Calculate</button>
          <button className="btn btn-ghost" onClick={handleShare}>
            {shareStatus === "copied" ? "Link copied!" : "Share"}
          </button>
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
          <div className="field">
            <label>Prepayment Penalty (%)</label>
            <input type="number" step="0.1" min="0" value={ppPenalty} onChange={e => setPpPenalty(e.target.value)} placeholder="e.g. 3" />
          </div>
        </div>
        {ppError && <div className="banner banner-error" style={{ marginTop: "0.75rem" }}>{ppError}</div>}
        <button className="btn btn-ghost" style={{ marginTop: "1rem" }} onClick={addPP}>+ Add Part Payment</button>

        {ppList.length > 0 && (
          <div style={{ marginTop: "1rem" }}>
            <table className="data-table" style={{ borderRadius: 8, overflow: "hidden" }}>
              <thead>
                <tr>
                  <th>#</th><th>Date</th><th>Amount</th>
                  {hasAnyPenalty && <><th>Penalty</th><th>Penalty ₹</th><th></th></>}
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {ppList.map((pp, i) => {
                  const penaltyPercent = parseFloat(pp.penaltyPercent || "0") || 0;
                  // Display-only estimate (ignores the interim-interest carve-out);
                  // the exact figure charged is shown in the schedule below.
                  const penaltyAmountEstimate = (parseFloat(pp.amount) || 0) * penaltyPercent / 100;
                  return (
                    <tr key={i}>
                      <td>{i + 1}</td>
                      <td>{pp.date}</td>
                      <td>{formatINR(parseFloat(pp.amount))}</td>
                      {hasAnyPenalty && (
                        <>
                          <td>{penaltyPercent}%</td>
                          <td>{formatINR(penaltyAmountEstimate)}</td>
                          <td>
                            {ppFlags[i] && (
                              <span title="This payment's penalty outweighed the interest it saved" style={{ color: "var(--danger)" }}>
                                ⚠️
                              </span>
                            )}
                          </td>
                        </>
                      )}
                      <td>
                        <button onClick={() => removePP(i)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--danger)", fontSize: "1rem" }}>✕</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Summary */}
      {rows.length > 0 && (
        <>
          <div className="stat-grid fade-up" style={{ gap: "0.5rem" }}>
            {[
              { label: "Monthly EMI", value: formatINR(emi) },
              { label: "Original Tenure", value: `${baseCount} months` },
              { label: "Total Principal Paid", value: formatINR(totalPrincipalPaid) },
              { label: "Total Interest Paid", value: formatINR(newInterest) },
              ...(hasPartPayments ? [
                { label: "New Tenure", value: `${newEmiCount} months` },
                { label: "Interest Saved", value: formatINR(saved), color: saved > 0 ? "var(--accent)" : "var(--danger)" },
                ...(hasAnyPenalty ? [
                  { label: "Total Penalty Paid", value: formatINR(totalPenaltyPaid), color: totalPenaltyPaid > 0 ? "var(--danger)" : undefined },
                  { label: "Net Savings (after penalty)", value: formatINR(netSavings), color: netSavings > 0 ? "var(--accent)" : "var(--danger)" },
                ] : []),
              ] : []),
              { label: "Total Amount Paid (all-in)", value: formatINR(totalPaid) },
            ].map((s, i) => (
              <div className="stat-card" key={i} style={{ padding: "0.55rem 0.7rem" }}>
                <span className="stat-label" style={{ fontSize: "0.68rem" }}>{s.label}</span>
                <span className="stat-value" style={{ fontSize: "0.95rem", color: (s as { color?: string }).color }}>{s.value}</span>
              </div>
            ))}
          </div>

          {hasPartPayments && hasAnyPenalty && netSavings <= 0 && (
            <div className="banner banner-error" style={{ marginTop: "1rem" }}>
              ⚠️ Overall, the prepayment penalties wiped out (or exceeded) the interest you saved — this part-payment plan didn't pay off financially.
            </div>
          )}
          {hasPartPayments && hasAnyPenalty && netSavings > 0 && hasFlaggedPayment && (
            <div className="banner banner-error" style={{ marginTop: "1rem" }}>
              ⚠️ One or more individual part payments (marked ⚠️ above) cost more in penalty than they saved in interest, even though the plan is profitable overall.
            </div>
          )}

          {/* Schedule */}
          <div className="fade-up">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.5rem", marginBottom: "0.75rem" }}>
              <h2 style={{ fontSize: "1rem", fontWeight: 700 }}>Repayment Schedule</h2>
              <div style={{ display: "flex", gap: "0.9rem", flexWrap: "wrap", fontSize: "0.78rem", color: "var(--muted, #666)" }}>
                <span style={{ fontWeight: 600 }}>Columns:</span>
                <label style={{ display: "flex", alignItems: "center", gap: "0.3rem", cursor: "pointer" }}>
                  <input type="checkbox" checked={showOpening} onChange={e => setShowOpening(e.target.checked)} /> Opening
                </label>
                <label style={{ display: "flex", alignItems: "center", gap: "0.3rem", cursor: "pointer" }}>
                  <input type="checkbox" checked={showInterest} onChange={e => setShowInterest(e.target.checked)} /> Interest
                </label>
                {hasAnyPenalty && (
                  <label style={{ display: "flex", alignItems: "center", gap: "0.3rem", cursor: "pointer" }}>
                    <input type="checkbox" checked={showPenalty} onChange={e => setShowPenalty(e.target.checked)} /> Penalty
                  </label>
                )}
                <label style={{ display: "flex", alignItems: "center", gap: "0.3rem", cursor: "pointer" }}>
                  <input type="checkbox" checked={showClosingI} onChange={e => setShowClosingI(e.target.checked)} /> Closing (I)
                </label>
              </div>
            </div>

            <style>{`
              .pp-schedule-table th, .pp-schedule-table td { padding: 0.45rem 0.5rem; font-size: 0.85rem; white-space: nowrap; }
              @media (max-width: 480px) {
                .pp-schedule-table th, .pp-schedule-table td { padding: 0.32rem 0.35rem; font-size: 0.72rem; }
              }
            `}</style>

            <div className="table-wrap">
              <table className="data-table pp-schedule-table">
                <thead>
                  <tr>
                    <th>#</th><th>Date</th>
                    {showOpening && <th>Opening</th>}
                    {showInterest && <th>Interest</th>}
                    <th>Principal</th>
                    {hasAnyPenalty && showPenalty && <th>Penalty</th>}
                    <th>Closing</th>
                    {showClosingI && <th>Closing (I)</th>}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r, i) => (
                    <tr key={i} className={r.isPartPayment ? "row-highlight" : ""}>
                      <td>
                        {r.isPartPayment ? "PP" : r.no}
                        {r.noProfit && (
                          <span title="Penalty outweighed the interest this payment saved" style={{ marginLeft: "0.3rem", color: "var(--danger)" }}>
                            ⚠️
                          </span>
                        )}
                      </td>
                      <td>{r.date ?? "—"}</td>
                      {showOpening && <td>{formatINR(r.opening)}</td>}
                      {showInterest && <td>{formatINR(r.interest)}</td>}
                      <td>{formatINR(r.principal)}</td>
                      {hasAnyPenalty && showPenalty && (
                        <td>{r.isPartPayment ? formatINR(r.penaltyAmount || 0) : "—"}</td>
                      )}
                      <td>{formatINR(r.closing)}</td>
                      {showClosingI && <td>{formatINR(r.remainingInterest || 0)}</td>}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>
        </>
      )}
    </ToolShell>

    {rows.length > 0 && (
      <button
        onClick={handleShare}
        aria-label={shareStatus === "copied" ? "Link copied" : "Share this calculation"}
        title={shareStatus === "copied" ? "Link copied!" : "Share this calculation"}
        style={{
          position: "fixed",
          bottom: "1.25rem",
          right: "1.25rem",
          zIndex: 100,
          width: "3.25rem",
          height: "3.25rem",
          borderRadius: "999px",
          border: "none",
          background: "var(--accent, #16a34a)",
          color: "#fff",
          fontSize: "1.35rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 4px 14px rgba(0,0,0,0.28)",
          cursor: "pointer",
        }}
      >
        {shareStatus === "copied" ? "✓" : "🔗"}
      </button>
    )}
    </>
  );
}
