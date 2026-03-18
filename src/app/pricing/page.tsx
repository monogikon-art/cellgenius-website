"use client";

import { useState } from "react";
import { Check, ArrowRight, BarChart3 } from "lucide-react";
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
        projectLimit: "5 projects",
        features: [
            "Core Project Management",
            "Requirements & Tasks",
            "RIAD (Risk, Issues, Actions, Decisions)",
            "Basic Reporting",
            "Email Notifications",
        ],
        cta: "Start Free Trial",
        popular: false,
    },
    {
        key: "professional",
        name: "Professional",
        description: "For growing teams that need AI-powered insights and advanced features.",
        monthlyPrice: 149,
        annualPrice: 1499,
        seatLimit: "50 users",
        projectLimit: "25 projects",
        features: [
            "Everything in Starter",
            "AI-Powered Reports & Insights",
            "Microsoft Teams Integration",
            "Advanced CapEx Management",
            "API Access",
            "Custom Dashboards",
        ],
        cta: "Start Free Trial",
        popular: true,
    },
    {
        key: "enterprise",
        name: "Enterprise",
        description: "For large organizations with unlimited scale and dedicated support.",
        monthlyPrice: 499,
        annualPrice: 4999,
        seatLimit: "Unlimited users",
        projectLimit: "Unlimited projects",
        features: [
            "Everything in Professional",
            "Unlimited Seats & Projects",
            "Custom SSO / SAML",
            "Dedicated Support & SLA",
            "Audit Logs",
            "On-Premise Option",
        ],
        cta: "Contact Sales",
        popular: false,
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
                            <span className={styles.currency}>$</span>
                            <span className={styles.price}>
                                {billing === "monthly" ? plan.monthlyPrice : plan.annualPrice}
                            </span>
                            <span className={styles.period}>
                                /{billing === "monthly" ? "mo" : "yr"}
                            </span>
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

                        <a
                            href={`${SITE.ppmSignupUrl}?plan=${plan.key}&billing=${billing}`}
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
