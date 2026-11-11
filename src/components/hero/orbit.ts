export const ORBIT_RADII = [3.0, 3.9, 4.8, 5.7, 6.6] as const;
export const ORBIT_SCALE = 110;
export const ORBIT_FLATTEN = 0.32;

const INNER_PERIOD_SECONDS = 40;

export function angularSpeed(radius: number): number {
    return ((2 * Math.PI) / INNER_PERIOD_SECONDS) * Math.pow(ORBIT_RADII[0] / radius, 1.5);
}

export function orbitPoint(radius: number, angle: number): { x: number; y: number } {
    return {
        x: radius * ORBIT_SCALE * Math.cos(angle),
        y: radius * ORBIT_SCALE * ORBIT_FLATTEN * Math.sin(angle),
    };
}
