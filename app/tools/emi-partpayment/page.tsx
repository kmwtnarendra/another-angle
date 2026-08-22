import type { Metadata } from "next";
import PartPaymentClient from "./PartPaymentClient";

export const metadata: Metadata = {
  title: "Part Payment EMI Calculator",
  description:
    "See how a lump-sum part payment on your loan reduces total interest paid and shortens your tenure. Free calculator by Another Angle.",
  keywords: ["part payment calculator", "prepayment EMI", "loan prepayment", "reduce EMI tenure"],
  alternates: { canonical: "/tools/emi-partpayment/" },
};

export default function Page() {
  return <PartPaymentClient />;
}
