"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import ToolShell from "../../components/ToolShell";
import { calculateEMI, formatINR } from "../_lib/finance";

// ── Finance math ──────────────────────────────────────────────────────────────
function calcInflated(P: number, annualPct: number, years: number) {
  return P * Math.pow(1 + annualPct / 100, years);
}

// SIP future value: invest `monthly` at the START of each month, compound monthly
function calcSIPFV(monthly: number, annualPct: number, months: number) {
  const r = annualPct / 12 / 100;
  if (r === 0) return monthly * months;
  // FV of annuity-due (payment at start of period)
  return monthly * ((Math.pow(1 + r, months) - 1) / r) * (1 + r);
}

interface Result {
  emi: number;
  totalDebtOutflow: number;
  totalInterestPaid: number;
  inflatedCost: number;
  sipCorpus: number;
  winner: "debt" | "save";
  // How much better the winner is vs the loser (real-terms)
  advantage: number;
  // Real cost of debt path = total outflow (paid in today-₹ equivalent)
  // Real cost of save path = inflated price (what you pay later)
  debtRealCost: number;
  saveRealCost: number;
}

function compute(
  P: number, debtRate: number, months: number,
  saveRate: number, inflationRate: number
): Result {
  const emi             = calculateEMI(P, debtRate, months);
  const totalDebtOutflow = +(emi * months).toFixed(2);
  const totalInterestPaid = +(totalDebtOutflow - P).toFixed(2);
  const years           = months / 12;
  const inflatedCost    = +calcInflated(P, inflationRate, years).toFixed(2);
  const sipCorpus       = +calcSIPFV(emi, saveRate, months).toFixed(2);

  // Real-terms comparison:
  // Debt path cost  = what you actually pay out (EMI × months)
  // Save path cost  = inflated price of the item when you eventually buy
  // Save path gain  = your SIP corpus - inflated cost (surplus or deficit)
  const debtRealCost = totalDebtOutflow;
  const saveRealCost = inflatedCost - sipCorpus; // negative = surplus (save wins)

  // Winner: whichever path leaves you with more money / less outgo
  // debt advantage = inflatedCost - totalDebtOutflow  (positive = debt cheaper vs inflation)
  // save advantage = sipCorpus - inflatedCost          (positive = save built enough)
  const debtAdv = inflatedCost - totalDebtOutflow;
  const saveAdv = sipCorpus - inflatedCost;

  const winner: "debt" | "save" = debtAdv > saveAdv ? "debt" : "save";
  const advantage = Math.abs(debtAdv - saveAdv);

  return { emi, totalDebtOutflow, totalInterestPaid, inflatedCost, sipCorpus, winner, advantage, debtRealCost, saveRealCost };
}

// ── i18n strings (English + Hindi) ───────────────────────────────────────────
const T = {
  en: {
    subtitle: "Should you take a loan now or save up first? Enter the numbers — the calculator does the rest.",
    labelAmount: "Purchase Amount (₹)",
    labelDebtRate: "Loan Interest Rate (% per year)",
    labelMonths: "Loan Period (months)",
    labelSaveRate: "Expected Savings Return (% per year)",
    labelInflation: "Expected Inflation (% per year)",
    hintAmount: "Price of what you want to buy today",
    hintDebtRate: "Interest rate your bank charges",
    hintMonths: "How many months to repay",
    hintSaveRate: "Return you'd earn saving instead (FD, mutual fund, etc.)",
    hintInflation: "How much prices rise per year (India avg ~6–7%)",
    winnerDebt: (amt: string) => `✅ Taking the loan now is the smarter choice — you come out ${amt} ahead compared to saving first.`,
    winnerSave: (amt: string) => `✅ Saving first is the smarter choice — you end up ${amt} better off than taking a loan.`,
    monthlyEMI: "Monthly EMI",
    totalPaid: "Total You Pay",
    interestCost: "Interest Cost",
    futurePrice: "Future Price (inflation)",
    sipCorpus: "Savings Corpus (SIP)",
    advantage: "Your Advantage",
    sectionSimple: "In Simple Words",
    sectionMath: "The Math Behind It",
    sectionPro: "For Finance Professionals",
    debtPathTitle: "Path A — Take a Loan Now",
    savePathTitle: "Path B — Save First",
    disclaimer: "This is a simplified model for education only. Actual returns, EMI terms, and inflation vary. Please consult a qualified financial advisor before making major financial decisions.",
    emiLink: "🏦 See Full EMI Schedule →",
    sipLink: "📈 See Full SIP Schedule →",
    share: "Share",
    copied: "Copied!",
    langToggle: "हिंदी में देखें",
  },
  hi: {
    subtitle: "क्या आपको अभी लोन लेना चाहिए या पहले बचत करनी चाहिए? नंबर डालें — कैलकुलेटर बाकी काम करेगा।",
    labelAmount: "खरीद राशि (₹)",
    labelDebtRate: "लोन की ब्याज दर (% प्रति वर्ष)",
    labelMonths: "लोन अवधि (महीने)",
    labelSaveRate: "बचत पर अपेक्षित रिटर्न (% प्रति वर्ष)",
    labelInflation: "अपेक्षित महंगाई दर (% प्रति वर्ष)",
    hintAmount: "आज जो चीज़ खरीदनी है उसकी कीमत",
    hintDebtRate: "बैंक जो ब्याज लेता है",
    hintMonths: "कितने महीनों में चुकाना है",
    hintSaveRate: "बचत करने पर मिलने वाला रिटर्न (FD, म्यूचुअल फंड आदि)",
    hintInflation: "हर साल कीमतें कितनी बढ़ती हैं (भारत में औसत ~6–7%)",
    winnerDebt: (amt: string) => `✅ अभी लोन लेना ज़्यादा फायदेमंद है — बचत करने के मुकाबले आप ${amt} आगे रहते हैं।`,
    winnerSave: (amt: string) => `✅ पहले बचत करना ज़्यादा फायदेमंद है — लोन लेने के मुकाबले आप ${amt} बेहतर स्थिति में रहते हैं।`,
    monthlyEMI: "मासिक EMI",
    totalPaid: "कुल भुगतान",
    interestCost: "ब्याज का बोझ",
    futurePrice: "भविष्य की कीमत (महंगाई)",
    sipCorpus: "बचत कोष (SIP)",
    advantage: "आपका फायदा",
    sectionSimple: "आसान भाषा में",
    sectionMath: "गणित की जानकारी",
    sectionPro: "वित्त विशेषज्ञों के लिए",
    debtPathTitle: "विकल्प A — अभी लोन लें",
    savePathTitle: "विकल्प B — पहले बचत करें",
    disclaimer: "यह केवल शैक्षिक उद्देश्य के लिए एक सरलीकृत मॉडल है। वास्तविक रिटर्न, EMI शर्तें और महंगाई दर अलग हो सकती हैं। बड़े वित्तीय निर्णय लेने से पहले किसी योग्य वित्तीय सलाहकार से परामर्श करें।",
    emiLink: "🏦 पूरा EMI शेड्यूल देखें →",
    sipLink: "📈 पूरा SIP शेड्यूल देखें →",
    share: "शेयर करें",
    copied: "कॉपी हो गया!",
    langToggle: "View in English",
  },
};

// ── Sub-components ────────────────────────────────────────────────────────────
function Field({
  label, hint, value, onChange, step = "1",
}: { label: string; hint: string; value: string; onChange: (v: string) => void; step?: string }) {
  return (
    <div className="field">
      <label style={{ fontSize: "0.82rem" }}>{label}</label>
      <input
        type="number" step={step} value={value}
        onChange={e => onChange(e.target.value)}
        style={{ fontSize: "1rem", fontWeight: 600 }}
      />
      <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginTop: "0.15rem" }}>{hint}</span>
    </div>
  );
}

function StatCard({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="stat-card" style={accent ? { borderColor: "rgba(124,245,196,0.5)", background: "rgba(124,245,196,0.15)" } : {}}>
      <span className="stat-label">{label}</span>
      <span className="stat-value" style={{ fontSize: "1.1rem" }}>{value}</span>
    </div>
  );
}

function BarComparison({ debtVal, saveVal, debtLabel, saveLabel }: {
  debtVal: number; saveVal: number; debtLabel: string; saveLabel: string;
}) {
  const max    = Math.max(debtVal, saveVal);
  const debtW  = max > 0 ? (debtVal / max) * 100 : 0;
  const saveW  = max > 0 ? (saveVal / max) * 100 : 0;
  const debtWins = debtVal <= saveVal;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
      {[
        { label: debtLabel, pct: debtW, val: debtVal, wins: debtWins },
        { label: saveLabel, pct: saveW, val: saveVal, wins: !debtWins },
      ].map(({ label, pct, val, wins }) => (
        <div key={label}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.78rem", marginBottom: "0.2rem" }}>
            <span style={{ color: "var(--text-muted)" }}>{label}</span>
            <span style={{ fontWeight: 700, color: wins ? "var(--accent)" : "var(--text)" }}>
              {formatINR(val)} {wins ? "✓" : ""}
            </span>
          </div>
          <div style={{ height: 10, background: "var(--bg-input)", borderRadius: 5, overflow: "hidden" }}>
            <div style={{
              height: "100%", width: `${pct}%`,
              background: wins ? "var(--accent)" : "rgba(255,255,255,0.2)",
              borderRadius: 5, transition: "width 0.4s ease",
            }} />
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function DebtVsSaveClient() {
  const [lang, setLang] = useState<"en" | "hi">("en");
  const [amount,    setAmount]    = useState("1000000");
  const [debtRate,  setDebtRate]  = useState("8");
  const [months,    setMonths]    = useState("60");
  const [saveRate,  setSaveRate]  = useState("7");
  const [inflation, setInflation] = useState("6");
  const [copied,    setCopied]    = useState(false);
  const didLoad = useRef(false);

  const t = T[lang];

  // Load from URL on first render
  useEffect(() => {
    if (didLoad.current) return;
    didLoad.current = true;
    const p = new URLSearchParams(window.location.search);
    if (p.get("p"))   setAmount(p.get("p")!);
    if (p.get("r"))   setDebtRate(p.get("r")!);
    if (p.get("t"))   setMonths(p.get("t")!);
    if (p.get("sr"))  setSaveRate(p.get("sr")!);
    if (p.get("ir"))  setInflation(p.get("ir")!);
    if (p.get("lang") === "hi") setLang("hi");
  }, []);

  // Sync to URL on every change
  useEffect(() => {
    const p = new URLSearchParams();
    p.set("p",   amount);
    p.set("r",   debtRate);
    p.set("t",   months);
    p.set("sr",  saveRate);
    p.set("ir",  inflation);
    if (lang === "hi") p.set("lang", "hi");
    window.history.replaceState(null, "", "?" + p.toString());
  }, [amount, debtRate, months, saveRate, inflation, lang]);

  // Parse inputs
  const P  = parseFloat(amount)   || 0;
  const R  = parseFloat(debtRate) || 0;
  const T2 = parseInt(months)     || 0;
  const S  = parseFloat(saveRate) || 0;
  const I  = parseFloat(inflation)|| 0;
  const valid = P > 0 && R > 0 && T2 > 0 && S > 0 && I > 0;

  // Compute result live (no button)
  const result = useMemo<Result | null>(() => {
    if (!valid) return null;
    return compute(P, R, T2, S, I);
  }, [P, R, T2, S, I, valid]); // eslint-disable-line

  const years = +(T2 / 12).toFixed(1);

  async function share() {
    const url = window.location.href;
    try {
      if (navigator.share) await navigator.share({ title: "Debt vs Save Calculator — Another Angle", url });
      else { await navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 2500); }
    } catch { await navigator.clipboard.writeText(url).catch(() => {}); }
  }

  // EMI/SIP cross-links with all params pre-filled
  const emiLink = result ? `/tools/emi/?p=${Math.round(P)}&r=${R}&t=${T2}&auto=true` : "/tools/emi/";
  const sipLink = result ? `/tools/sip/?p=${Math.round(result.emi)}&r=${S}&t=${T2}&auto=true` : "/tools/sip/";

  return (
    <ToolShell title="Buy Now vs Save First" emoji="⚖️">

      {/* Language toggle */}
      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "-0.5rem" }}>
        <button
          className="btn btn-ghost"
          style={{ fontSize: "0.78rem", padding: "0.3rem 0.75rem" }}
          onClick={() => setLang(l => l === "en" ? "hi" : "en")}
        >
          {t.langToggle}
        </button>
      </div>

      <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", lineHeight: 1.6, marginTop: "-0.25rem" }}>
        {t.subtitle}
      </p>

      {/* ── Inputs ── */}
      <div className="card">
        <div className="fields-grid">
          <Field label={t.labelAmount}    hint={t.hintAmount}    value={amount}    onChange={setAmount} />
          <Field label={t.labelDebtRate}  hint={t.hintDebtRate}  value={debtRate}  onChange={setDebtRate}  step="0.1" />
          <Field label={t.labelMonths}    hint={t.hintMonths}    value={months}    onChange={setMonths} />
          <Field label={t.labelSaveRate}  hint={t.hintSaveRate}  value={saveRate}  onChange={setSaveRate}  step="0.1" />
          <Field label={t.labelInflation} hint={t.hintInflation} value={inflation} onChange={setInflation} step="0.1" />
        </div>
      </div>

      {result && (
        <>
          {/* ── Winner banner ── */}
          <div className="banner banner-info" style={{ fontSize: "1rem", fontWeight: 700, lineHeight: 1.5 }}>
            {result.winner === "debt"
              ? t.winnerDebt(formatINR(result.advantage))
              : t.winnerSave(formatINR(result.advantage))}
          </div>

          {/* ── Stat cards ── */}
          <div className="stat-grid">
            <StatCard label={t.monthlyEMI}  value={formatINR(result.emi)} />
            <StatCard label={t.totalPaid}   value={formatINR(result.totalDebtOutflow)} />
            <StatCard label={t.interestCost} value={formatINR(result.totalInterestPaid)} />
            <StatCard label={t.futurePrice} value={formatINR(result.inflatedCost)} />
            <StatCard label={t.sipCorpus}   value={formatINR(result.sipCorpus)} />
            <StatCard label={t.advantage}   value={formatINR(result.advantage)} accent />
          </div>

          {/* ── Visual comparison bar ── */}
          <div className="card">
            <div style={{ fontWeight: 700, fontSize: "0.85rem", marginBottom: "0.9rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Cost Comparison — lower is better
            </div>
            <BarComparison
              debtVal={result.totalDebtOutflow}
              saveVal={result.inflatedCost}
              debtLabel={lang === "hi" ? "लोन लेने पर कुल भुगतान" : "Total paid if you take a loan"}
              saveLabel={lang === "hi" ? "भविष्य में कीमत (महंगाई के साथ)" : "Future price of item (with inflation)"}
            />
            <div style={{ marginTop: "1rem" }}>
              <div style={{ fontWeight: 700, fontSize: "0.85rem", marginBottom: "0.9rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                Savings Corpus vs Future Price
              </div>
              <BarComparison
                debtVal={result.sipCorpus}
                saveVal={result.inflatedCost}
                debtLabel={lang === "hi" ? "SIP से बनेगा कोष" : "SIP corpus you'd build"}
                saveLabel={lang === "hi" ? "भविष्य की कीमत" : "Future price you'd need to pay"}
              />
            </div>
          </div>

          {/* ── Simple explanation (for beginners) ── */}
          <details open>
            <summary style={{ fontWeight: 700, fontSize: "0.95rem", cursor: "pointer", padding: "0.5rem 0", listStyle: "none", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span style={{ color: "var(--accent)" }}>💡</span> {t.sectionSimple}
            </summary>
            <div className="card" style={{ marginTop: "0.75rem", fontSize: "0.88rem", lineHeight: 1.8, color: "var(--text-muted)" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                {/* Debt path */}
                <div style={{ borderRight: "1px solid var(--border)", paddingRight: "1rem" }}>
                  <div style={{ fontWeight: 700, color: "var(--text)", marginBottom: "0.5rem" }}>
                    {result.winner === "debt" ? "✅ " : "❌ "}{t.debtPathTitle}
                  </div>
                  <ul style={{ paddingLeft: "1.2rem", margin: 0 }}>
                    <li>You get the item <strong style={{ color: "var(--text)" }}>today</strong> at today's price</li>
                    <li>Pay <strong style={{ color: "var(--text)" }}>{formatINR(result.emi)}</strong>/month for {T2} months</li>
                    <li>Total out of pocket: <strong style={{ color: "var(--text)" }}>{formatINR(result.totalDebtOutflow)}</strong></li>
                    <li>Interest paid to bank: <strong style={{ color: "var(--text)" }}>{formatINR(result.totalInterestPaid)}</strong></li>
                  </ul>
                </div>
                {/* Save path */}
                <div>
                  <div style={{ fontWeight: 700, color: "var(--text)", marginBottom: "0.5rem" }}>
                    {result.winner === "save" ? "✅ " : "❌ "}{t.savePathTitle}
                  </div>
                  <ul style={{ paddingLeft: "1.2rem", margin: 0 }}>
                    <li>Save <strong style={{ color: "var(--text)" }}>{formatINR(result.emi)}</strong>/month (same amount) for {T2} months</li>
                    <li>Your money grows to <strong style={{ color: "var(--text)" }}>{formatINR(result.sipCorpus)}</strong></li>
                    <li>But the item will cost <strong style={{ color: "var(--text)" }}>{formatINR(result.inflatedCost)}</strong> by then (inflation)</li>
                    <li>
                      {result.sipCorpus >= result.inflatedCost
                        ? <span>You can afford it and have <strong style={{ color: "var(--accent)" }}>{formatINR(result.sipCorpus - result.inflatedCost)}</strong> left over ✓</span>
                        : <span>You'd still be <strong style={{ color: "#f87171" }}>{formatINR(result.inflatedCost - result.sipCorpus)}</strong> short ✗</span>}
                    </li>
                  </ul>
                </div>
              </div>
              <div style={{ marginTop: "1rem", padding: "0.75rem", background: "rgba(124,245,196,0.08)", borderRadius: 8, borderLeft: "3px solid var(--accent)", fontWeight: 600, color: "var(--text)" }}>
                {result.winner === "debt"
                  ? (lang === "hi"
                      ? `लोन लेना इसलिए बेहतर है क्योंकि महंगाई के कारण चीज़ की भविष्य की कीमत (${formatINR(result.inflatedCost)}) आपके कुल EMI भुगतान (${formatINR(result.totalDebtOutflow)}) से ज़्यादा है।`
                      : `Loan is better because inflation makes the future price (${formatINR(result.inflatedCost)}) higher than your total EMI payments (${formatINR(result.totalDebtOutflow)}).`)
                  : (lang === "hi"
                      ? `बचत करना इसलिए बेहतर है क्योंकि आपका SIP कोष (${formatINR(result.sipCorpus)}) भविष्य की कीमत (${formatINR(result.inflatedCost)}) से ज़्यादा है।`
                      : `Saving is better because your SIP corpus (${formatINR(result.sipCorpus)}) beats the future price (${formatINR(result.inflatedCost)}).`)}
              </div>
            </div>
          </details>

          {/* ── Math explanation (intermediate) ── */}
          <details>
            <summary style={{ fontWeight: 700, fontSize: "0.95rem", cursor: "pointer", padding: "0.5rem 0", listStyle: "none", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span style={{ color: "var(--accent)" }}>🧮</span> {t.sectionMath}
            </summary>
            <div className="card" style={{ marginTop: "0.75rem", fontSize: "0.85rem", lineHeight: 1.85, color: "var(--text-muted)" }}>
              <p>
                <strong style={{ color: "var(--text)" }}>EMI formula:</strong>{" "}
                EMI = P × r × (1+r)ⁿ / ((1+r)ⁿ − 1), where r = {R}%/12 = {(R/12).toFixed(4)}% per month, n = {T2} months.
                Result: <strong style={{ color: "var(--text)" }}>{formatINR(result.emi)}</strong>/month.
              </p>
              <p style={{ marginTop: "0.6rem" }}>
                <strong style={{ color: "var(--text)" }}>Total debt outflow:</strong>{" "}
                {formatINR(result.emi)} × {T2} = <strong style={{ color: "var(--text)" }}>{formatINR(result.totalDebtOutflow)}</strong>.
                Interest paid = {formatINR(result.totalDebtOutflow)} − {formatINR(P)} = <strong style={{ color: "var(--text)" }}>{formatINR(result.totalInterestPaid)}</strong>.
              </p>
              <p style={{ marginTop: "0.6rem" }}>
                <strong style={{ color: "var(--text)" }}>Inflation-adjusted future price:</strong>{" "}
                {formatINR(P)} × (1 + {I}%)^{years} = <strong style={{ color: "var(--text)" }}>{formatINR(result.inflatedCost)}</strong>.
              </p>
              <p style={{ marginTop: "0.6rem" }}>
                <strong style={{ color: "var(--text)" }}>SIP corpus (annuity-due):</strong>{" "}
                {formatINR(result.emi)}/month at {S}% p.a. for {T2} months = <strong style={{ color: "var(--text)" }}>{formatINR(result.sipCorpus)}</strong>.
                Formula: PMT × ((1+r)ⁿ − 1)/r × (1+r), r = {S}%/12.
              </p>
              <p style={{ marginTop: "0.6rem" }}>
                <strong style={{ color: "var(--text)" }}>Decision rule:</strong>{" "}
                Compare {formatINR(result.totalDebtOutflow)} (debt cost) vs {formatINR(result.inflatedCost)} (future price).
                {result.winner === "debt"
                  ? ` Debt costs less — advantage: ${formatINR(result.advantage)}.`
                  : ` Future price is lower than debt cost — but check if SIP corpus (${formatINR(result.sipCorpus)}) covers it.`}
              </p>
            </div>
          </details>

          {/* ── Professional notes (collapsible) ── */}
          <details>
            <summary style={{ fontWeight: 700, fontSize: "0.95rem", cursor: "pointer", padding: "0.5rem 0", listStyle: "none", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span style={{ color: "var(--accent)" }}>📊</span> {t.sectionPro}
            </summary>
            <div className="card" style={{ marginTop: "0.75rem", fontSize: "0.83rem", lineHeight: 1.85, color: "var(--text-muted)" }}>
              <ul style={{ paddingLeft: "1.2rem", margin: 0 }}>
                <li><strong style={{ color: "var(--text)" }}>Opportunity cost:</strong> Capital locked in EMIs cannot compound. This model assumes the alternative is a pure SIP at the same EMI amount — real opportunity cost depends on your actual investment options and tax treatment.</li>
                <li style={{ marginTop: "0.4rem" }}><strong style={{ color: "var(--text)" }}>Tax shield (home loans):</strong> Section 80C (principal up to ₹1.5L) and Section 24(b) (interest up to ₹2L) deductions are not modelled. These can make debt significantly cheaper in real terms for home loans.</li>
                <li style={{ marginTop: "0.4rem" }}><strong style={{ color: "var(--text)" }}>Inflation asymmetry:</strong> Consumer goods may inflate differently from CPI. Real estate and gold typically outpace CPI; electronics typically deflate. The single inflation rate is a blunt instrument.</li>
                <li style={{ marginTop: "0.4rem" }}><strong style={{ color: "var(--text)" }}>SIP model:</strong> Annuity-due (start-of-period) with monthly compounding. Does not model ELSS lock-in, exit loads, expense ratios, or market volatility. Equity returns are stochastic; the rate here is a deterministic assumption.</li>
                <li style={{ marginTop: "0.4rem" }}><strong style={{ color: "var(--text)" }}>Prepayment option:</strong> Loans can be partially prepaid, reducing effective interest cost. This model assumes a vanilla EMI loan with no prepayment — use the <a href="/tools/emi-partpayment/" style={{ color: "var(--accent)" }}>Part Payment Calculator</a> for that scenario.</li>
                <li style={{ marginTop: "0.4rem" }}><strong style={{ color: "var(--text)" }}>Liquidity premium:</strong> The model does not price the option value of liquidity. Saving first keeps cash accessible; once EMIs start, the capital is committed.</li>
              </ul>
            </div>
          </details>

          {/* ── Cross-tool links ── */}
          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
            <a href={emiLink} className="btn btn-ghost" style={{ fontSize: "0.85rem" }}>
              {t.emiLink}
            </a>
            <a href={sipLink} className="btn btn-ghost" style={{ fontSize: "0.85rem" }}>
              {t.sipLink}
            </a>
          </div>

          {/* ── Disclaimer ── */}
          <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", opacity: 0.7, lineHeight: 1.6 }}>
            {t.disclaimer}
          </p>
        </>
      )}

      {/* ── Share FAB ── */}
      {valid && (
        <button className="share-fab" onClick={share} title={t.share}>
          {copied ? "✓" : "🔗"}
        </button>
      )}
    </ToolShell>
  );
}
