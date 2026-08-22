import type { Metadata } from "next";
import SipClient from "./SipClient";

export const metadata: Metadata = {
  title: "SIP Calculator",
  description:
    "Calculate the future value of your SIP (Systematic Investment Plan) with monthly contributions and expected annual returns. Free SIP calculator by Another Angle.",
  keywords: ["SIP calculator", "mutual fund SIP", "monthly investment", "compound interest", "wealth creation India"],
  alternates: { canonical: "/tools/sip/" },
};

export default function Page() {
  return <SipClient />;
}
