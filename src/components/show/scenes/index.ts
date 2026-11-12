import { WORDS } from "../copy";
import { caption, captionY, drawClosure, drawRestingName, nameLayout, seg, type DrawArgs, type Scene } from "../kit";
import { SCENES, type SceneId } from "../timeline";

function stubDraw(a: DrawArgs) {
    const { g, frame, phase, font } = a;
    if (phase.kind === "closure") {
        drawClosure(a, phase.p, nameLayout(frame));
        return;
    }
    drawRestingName(a);
    if (phase.kind === "word") {
        const alpha = Math.min(seg(phase.p, 0.1, 0.4), 1 - seg(phase.p, 0.9, 1));
        caption(g, frame, font, WORDS[phase.k].caption, captionY(frame), alpha);
    }
}

export const SCENE_BY_ID = Object.fromEntries(SCENES.map((id) => [id, { id, draw: stubDraw }])) as Record<SceneId, Scene>;
