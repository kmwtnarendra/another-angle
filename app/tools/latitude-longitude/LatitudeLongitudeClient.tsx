"use client";

import { useEffect, useRef } from "react";
import type * as THREETypes from "three";
import ToolShell from "../../components/ToolShell";

export default function LatitudeLongitudeClient() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let THREE: typeof THREETypes;
    let rafId = 0;
    let renderer: THREETypes.WebGLRenderer;

    async function init() {
      THREE = await import("three");

      // ── Scene & Camera ──────────────────────────────────────────────────
      const scene  = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(60, container!.clientWidth / container!.clientHeight, 0.1, 1000);

      // ── Renderer ────────────────────────────────────────────────────────
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      container!.appendChild(renderer.domElement);

      // ── Lights ──────────────────────────────────────────────────────────
      scene.add(new THREE.AmbientLight(0x88aaff, 0.4));
      const dirLight = new THREE.DirectionalLight(0xffffff, 1);
      dirLight.position.set(3, 3, 5);
      scene.add(dirLight);

      // ── Earth sphere ────────────────────────────────────────────────────
      const EARTH_R = 1.2;
      const earthMesh = new THREE.Mesh(
        new THREE.SphereGeometry(EARTH_R, 64, 64),
        new THREE.MeshPhongMaterial({ color: 0x2266ff, emissive: 0x001133, shininess: 60 })
      );
      scene.add(earthMesh);

      // ── Grid lines ──────────────────────────────────────────────────────
      const linesGroup = new THREE.Group();
      const LINE_R     = EARTH_R + 0.002;
      const SEG        = 256;

      function makeLineMat(bold: boolean) {
        return new THREE.LineBasicMaterial({
          color: 0xffffff, transparent: true, opacity: bold ? 0.9 : 0.45,
        });
      }

      function addLabel(text: string, pos: THREETypes.Vector3, size = 0.07) {
        const cvs    = document.createElement("canvas");
        cvs.width    = 256; cvs.height = 128;
        const ctx    = cvs.getContext("2d")!;
        ctx.font     = "bold 64px Arial";
        ctx.fillStyle = "white";
        ctx.textAlign = "center"; ctx.textBaseline = "middle";
        ctx.fillText(text, 128, 64);
        const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(cvs), transparent: true }));
        sprite.scale.set(size, size * 0.5, 1);
        sprite.position.copy(pos);
        linesGroup.add(sprite);
      }

      function addLatLine(deg: number, bold: boolean, label: string) {
        const rad = THREE.MathUtils.degToRad(deg);
        const y   = LINE_R * Math.sin(rad);
        const r   = LINE_R * Math.cos(rad);
        const pts: THREETypes.Vector3[] = [];
        for (let i = 0; i <= SEG; i++) {
          const t = (i / SEG) * Math.PI * 2;
          pts.push(new THREE.Vector3(r * Math.cos(t), y, r * Math.sin(t)));
        }
        linesGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), makeLineMat(bold)));
        if (label) addLabel(label, new THREE.Vector3(r + 0.15, y, 0));
      }

      function addLonLine(deg: number, bold: boolean, label: string) {
        const lonRad = THREE.MathUtils.degToRad(deg);
        const pts: THREETypes.Vector3[] = [];
        for (let i = 0; i <= SEG; i++) {
          const latDeg = -90 + (i / SEG) * 180;
          const latRad = THREE.MathUtils.degToRad(latDeg);
          pts.push(new THREE.Vector3(
            LINE_R * Math.cos(latRad) * Math.cos(lonRad),
            LINE_R * Math.sin(latRad),
            LINE_R * Math.cos(latRad) * Math.sin(lonRad)
          ));
        }
        linesGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), makeLineMat(bold)));
        if (label) addLabel(label, new THREE.Vector3(LINE_R * Math.cos(lonRad) * 1.08, 0, LINE_R * Math.sin(lonRad) * 1.08));
      }

      // Latitude lines every 15°
      for (let lat = -90; lat <= 90; lat += 15) {
        const bold  = lat === 0 || lat === 23.5 || lat === -23.5;
        const label = [0, 23.5, -23.5, 90, -90].includes(lat)
          ? (lat > 0 ? `${lat}°N` : lat < 0 ? `${-lat}°S` : "0°")
          : "";
        addLatLine(lat, bold, label);
      }
      // Longitude lines every 15°
      for (let lon = 0; lon < 360; lon += 15) {
        const label = [0, 90, 180, 270].includes(lon) ? `${lon}°` : "";
        addLonLine(lon, lon === 0, label);
      }

      scene.add(linesGroup);

      // ── Drag rotation ───────────────────────────────────────────────────
      let isDragging = false, lastX = 0, lastY = 0;
      let velX = 0, velY = 0, rotX = 0, rotY = 0;

      const onDown = (x: number, y: number) => { isDragging = true; lastX = x; lastY = y; };
      const onMove = (x: number, y: number) => {
        if (!isDragging) return;
        velX = (y - lastY) * 0.002; velY = (x - lastX) * 0.002;
        lastX = x; lastY = y;
      };
      const onUp = () => { isDragging = false; };

      renderer.domElement.addEventListener("mousedown", e => onDown(e.clientX, e.clientY));
      window.addEventListener("mouseup", onUp);
      renderer.domElement.addEventListener("mousemove", e => onMove(e.clientX, e.clientY));
      renderer.domElement.addEventListener("touchstart", e => onDown(e.touches[0].clientX, e.touches[0].clientY), { passive: true });
      renderer.domElement.addEventListener("touchend", onUp);
      renderer.domElement.addEventListener("touchmove", e => { e.preventDefault(); onMove(e.touches[0].clientX, e.touches[0].clientY); }, { passive: false });

      // ── Zoom ────────────────────────────────────────────────────────────
      let zoomFactor = 1, zoomTarget = 1;
      let baseDistance = 0;
      renderer.domElement.addEventListener("wheel", e => {
        e.preventDefault();
        zoomTarget = Math.min(2.0, Math.max(0.6, zoomTarget * (e.deltaY > 0 ? 1.1 : 0.9)));
      }, { passive: false });

      // ── Resize ──────────────────────────────────────────────────────────
      function resize() {
        if (!container) return;
        const W = container.clientWidth, H = container.clientHeight;
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(W, H);
        camera.aspect = W / H;
        camera.updateProjectionMatrix();
        const fov  = THREE.MathUtils.degToRad(camera.fov);
        const fitH = EARTH_R / Math.tan(fov / 2);
        const fitW = EARTH_R / Math.tan(Math.atan(Math.tan(fov / 2) * camera.aspect));
        baseDistance = Math.max(fitH, fitW) * 1.2;
        camera.position.z = baseDistance * zoomFactor;
      }
      window.addEventListener("resize", resize);
      resize();

      // ── Animate ─────────────────────────────────────────────────────────
      function animate() {
        rafId = requestAnimationFrame(animate);
        rotX += velX; rotY += velY;
        velX *= 0.95; velY *= 0.95;
        rotX = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, rotX));
        earthMesh.rotation.set(rotX, rotY, 0);
        linesGroup.rotation.copy(earthMesh.rotation);
        zoomFactor += (zoomTarget - zoomFactor) * 0.1;
        camera.position.z = baseDistance * zoomFactor;
        renderer.render(scene, camera);
      }
      animate();

      // return cleanup
      return () => {
        cancelAnimationFrame(rafId);
        window.removeEventListener("resize", resize);
        window.removeEventListener("mouseup", onUp);
        renderer.dispose();
        earthMesh.geometry.dispose();
        (earthMesh.material as THREETypes.Material).dispose();
        if (renderer.domElement.parentNode === container) {
          container!.removeChild(renderer.domElement);
        }
      };
    }

    let cleanup: (() => void) | undefined;
    init().then(fn => { cleanup = fn; });

    return () => {
      if (cleanup) cleanup();
      else cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <ToolShell title="Latitude & Longitude Globe" emoji="🌐">
      <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginTop: "-0.5rem", lineHeight: 1.6 }}>
        Interactive 3D globe showing the latitude and longitude grid.
        Drag to rotate · Scroll to zoom.
        The equator (0°), tropics (±23.5°), and prime meridian (0°) are highlighted.
      </p>

      {/* Globe container */}
      <div
        ref={containerRef}
        style={{
          width: "100%", aspectRatio: "16/9",
          background: "#000", borderRadius: 12,
          border: "1px solid var(--border)", overflow: "hidden",
          cursor: "grab",
        }}
      />

      {/* Legend */}
      <div className="card" style={{ display: "flex", flexWrap: "wrap", gap: "1.25rem", fontSize: "0.8rem", color: "var(--text-muted)" }}>
        {[
          ["🔵", "Earth sphere"],
          ["━━", "Latitude lines (every 15°)"],
          ["━━ bright", "Equator & Tropics (0°, ±23.5°)"],
          ["┃", "Longitude lines (every 15°)"],
          ["┃ bright", "Prime Meridian (0°)"],
        ].map(([icon, label]) => (
          <span key={label}><span style={{ opacity: 0.7 }}>{icon}</span> {label}</span>
        ))}
      </div>

      {/* Fact */}
      <div className="card" style={{ fontSize: "0.85rem", color: "var(--text-muted)", lineHeight: 1.7 }}>
        <strong style={{ color: "var(--text)" }}>How it works:</strong> Latitude lines run
        east–west and measure how far north or south a point is from the equator (0° to ±90°).
        Longitude lines run north–south and measure east–west position from the prime meridian
        in Greenwich (0° to ±180°). Together they uniquely identify any location on Earth.
      </div>
    </ToolShell>
  );
}
