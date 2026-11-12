import type { Scene } from "../kit";
import type { SceneId } from "../timeline";
import { circuit } from "./circuit";
import { rising } from "./rising";
import { particles } from "./particles";
import { helix } from "./helix";
import { orbit } from "./orbit";

export const SCENE_BY_ID = { circuit, particles, rising, helix, orbit } satisfies Record<SceneId, Scene>;
