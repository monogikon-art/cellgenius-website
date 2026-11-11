export type NavItem = { href: string; label: string };

export function navItems(assistantOn: boolean): NavItem[] {
    return [
        { href: "#assistant", label: assistantOn ? "Assistant" : "Contact" },
        { href: "#films", label: "Films" },
        { href: "#demos", label: "Demos" },
    ];
}
