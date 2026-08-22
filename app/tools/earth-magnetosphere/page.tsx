import type { Metadata } from "next";
import EarthMagnetosphereClient from "./EarthMagnetosphereClient";

export const metadata: Metadata = {
  title: "Earth Magnetosphere Simulation",
  description:
    "Interactive simulation of the solar wind interacting with Earth's magnetic field. Watch particles deflect, field lines bend, and auroras form at the poles.",
  keywords: ["magnetosphere", "solar wind", "Earth magnetic field", "aurora", "space science simulation"],
  alternates: { canonical: "/tools/earth-magnetosphere/" },
};

export default function Page() {
  return <EarthMagnetosphereClient />;
}
