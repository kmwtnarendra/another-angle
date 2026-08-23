import type { Metadata } from "next";
import SolarSystemScaledClient from "./SolarSystemScaledClient";

export const metadata: Metadata = {
  title: "Solar System Scaled",
  description:
    "See all eight planets and the Sun drawn to scale. Set Earth's diameter in real units — mm to feet — and every planet scales proportionally. Orbit rings included.",
  keywords: ["solar system scale model", "planet size comparison", "Sun size", "astrophysics tool", "space education"],
  alternates: { canonical: "/tools/solar-system-scaled/" },
};

export default function Page() {
  return <SolarSystemScaledClient />;
}
