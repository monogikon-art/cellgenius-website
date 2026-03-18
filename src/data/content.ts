// ─────────────────────────────────────────────────────────────────────────────
// SITE CONTENT — Edit this file to update ALL text on the website
// ─────────────────────────────────────────────────────────────────────────────

export const SITE = {
    name: "CellGenius",
    tagline: "From Everyday Life to Enterprise Strategy. Track It All.",
    domain: "cellgenius-ai.com",
    url: "https://cellgenius-ai.com",
    // ⚠️  Update these URLs once the PPM app is deployed to Vercel
    ppmSignupUrl: "http://localhost:3000/signup",
    ppmLoginUrl: "http://localhost:3000/login",
    email: "info@cellgenius-ai.com",
    copyright: `© ${new Date().getFullYear()} CellGenius. All rights reserved.`,
};

// ─── Hero Section ────────────────────────────────────────────────────────────
export const HERO = {
    headline: "From Everyday Life to Enterprise Strategy.",
    headlineAccent: "Track It All with CellGenius.",
    subheadline:
        "Discover smart, user-friendly trackers for your daily needs, and our flagship AI-driven Project & Portfolio Management suite for your enterprise.",
    cta1: { label: "Explore Personal Trackers", href: "#trackers" },
    cta2: { label: "Discover Enterprise PPM", href: "#enterprise" },
};

// ─── Value Propositions ──────────────────────────────────────────────────────
export const VALUE_PROPS = [
    {
        icon: "Monitor",
        title: "User-Friendly Interfaces",
        description:
            "Beautifully designed, intuitive dashboards that anyone can use — no technical skills required.",
    },
    {
        icon: "Brain",
        title: "Seamless AI Integration",
        description:
            "Built-in AI agents that automate project planning, generate reports, flag risks, and create draft requirements — all without manual effort.",
    },
    {
        icon: "Link",
        title: "End-to-End Traceability",
        description:
            "Full traceability from strategic KPIs down to individual projects and tasks, ensuring nothing falls through the cracks.",
    },
];

// ─── Enterprise Section ──────────────────────────────────────────────────────
export const ENTERPRISE = {
    badge: "Flagship Product",
    headline: "Next-Generation AI Project & Portfolio Management",
    subheadline:
        "An intelligent, end-to-end PPM platform that connects strategy to execution. With the power of AI, your PMO requires zero manual effort to build plans, generate requirements, and track delivery.",
    features: [
        {
            title: "Strategy to Execution",
            description:
                "Link corporate KPIs to OKRs and strategic initiatives with full traceability. Cascade objectives down to product-level projects with real-time progress tracking. AI automatically creates clear project details along with expected benefits, and generates draft Business Requirements and test cases to accelerate project initiation.",
            bullets: [
                "KPIs → OKRs → Projects traceability",
                "Strategic cascade visualization",
                "AI-generated project details & benefits",
                "Auto-drafted Business Requirements & test cases",
            ],
        },
        {
            title: "Zero-Effort AI Project Planning",
            description:
                "The New Generation PMO does not require any effort to prepare plans and Gantt charts. With the support of AI, the platform automatically builds the required tasks and plans them based on key drivers like design workshops, development packages, test cycles, change enablement activities, and deployment releases.",
            bullets: [
                "Auto-generated Gantt charts & task plans",
                "Planning driven by design workshops & dev packages",
                "Test cycles & change enablement scheduling",
                "Deployment release planning & coordination",
            ],
        },
        {
            title: "Vendor Platform & Development Management",
            description:
                "A dedicated platform for external vendors and development teams to set up code packages, link them directly to requirements, and plan their delivery schedules. Vendors manage their releases independently while maintaining full traceability to the project roadmap.",
            bullets: [
                "Vendor portal for code package management",
                "Requirements-linked development planning",
                "Vendor release scheduling & tracking",
                "Full audit trail of vendor deliverables",
            ],
        },
        {
            title: "Project Collaboration & Agile Board",
            description:
                "A unified project collaboration workspace where teams — internal and external — coordinate in real time. The integrated Agile Board supports sprint planning, backlog management, and daily standups, keeping every team member aligned and productive.",
            bullets: [
                "Project collaboration workspace",
                "Full Agile Board with sprints & backlog",
                "Real-time team coordination",
                "Cross-team visibility & alignment",
            ],
        },
        {
            title: "Comprehensive Delivery & Governance",
            description:
                "From CapEx budgeting and vendor release management to test strategy execution, deployment planning, and post-go-live benefits realization — every phase of delivery is covered with full governance and audit trails.",
            bullets: [
                "CapEx governance & budget tracking",
                "Testing: strategy, cycles & defect management",
                "Deployment planning & release coordination",
                "Benefits realization & post-go-live tracking",
            ],
        },
        {
            title: "Smart Workflows & Roadmaps",
            description:
                "Automate procurement and tender management workflows. Generate organization-wide roadmaps based on resource capacity and priority scores. AI status reports flag risks and tasks needing remediation across the entire portfolio.",
            bullets: [
                "Procurement & tender management",
                "Capacity-based roadmap generation",
                "AI-powered risk detection & status reports",
                "Priority scoring & intelligent scheduling",
            ],
        },
    ],
    // ⚠️  Update this URL once the PPM app is deployed to Vercel
    cta: { label: "Start Your Free Trial", href: "/pricing" },
};

// ─── Trackers Section (Placeholder) ──────────────────────────────────────────
export const TRACKERS = {
    badge: "Coming Soon",
    headline: "Smart Tracking for Everyday Heroes",
    subheadline:
        "We are building a collection of beautiful, easy-to-use trackers for everyday life and small businesses. Zero technical skills required.",
    comingSoonMessage:
        "Our consumer and small business trackers are currently under development. Be the first to know when they launch!",
    ctaLabel: "Notify Me When Available",
};

// ─── About Section ───────────────────────────────────────────────────────────
export const ABOUT = {
    headline: "About CellGenius",
    mission:
        "We believe that organization should be effortless. Whether you are tracking your family's health, managing a small business, or running a Fortune 500 PMO — CellGenius gives you the intelligent tools to stay in control.",
    values: [
        {
            title: "Innovation First",
            description: "We push the boundaries of what software can do with AI and data intelligence.",
        },
        {
            title: "Accessible to All",
            description: "From consumer apps to enterprise platforms — our tools are designed for everyone.",
        },
        {
            title: "Reliability Guaranteed",
            description: "Enterprise-grade infrastructure with 99.9% uptime and bank-level security.",
        },
    ],
};

// ─── Trust / Social Proof Section ────────────────────────────────────────────
export const TRUST = {
    headline: "Trusted by teams who demand more from their tools.",
    stats: [
        { value: "99.9%", label: "Uptime SLA" },
        { value: "10x", label: "Faster Reporting" },
        { value: "50+", label: "Enterprise Modules" },
        { value: "24/7", label: "Dedicated Support" },
    ],
};

// ─── Contact Section ─────────────────────────────────────────────────────────
export const CONTACT = {
    headline: "Get in Touch",
    subheadline:
        "Whether you are interested in our enterprise PPM platform, small business trackers, or personal tools — we would love to hear from you.",
    interests: [
        { value: "enterprise", label: "Enterprise PPM Platform" },
        { value: "small_business", label: "Small Business Trackers" },
        { value: "personal", label: "Personal Trackers" },
        { value: "partnership", label: "Partnership Inquiry" },
        { value: "other", label: "Other" },
    ],
};

// ─── Navigation ──────────────────────────────────────────────────────────────
export const NAV_LINKS = [
    { label: "Solutions", href: "#enterprise" },
    { label: "Trackers", href: "#trackers" },
    { label: "About", href: "#about" },
    { label: "Contact", href: "#contact" },
];
