"use client";

import { useState } from "react";
import { Check, X, ArrowRight, BarChart3 } from "lucide-react";
import { SITE } from "@/data/content";
import styles from "./pricing.module.css";

type BillingCycle = "monthly" | "annual";

const PLANS = [
    {
        key: "starter",
        name: "Starter",
        description: "For small teams getting started with project management.",
        monthlyPrice: 49,
        annualPrice: 499,
        seatLimit: "10 users",
        projectLimit: "20 projects",
        features: [
            "Core Project Management",
            "Requirements & Tasks",
            "RIAD (Risk, Issues, Actions, Decisions)",
            "Basic Reporting",
            "Email Notifications",
        ],
        excluded: [
            "No AI Capabilities",
            "No Strategy Module",
            "No CapEx Module",
        ],
        cta: "Start Free Trial",
        popular: false,
    },
    {
        key: "professional",
        name: "Professional",
        description: "For growing teams that need CapEx and roadmap visibility.",
        monthlyPrice: 149,
        annualPrice: 1499,
        seatLimit: "50 users",
        projectLimit: "50 projects",
        features: [
            "Everything in Starter",
            "Limited AI Capabilities",
            "CapEx Management",
            "Roadmap Module",
            "Custom Dashboards",
        ],
        excluded: [
            "No Strategy Module",
            "No Procurement Module",
        ],
        cta: "Start Free Trial",
        popular: true,
    },
    {
        key: "business",
        name: "Business",
        description: "For organizations needing strategy alignment and procurement.",
        monthlyPrice: 249,
        annualPrice: 2499,
        seatLimit: "100 users",
        projectLimit: "100 projects",
        features: [
            "Everything in Professional",
            "Limited AI Capabilities",
            "Strategy Module",
            "Procurement Module",
            "Advanced Reporting",
        ],
        excluded: [
            "No Jira / M365 APIs",
        ],
        cta: "Start Free Trial",
        popular: false,
    },
    {
        key: "enterprise",
        name: "Enterprise",
        description: "For large organizations with unlimited scale and integrations.",
        monthlyPrice: null,
        annualPrice: null,
        seatLimit: "Unlimited users",
        projectLimit: "Unlimited projects",
        features: [
            "Everything in Business",
            "Full AI Capabilities",
            "Jira API Integration",
            "Microsoft 365 Integration",
            "Dedicated Support & SLA",
        ],
        excluded: [],
        cta: "Contact Sales",
        popular: false,
        contactSales: true,
    },
];

export default function PricingPage() {
    const [billing, setBilling] = useState<BillingCycle>("monthly");

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

                {/* Billing Toggle */}
                <div className={styles.toggle}>
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
                {PLANS.map((plan) => (
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
                                        /{billing === "monthly" ? "mo" : "yr"}
                                    </span>
                                </>
                            ) : (
                                <span className={styles.price}>Custom</span>
                            )}
                        </div>

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
                                    <li key={`ex-${i}`} style={{ color: 'var(--color-text-muted, #666)' }}>
                                        <X size={14} style={{ color: '#ef4444' }} />
                                        {f}
                                    </li>
                                ))}
                            </ul>
                        )}

                        <a
                            href={(plan as any).contactSales ? "/#contact" : `${SITE.ppmSignupUrl}?plan=${plan.key}&billing=${billing}`}
                            className={`btn ${plan.popular ? "btn-primary" : "btn-outline"} ${styles.planCta}`}
                        >
                            {plan.cta} <ArrowRight size={16} />
                        </a>
                    </div>
                ))}
            </div>

            {/* FAQ / Bottom */}
            <div className={styles.bottom}>
                <p>
                    Need a custom plan or have questions?{" "}
                    <a href="/#contact" className={styles.contactLink}>Contact us</a>
                </p>
            </div>
        </div>
    );
}
