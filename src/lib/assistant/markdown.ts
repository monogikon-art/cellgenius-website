export type Inline = { kind: "text"; text: string } | { kind: "bold"; text: string } | { kind: "link"; text: string; href: string };
export type Block = { kind: "p"; inlines: Inline[] } | { kind: "ul"; items: Inline[][] };

const ALLOWED_HOSTS = new Set(["cellgenius-ai.com", "www.cellgenius-ai.com", "app.cellgenius-ai.com"]);
const INLINE = /\*\*([^*\n]+)\*\*|\[([^\]\n]+)\]\(([^)\s]+)\)/g;
const BULLET = /^\s*[-*]\s+/;

export function safeHref(raw: string): string | null {
    try {
        const url = new URL(raw);
        return url.protocol === "https:" && ALLOWED_HOSTS.has(url.hostname) ? url.href : null;
    } catch {
        return null;
    }
}

function parseInline(source: string): Inline[] {
    const out: Inline[] = [];
    let last = 0;
    for (const match of source.matchAll(INLINE)) {
        const at = match.index ?? 0;
        if (at > last) out.push({ kind: "text", text: source.slice(last, at) });
        if (match[1] !== undefined) {
            out.push({ kind: "bold", text: match[1] });
        } else {
            const href = safeHref(match[3]);
            out.push(href ? { kind: "link", text: match[2], href } : { kind: "text", text: match[2] });
        }
        last = at + match[0].length;
    }
    if (last < source.length) out.push({ kind: "text", text: source.slice(last) });
    return out;
}

export function parseMarkdown(source: string): Block[] {
    const blocks: Block[] = [];
    for (const chunk of source.replace(/\r\n/g, "\n").split(/\n{2,}/)) {
        const lines = chunk.split("\n").filter((line) => line.trim() !== "");
        if (lines.length === 0) continue;
        if (lines.every((line) => BULLET.test(line))) {
            blocks.push({ kind: "ul", items: lines.map((line) => parseInline(line.replace(BULLET, ""))) });
        } else {
            blocks.push({ kind: "p", inlines: parseInline(lines.join(" ")) });
        }
    }
    return blocks;
}
