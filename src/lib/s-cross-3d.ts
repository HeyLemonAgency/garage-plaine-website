import type { SuzukiSpotId } from "./garage";
import type { SpinModel, SpinSpot } from "./spin-scene";

/**
 * How the 3D file is set up: its orientation, which of its materials are paint, glass, chrome
 * or rubber, and where each detail point sits on the car (see SpinSpot for the units).
 */
export const sCross3d: SpinModel & {
  /** False until the 3D file is in public/models: the page then shows the showroom photo. */
  available: boolean;
  poster: string | null;
  points: Record<SuzukiSpotId, Omit<SpinSpot, "id">>;
} = {
  available: false,
  url: "/models/suzuki-s-cross.glb",
  poster: null,
  yawFix: 0,
  length: 4.305,
  paint: [],
  glass: [],
  chrome: [],
  rubber: [],
  lamps: {},
  points: {
    phares: { at: [0.47, 0.56, 0.33], normal: [1, 0.1, 0.55] },
    hybride: { at: [0.34, 0.7, 0], normal: [0.55, 1, 0] },
    ecran: { at: [0.1, 0.75, -0.08], normal: [1, 0.35, 0] },
    toit: { at: [-0.1, 1, 0], normal: [0, 1, 0] },
    jantes: { at: [0.31, 0.21, 0.47], normal: [0.1, 0, 1] },
    allgrip: { at: [-0.31, 0.21, 0.47], normal: [-0.1, 0, 1] },
    coffre: { at: [-0.49, 0.62, 0], normal: [-1, 0.25, 0] },
  },
};
