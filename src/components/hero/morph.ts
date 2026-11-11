export type MorphLetter = { char: string; from: number | null };

export function planMorph(name: string, word: string): MorphLetter[] {
    const used = new Set<number>();
    return [...word].map((char) => {
        if (char !== " ") {
            for (let i = 0; i < name.length; i++) {
                if (!used.has(i) && name[i] === char) {
                    used.add(i);
                    return { char, from: i };
                }
            }
        }
        return { char, from: null };
    });
}
