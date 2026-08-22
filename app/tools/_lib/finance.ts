// Shared finance calculation utilities.
// Ported from the original Vite TS files in old_vite_code/spa/finance/.

export function calculateEMI(principal: number, annualRate: number, months: number): number {
  const r = annualRate / 12 / 100;
  return +((principal * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1)).toFixed(2);
}

/** Format a number as Indian currency (e.g. 1,23,456.78) */
export function formatINR(num: number): string {
  const [int, dec] = Math.abs(num).toFixed(2).split(".");
  let last3 = int.slice(-3);
  const rest = int.slice(0, -3);
  if (rest) last3 = "," + last3;
  const formatted = rest.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + last3;
  return (num < 0 ? "−₹" : "₹") + formatted + "." + dec;
}

export interface EmiRow {
  no: number;
  date: string | null;
  emi: number;
  opening: number;
  interest: number;
  principal: number;
  closing: number;
  isPartPayment?: boolean;
}

export function buildSchedule(
  P: number,
  annualRate: number,
  months: number,
  startDate?: Date | null
): EmiRow[] {
  const emi = calculateEMI(P, annualRate, months);
  let remaining = P;
  const rows: EmiRow[] = [];
  const date = startDate ? new Date(startDate) : null;

  for (let i = 1; i <= months; i++) {
    const interest = +(remaining * (annualRate / 12 / 100)).toFixed(2);
    const principalPart = +(emi - interest).toFixed(2);
    const closing = +(remaining - principalPart).toFixed(2);

    rows.push({
      no: i,
      date: date ? date.toISOString().split("T")[0] : null,
      emi,
      opening: +remaining.toFixed(2),
      interest,
      principal: principalPart,
      closing: closing < 0 ? 0 : closing,
    });

    if (closing <= 0) break;
    remaining = closing;
    if (date) date.setMonth(date.getMonth() + 1);
  }

  return rows;
}

/** Insert part payments into an existing EMI schedule. */
export function applyPartPayments(
  schedule: EmiRow[],
  partPayments: { amount: number; date: string }[],
  annualRate: number,
  emi: number
): EmiRow[] {
  if (!partPayments.length) return schedule;

  const sorted = [...partPayments].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const dailyRate = annualRate / 365 / 100;
  let result = [...schedule];

  for (const pp of sorted) {
    const ppDate = new Date(pp.date);

    const lastIdx = result.findIndex(
      (row, i) =>
        row.date &&
        new Date(row.date) < ppDate &&
        (i === result.length - 1 || new Date(result[i + 1].date!) >= ppDate)
    );
    if (lastIdx === -1) continue;

    const lastRow = result[lastIdx];
    const daysBetween = Math.round(
      (ppDate.getTime() - new Date(lastRow.date!).getTime()) / 86_400_000
    );
    const interestForDays = +(lastRow.closing * dailyRate * daysBetween).toFixed(2);
    let principalPart = +(pp.amount - interestForDays).toFixed(2);
    if (principalPart < 0) principalPart = 0;
    if (principalPart > lastRow.closing) principalPart = lastRow.closing;
    const newClosing = +(lastRow.closing - principalPart).toFixed(2);

    const ppRow: EmiRow = {
      no: 0,
      date: pp.date,
      emi: pp.amount,
      opening: +lastRow.closing.toFixed(2),
      interest: interestForDays,
      principal: principalPart,
      closing: newClosing,
      isPartPayment: true,
    };

    const nextDate =
      lastIdx + 1 < result.length
        ? new Date(result[lastIdx + 1].date!)
        : new Date(ppDate);

    const tail = buildScheduleFromOpening(newClosing, annualRate, emi, nextDate);
    result = [...result.slice(0, lastIdx + 1), ppRow, ...tail];

    if (!tail.length || tail[0].closing <= 0) break;
  }

  // Re-number non-part-payment rows
  let no = 1;
  result.forEach((r) => { if (!r.isPartPayment) r.no = no++; });

  return result;
}

function buildScheduleFromOpening(
  opening: number,
  annualRate: number,
  emi: number,
  startDate: Date
): EmiRow[] {
  let remaining = opening;
  const rows: EmiRow[] = [];
  const date = new Date(startDate);
  let no = 1;

  while (remaining > 0.01) {
    const interest = +(remaining * (annualRate / 12 / 100)).toFixed(2);
    let principalPart = +(emi - interest).toFixed(2);
    if (principalPart > remaining) principalPart = remaining;
    const closing = +(remaining - principalPart).toFixed(2);

    rows.push({
      no: no++,
      date: date.toISOString().split("T")[0],
      emi,
      opening: +remaining.toFixed(2),
      interest,
      principal: principalPart,
      closing: closing < 0 ? 0 : closing,
    });

    if (closing <= 0) break;
    remaining = closing;
    date.setMonth(date.getMonth() + 1);
  }

  return rows;
}
