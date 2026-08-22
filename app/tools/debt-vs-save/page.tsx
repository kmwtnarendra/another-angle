import type { Metadata } from "next";
import DebtVsSaveClient from "./DebtVsSaveClient";

export const metadata: Metadata = {
  title: "Buy Now vs Save First Calculator",
  description:
    "Should you take a loan or save first? Compare loan interest against savings returns and inflation to find the smarter financial path. Free calculator by Another Angle.",
  keywords: ["debt vs save", "loan vs saving", "buy now or save", "inflation calculator", "financial decision tool India"],
  alternates: { canonical: "/tools/debt-vs-save/" },
};

export default function Page() {
  return <DebtVsSaveClient />;
}
