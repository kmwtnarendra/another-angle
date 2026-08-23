import type { Metadata } from "next";
import EarthSunScaledClient from "./EarthSunScaledClient";

export const metadata: Metadata = {
  title: "Earth vs Sun (Scaled)",
  description:
    "Interactive scale model showing how tiny Earth is compared to the Sun. Set Earth's size in real units — mm, cm, metres, inches, feet — and the Sun scales proportionally.",
  keywords: ["earth vs sun size", "scale model", "planet size comparison", "solar system scale", "astrophysics"],
  alternates: { canonical: "/tools/earth-sun-scaled/" },
};

export default function Page() {
  return <EarthSunScaledClient />;
}
