import type { Metadata } from "next";
import EarthSatelliteClient from "./EarthSatelliteClient";

export const metadata: Metadata = {
  title: "Earth Satellite Simulation",
  description:
    "Top-down simulation of Earth rotating with satellites in real orbital mechanics. Add satellites, adjust speed, and compare orbits — from ISS to geostationary.",
  keywords: ["satellite simulation", "ISS orbit", "geostationary orbit", "earth rotation", "orbital mechanics", "space simulation"],
  alternates: { canonical: "/tools/earth-satellite/" },
};

export default function Page() {
  return <EarthSatelliteClient />;
}
