"use client";

import { useState } from "react";
import { Check, X, ArrowRight, BarChart3, Sparkles, KeyRound } from "lucide-react";
import { SITE } from "@/data/content";
import styles from "./pricing.module.css";

type BillingCycle = "monthly" | "annual";
type SourcingMode = "platform" | "byok";

/**
 * Plan SKUs mirror `ppm-app/src/lib/ai/planCatalogue.ts`. Keep prices in
 * sync when the catalogue's PLACEHOLDER numbers are replaced with real
 * ones.
 *
 *   - PLATFORM ("AI on us") — we manage Anthropic / OpenAI / Google keys
 *     and a fixed monthly USD AI budget is bundled into the seat price.
 *   - BYOK ("Bring your own keys") — customer plugs in their own provider
 *     keys and pays the AI provider directly. No AI cap enforced by us.
 */
const PLANS: {
    key: string;
    name: string;
    description: string;
    seatLimit: string;
    projectLimit: string;
    monthlyPrice: number | null;
    annualPrice: number | null;
    aiBundle: string | null;
    features: string[];
    excluded: string[];
    popular?: boolean;
    contactSales?: boolean;
    mode: SourcingMode;
}[] = [
    // ─── AI ON US (PLATFORM) ────────────────────────────────────────────────
    {
        key: "starter-platform",
        name: "Starter",
        description: "Small teams getting started — AI included, no keys required.",
        seatLimit: "Up to 25 editors",
        projectLimit: "20 projects",
        monthlyPrice: 29,
        annualPrice: 290,
        aiBundle: "$50 / month of AI usage included",
        features: [
            "Core PPM (projects, requirements, RIAD)",
            "AI managed by CellGenius",
            "75 / 90 / 100% usage alerts",
            "Email support",
        ],
        excluded: ["No SSO", "No procurement module"],
        mode: "platform",
    },
    {
        key: "pro-platform",
        name: "Pro",
        description: "Growing PMOs with strategy and CapEx needs.",
        seatLimit: "Up to 200 editors",
        projectLimit: "Unlimited projects",
        monthlyPrice: 59,
        annualPrice: 590,
        aiBundle: "$300 / month of AI usage included",
        features: [
            "Everything in Starter",
            "Strategy + OKR module",
            "CapEx management & roadmap",
            "SSO & audit log",
            "Premium support",
        ],
        excluded: ["No SAML / DPA", "No 99.95% SLA"],
        popular: true,
        mode: "platform",
    },
    {
        key: "enterprise-platform",
        name: "Enterprise",
        description: "Large organisations with custom AI budgets and SLAs.",
        seatLimit: "Unlimited editors",
        projectLimit: "Unlimited projects",
        monthlyPrice: null,
        annualPrice: null,
        aiBundle: "From $2,000 / month of AI usage (custom)",
        features: [
            "Everything in Pro",
            "Custom AI budget & dedicated capacity",
            "SAML SSO + DPA",
            "99.95% uptime SLA",
            "Jira & Microsoft 365 integrations",
            "Dedicated success manager",
        ],
        excluded: [],
        contactSales: true,
        mode: "platform",
    },
    // ─── BRING YOUR OWN KEYS ────────────────────────────────────────────────
    {
        key: "starter-byok",
        name: "Starter",
        description: "Small teams that already have AI provider accounts.",
        seatLimit: "Up to 25 editors",
        projectLimit: "20 projects",
        monthlyPrice: 12,
        annualPrice: 120,
        aiBundle: "You pay AI providers directly · no AI cap",
        features: [
            "Core PPM (projects, requirements, RIAD)",
            "Bring keys for Anthropic / OpenAI / Google",
            "Per-account AI cost dashboard",
            "Email support",
        ],
        excluded: ["No SSO", "No procurement module"],
        mode: "byok",
    },
    {
        key: "pro-byok",
        name: "Pro",
        description: "Growing PMOs that want to control AI cost directly.",
        seatLimit: "Up to 200 editors",
        projectLimit: "Unlimited projects",
        monthlyPrice: 25,
        annualPrice: 250,
        aiBundle: "You pay AI providers directly · no AI cap",
        features: [
            "Everything in Starter",
            "Strategy + OKR module",
            "CapEx management & roadmap",
            "SSO & audit log",
            "Premium support",
        ],
        excluded: ["No SAML / DPA", "No 99.95% SLA"],
        popular: true,
        mode: "byok",
    },
    {
        key: "enterprise-byok",
        name: "Enterprise",
        description: "Large organisations with their own AI vendor agreements.",
        seatLimit: "Unlimited editors",
        projectLimit: "Unlimited projects",
        monthlyPrice: null,
        annualPrice: null,
        aiBundle: "You pay AI providers directly · no AI cap",
        features: [
            "Everything in Pro",
            "SAML SSO + DPA",
            "99.95% uptime SLA",
            "Jira & Microsoft 365 integrations",
            "Dedicated success manager",
        ],
        excluded: [],
        contactSales: true,
        mode: "byok",
    },
];

export default function PricingPage() {
    const [billing, setBilling] = useState<BillingCycle>("monthly");
    const [mode, setMode] = useState<SourcingMode>("platform");

    const visible = PLANS.filter((p) => p.mode === mode);

    return (
        <div className={styles.page}>
            {/* Nav */}
            <header className={styles.nav}>
                <a href="/" className={styles.logo}>
                    <div className={styles.logoIcon}>
                        <BarChart3 size={20} color="#fff" />
                    </div>
                    <span className={styles.logoName}>CellGenius</span>
                </a>
                <a href="/#enterprise" className={styles.backLink}>← Back to Home</a>
            </header>

            {/* Header */}
            <div className={styles.header}>
                <span className={styles.badge}>PPM Pricing</span>
                <h1 className={styles.headline}>Choose the plan that fits your team</h1>
                <p className={styles.subheadline}>
                    All plans include a 30-day free trial. No credit card required.
                </p>

                {/* AI Sourcing Toggle */}
                <div
                    className={styles.toggle}
                    style={{ marginTop: "1.25rem", maxWidth: 480 }}
                    role="tablist"
                    aria-label="AI sourcing mode"
                >
                    <button
                        role="tab"
                        aria-selected={mode === "platform"}
                        className={`${styles.toggleBtn} ${mode === "platform" ? styles.toggleActive : ""}`}
                        onClick={() => setMode("platform")}
                        style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem" }}
                    >
                        <Sparkles size={14} /> AI on us
                    </button>
                    <button
                        role="tab"
                        aria-selected={mode === "byok"}
                        className={`${styles.toggleBtn} ${mode === "byok" ? styles.toggleActive : ""}`}
                        onClick={() => setMode("byok")}
                        style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem" }}
                    >
                        <KeyRound size={14} /> Bring your own keys
                    </button>
                </div>

                <p
                    style={{
                        marginTop: "0.6rem",
                        fontSize: "0.85rem",
                        color: "var(--gray-400, #94a3b8)",
                        maxWidth: 640,
                    }}
                >
                    {mode === "platform"
                        ? "We manage your AI providers and bundle a monthly AI budget into each seat. You only see one bill."
                        : "Plug in your own Anthropic / OpenAI / Google keys. Lower seat price; you pay the AI providers directly."}
                </p>

                {/* Billing Toggle */}
                <div className={styles.toggle} style={{ marginTop: "1.25rem" }}>
                    <button
                        className={`${styles.toggleBtn} ${billing === "monthly" ? styles.toggleActive : ""}`}
                        onClick={() => setBilling("monthly")}
                    >
                        Monthly
                    </button>
                    <button
                        className={`${styles.toggleBtn} ${billing === "annual" ? styles.toggleActive : ""}`}
                        onClick={() => setBilling("annual")}
                    >
                        Annual <span className={styles.saveBadge}>Save ~15%</span>
                    </button>
                </div>
            </div>

            {/* Plans Grid */}
            <div className={styles.grid}>
                {visible.map((plan) => (
                    <div
                        key={plan.key}
                        className={`${styles.card} ${plan.popular ? styles.cardPopular : ""}`}
                    >
                        {plan.popular && <div className={styles.popularBadge}>Most Popular</div>}
                        <div className={styles.cardHeader}>
                            <h2 className={styles.planName}>{plan.name}</h2>
                            <p className={styles.planDesc}>{plan.description}</p>
                        </div>

                        <div className={styles.priceBlock}>
                            {plan.monthlyPrice !== null ? (
                                <>
                                    <span className={styles.currency}>$</span>
                                    <span className={styles.price}>
                                        {billing === "monthly" ? plan.monthlyPrice : plan.annualPrice}
                                    </span>
                                    <span className={styles.period}>
                                        /seat /{billing === "monthly" ? "mo" : "yr"}
                                    </span>
                                </>
                            ) : (
                                <span className={styles.price}>Custom</span>
                            )}
                        </div>

                        {plan.aiBundle && (
                            <div
                                style={{
                                    fontSize: "0.78rem",
                                    color: mode === "platform" ? "#4ade80" : "#67e8f9",
                                    fontWeight: 600,
                                    margin: "0.4rem 0 0.8rem",
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: "0.35rem",
                                }}
                            >
                                {mode === "platform" ? <Sparkles size={13} /> : <KeyRound size={13} />}
                                {plan.aiBundle}
                            </div>
                        )}

                        <div className={styles.limits}>
                            <span>{plan.seatLimit}</span>
                            <span className={styles.limitDot}>·</span>
                            <span>{plan.projectLimit}</span>
                        </div>

                        <ul className={styles.features}>
                            {plan.features.map((f, i) => (
                                <li key={i}>
                                    <Check size={14} className={styles.checkIcon} />
                                    {f}
                                </li>
                            ))}
                        </ul>

                        {plan.excluded && plan.excluded.length > 0 && (
                            <ul className={styles.features} style={{ opacity: 0.5 }}>
                                {plan.excluded.map((f, i) => (
                                    <li key={`ex-${i}`} style={{ color: "var(--color-text-muted, #666)" }}>
                                        <X size={14} style={{ color: "#ef4444" }} />
                                        {f}
                                    </li>
                                ))}
                            </ul>
                        )}

                        <a
                            href={
                                plan.contactSales
                                    ? "/#contact"
                                    : `${SITE.ppmSignupUrl}?plan=${plan.key}&billing=${billing}`
                            }
                            className={`btn ${plan.popular ? "btn-primary" : "btn-outline"} ${styles.planCta}`}
                        >
                            {plan.contactSales ? "Contact Sales" : "Start Free Trial"} <ArrowRight size={16} />
                        </a>
                    </div>
                ))}
            </div>

            {/* FAQ / Bottom */}
            <div className={styles.bottom}>
                <p style={{ marginBottom: "0.5rem" }}>
                    Not sure which mode is right for you?{" "}
                    <a href="/#contact" className={styles.contactLink}>Talk to us</a>
                </p>
                <p style={{ fontSize: "0.8rem", color: "var(--gray-400, #94a3b8)" }}>
                    AI on us is simplest — one bill, predictable cost. Bring your own keys is cheapest per
                    seat when you already pay an AI provider, and gives you direct control over your AI
                    spend.
                </p>
            </div>
        </div>
    );
}
