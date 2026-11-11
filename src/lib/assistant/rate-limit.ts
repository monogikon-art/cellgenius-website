export type TokenBucket = { take(key: string, now?: number): boolean };

export function createTokenBucket(opts: { capacity: number; refillPerMinute: number; maxKeys?: number }): TokenBucket {
    const state = new Map<string, { tokens: number; at: number }>();
    const maxKeys = opts.maxKeys ?? 10_000;
    const perMs = opts.refillPerMinute / 60_000;
    return {
        take(key, now = Date.now()) {
            const prev = state.get(key);
            const tokens = prev ? Math.min(opts.capacity, prev.tokens + (now - prev.at) * perMs) : opts.capacity;
            if (prev) state.delete(key);
            else if (state.size >= maxKeys) state.delete(state.keys().next().value as string);
            if (tokens < 1) {
                state.set(key, { tokens, at: now });
                return false;
            }
            state.set(key, { tokens: tokens - 1, at: now });
            return true;
        },
    };
}
