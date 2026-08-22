import type { Metadata } from "next";
import EmiClient from "./EmiClient";

export const metadata: Metadata = {
  title: "EMI Calculator",
  description:
    "Calculate your monthly loan EMI, total interest, and view the full repayment schedule. Free EMI calculator by Another Angle.",
  keywords: ["EMI calculator", "loan calculator", "monthly EMI", "home loan", "car loan", "India"],
  alternates: { canonical: "/tools/emi/" },
};

export default function Page() {
  return <EmiClient />;
}
