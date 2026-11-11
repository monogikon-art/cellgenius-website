import { Fragment, useMemo } from "react";
import { parseMarkdown, type Inline } from "@/lib/assistant/markdown";

function Inlines({ items }: { items: Inline[] }) {
    return items.map((item, i) => {
        if (item.kind === "bold")
            return (
                <strong key={i} className="font-semibold text-fg">
                    {item.text}
                </strong>
            );
        if (item.kind === "link")
            return (
                <a key={i} href={item.href} target="_blank" rel="noopener noreferrer" className="text-gold underline underline-offset-2">
                    {item.text}
                </a>
            );
        return <Fragment key={i}>{item.text}</Fragment>;
    });
}

export function AssistantText({ text }: { text: string }) {
    const blocks = useMemo(() => parseMarkdown(text), [text]);
    return (
        <div className="space-y-3">
            {blocks.map((block, i) =>
                block.kind === "p" ? (
                    <p key={i}>
                        <Inlines items={block.inlines} />
                    </p>
                ) : (
                    <ul key={i} className="list-disc space-y-1 pl-5">
                        {block.items.map((item, j) => (
                            <li key={j}>
                                <Inlines items={item} />
                            </li>
                        ))}
                    </ul>
                ),
            )}
        </div>
    );
}
