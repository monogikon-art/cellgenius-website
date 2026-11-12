export const NAME = "CHANGENIUS";

export function lettersOf(word: string): (number | null)[] {
    const out: (number | null)[] = [];
    let used = new Set<number>();
    let prev = -1;
    for (const ch of word) {
        if (ch === " ") {
            used = new Set();
            prev = -1;
            continue;
        }
        let idx = -1;
        for (let i = prev + 1; i < NAME.length && idx === -1; i++) {
            if (NAME[i] === ch && !used.has(i)) idx = i;
        }
        for (let i = 0; i < NAME.length && idx === -1; i++) {
            if (NAME[i] === ch && !used.has(i)) idx = i;
        }
        if (idx === -1) {
            out.push(null);
            continue;
        }
        used.add(idx);
        prev = idx;
        out.push(idx);
    }
    return out;
}
