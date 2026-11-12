export const SITE = {
    name: "Changenius",
    company: "CellGenius",
    url: "https://cellgenius-ai.com",
    appLoginUrl: "https://app.cellgenius-ai.com/login",
    email: "support@cellgenius-ai.com",
} as const;

export const NAME = "CHANGENIUS";

export type Film = { readonly title: string; readonly src: string; readonly poster?: string; readonly seconds?: number };

export type DemoGroup = { readonly id: string; readonly title: string; readonly lead: string; readonly chapters: readonly Film[] };

const media = (path: string) => `/media${path}`;

export const FEATURED_FILM: Film = {
    title: "The Changenius film",
    src: media("/films/changenius-film-2min-v1.mp4"),
    poster: media("/films/changenius-film-2min-v1-poster.jpg"),
    seconds: 113,
};

const chapter = (title: string, path: string, seconds: number): Film => ({ title, src: media(path), seconds });

export const DEMO_GROUPS: readonly DemoGroup[] = [
    {
        id: "deeper-look",
        title: "A deeper look",
        lead: "Two changes at an illustrative bank, followed module by module.",
        chapters: [
            chapter("A deeper look: two changes, one bank", "/films/deeper-look-v3/00-opening.mp4", 89),
            chapter("1 A strategy every change answers to", "/films/deeper-look-v3/01-strategy-ideas.mp4", 101),
            chapter("2 Registered and governed", "/films/deeper-look-v3/02-registered-governed.mp4", 116),
            chapter("3 What comes first", "/films/deeper-look-v3/03-what-comes-first.mp4", 109),
            chapter("4 Solution and requirements", "/films/deeper-look-v3/04-solution-requirements.mp4", 196),
            chapter("5 Buying and deciding", "/films/deeper-look-v3/05-buying-deciding.mp4", 154),
            chapter("6 Planning and delivering", "/films/deeper-look-v3/06-planning-delivering.mp4", 97),
            chapter("7 Go-live based on evidence", "/films/deeper-look-v3/07-go-live.mp4", 93),
            chapter("8 Thirty minutes, proven", "/films/deeper-look-v3/08-benefits.mp4", 49),
            chapter("9 The teammates behind every step", "/films/deeper-look-v3/09-digital-workforce.mp4", 131),
            chapter("10 The Knowledge Base", "/films/deeper-look-v3/10-knowledge-base.mp4", 120),
            chapter("11 The Enterprise Baseline", "/films/deeper-look-v3/11-enterprise-baseline.mp4", 119),
            chapter("12 Built for a regulated bank", "/films/deeper-look-v3/12-regulated-bank.mp4", 55),
        ],
    },
    {
        id: "executive-demo",
        title: "The executive demo",
        lead: "Nine short chapters, from strategy to go-live.",
        chapters: [
            chapter("1.1 The campus", "/films/executive-demo-v3/01-campus.mp4", 94),
            chapter("1.2 Strategy & OKR", "/films/executive-demo-v3/02-strategy.mp4", 231),
            chapter("1.3 Registering a request", "/films/executive-demo-v2/03-request.mp4", 167),
            chapter("1.4 Business requirements", "/films/executive-demo-v3/04-requirements.mp4", 172),
            chapter("1.5 Benefits", "/films/executive-demo-v2/05-benefits.mp4", 169),
            chapter("1.6 Deliverables, generated", "/films/executive-demo-v3/06-deliverables.mp4", 184),
            chapter("1.7 Investment decision", "/films/executive-demo-v3/07-decision.mp4", 98),
            chapter("1.8 Planning the delivery", "/films/executive-demo-v3/08-planning.mp4", 205),
            chapter("1.9 Go-live, and after", "/films/executive-demo-v3/09-golive.mp4", 87),
        ],
    },
];

export const QUICK_STARTS = ["What can Changenius do?", "Book a demo", "Send me information", "Contact the team"] as const;

export const ASSISTANT = {
    name: "EPMO AI Assistant",
    tagline: "Ask anything about Changenius — or let me arrange a demo, send you information or pass a message to the team.",
    consent:
        "This assistant is AI. Don't share sensitive information. Details you give to arrange a demo or a reply are sent to the Changenius team by email and WhatsApp (Meta) and kept for 12 months.",
} as const;
