import type { Metadata } from "next";
import LatitudeLongitudeClient from "./LatitudeLongitudeClient";

export const metadata: Metadata = {
  title: "Latitude & Longitude Globe",
  description:
    "Interactive 3D globe with latitude and longitude grid lines. Drag to rotate, scroll to zoom. Equator, tropics and prime meridian are highlighted. Built with Three.js.",
  keywords: ["latitude longitude", "interactive globe", "coordinate system", "earth grid", "geography tool", "3D globe"],
  alternates: { canonical: "/tools/latitude-longitude/" },
};

export default function Page() {
  return <LatitudeLongitudeClient />;
}
