import type { SuzukiSpotId } from "./garage";
import posterWide from "@/assets/s-cross-poster-wide.webp";
import posterPhone from "@/assets/s-cross-poster-phone.webp";
import type { SpinModel, SpinSpot } from "./spin-scene";

/**
 * How the 3D file is set up: its orientation, which of its materials are paint, glass, chrome
 * or rubber, and where each detail point sits on the car (see SpinSpot for the units).
 */
export const sCross3d: SpinModel & {
  /** False until the 3D file is in public/models: the page then shows the showroom photo. */
  available: boolean;
  /** Still renders shown until the 3D view is ready (wide screens and phones). */
  poster: { wide: string; phone: string } | null;
  points: Record<SuzukiSpotId, Omit<SpinSpot, "id">>;
} = {
  available: true,
  // Compressed with meshopt and WebP, then gzipped: 2.1 MB instead of the original 19.7 MB.
  url: "/models/suzuki-s-cross.glb.gz",
  // Rendered from this scene at the starting angle, so the switch to 3D is seamless.
  poster: { wide: posterWide, phone: posterPhone },
  // The file's nose already points to +x; it is 4.28 m long, scaled to the real 4.305 m.
  yawFix: 0,
  length: 4.305,
  paint: ["auto_17", "carpaint_001"],
  glass: ["Translucent_Glass_Gray", "interior_007"],
  chrome: ["auto_13"],
  rubber: ["auto_28"],
  finish: {
    auto_1: { color: "#141518", roughness: 0.45 },
    plasticGlossy_001: { color: "#101113", roughness: 0.16, clearcoat: 0.6 },
    auto_3: { roughness: 0.6 },
    M_0136_Charcoal: { roughness: 0.7 },
    M_0134_DimGray: { roughness: 0.85 },
    auto_4: { roughness: 0.85 },
    silver_d_001: { color: "#e3e6ea", metalness: 0.7, roughness: 0.24 },
    auto_10: { metalness: 0.6, roughness: 0.35 },
    auto_5: { metalness: 0.7, roughness: 0.3, overGlass: true },
    Material_46: { color: "#eef1f4", metalness: 0.6, roughness: 0.2, overGlass: true },
    glass_001: { color: "#ffffff", roughness: 0.05, opacity: 0.22, overGlass: true },
    o_glass_001: { color: "#ff8a1c", roughness: 0.15, opacity: 0.85, overGlass: true },
    r_glass_001: { color: "#b3121b", roughness: 0.12, glow: "#5a0006", overGlass: true },
    auto_16: { color: "#9e0d14", roughness: 0.3, glow: "#3a0004", overGlass: true },
    r_lights_001: { color: "#c4141c", roughness: 0.2, glow: "#5a0006", overGlass: true },
    d_glass_001: { roughness: 0.1 },
    brakes1_001: { metalness: 0.6, roughness: 0.4 },
  },
  lamps: { phares: ["Material_46"] },
  // Measured on the file: wheels 2.6 m apart (the real wheelbase), 0.7 m tall.
  points: {
    phares: { at: [0.465, 0.53, 0.32], normal: [1, 0.1, 0.55] },
    hybride: { at: [0.325, 0.65, 0], normal: [0.5, 1, 0] },
    ecran: { at: [0.17, 0.66, -0.06], normal: [1, 0.35, 0] },
    toit: { at: [-0.07, 0.875, 0], normal: [0, 1, 0] },
    jantes: { at: [0.283, 0.19, 0.44], normal: [0.1, 0, 1] },
    allgrip: { at: [-0.324, 0.19, 0.44], normal: [-0.1, 0, 1] },
    coffre: { at: [-0.5, 0.62, 0], normal: [-1, 0.25, 0] },
  },
};
