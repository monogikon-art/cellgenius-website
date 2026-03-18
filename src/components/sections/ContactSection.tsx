"use client";

import { useState } from "react";
import { Send, CheckCircle } from "lucide-react";
import { CONTACT } from "@/data/content";
import styles from "./ContactSection.module.css";

export function ContactSection() {
    const [form, setForm] = useState({ name: "", email: "", interest: "", message: "" });
    const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus("sending");

        try {
            const res = await fetch("/api/contact", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });

            if (res.ok) {
                setStatus("sent");
                setForm({ name: "", email: "", interest: "", message: "" });
            } else {
                setStatus("error");
            }
        } catch {
            setStatus("error");
        }
    };

    return (
        <section id="contact" className={styles.section}>
            <div className={`container ${styles.inner}`}>
                {/* Text */}
                <div className={`${styles.textSide} reveal`}>
                    <h2 className={styles.headline}>{CONTACT.headline}</h2>
                    <p className={styles.subheadline}>{CONTACT.subheadline}</p>

                    <div className={styles.infoCards}>
                        <div className={styles.infoCard}>
                            <span className={styles.infoEmoji}>🏢</span>
                            <div>
                                <strong>Enterprise</strong>
                                <p>Custom demos and enterprise pricing</p>
                            </div>
                        </div>
                        <div className={styles.infoCard}>
                            <span className={styles.infoEmoji}>💼</span>
                            <div>
                                <strong>Small Business</strong>
                                <p>Affordable tracking solutions</p>
                            </div>
                        </div>
                        <div className={styles.infoCard}>
                            <span className={styles.infoEmoji}>👤</span>
                            <div>
                                <strong>Personal</strong>
                                <p>Free trackers for everyday life</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Form */}
                <div className={`${styles.formSide} reveal reveal-delay-2`}>
                    {status === "sent" ? (
                        <div className={styles.successCard}>
                            <CheckCircle size={48} className={styles.successIcon} />
                            <h3>Thank you!</h3>
                            <p>We have received your message and will get back to you shortly.</p>
                            <button
                                className="btn btn-outline"
                                onClick={() => setStatus("idle")}
                            >
                                Send another message
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className={styles.form}>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Full Name *</label>
                                <input
                                    type="text"
                                    required
                                    className="input input-dark"
                                    placeholder="John Smith"
                                    value={form.name}
                                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label className={styles.label}>Email Address *</label>
                                <input
                                    type="email"
                                    required
                                    className="input input-dark"
                                    placeholder="john@company.com"
                                    value={form.email}
                                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label className={styles.label}>I am interested in</label>
                                <select
                                    className="input input-dark"
                                    value={form.interest}
                                    onChange={(e) => setForm({ ...form, interest: e.target.value })}
                                >
                                    <option value="">Select your interest...</option>
                                    {CONTACT.interests.map((opt) => (
                                        <option key={opt.value} value={opt.value}>
                                            {opt.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className={styles.formGroup}>
                                <label className={styles.label}>Message *</label>
                                <textarea
                                    required
                                    className={`input input-dark ${styles.textarea}`}
                                    placeholder="Tell us about your needs..."
                                    rows={4}
                                    value={form.message}
                                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                                />
                            </div>

                            <button
                                type="submit"
                                className="btn btn-primary btn-lg"
                                disabled={status === "sending"}
                                style={{ width: "100%" }}
                            >
                                {status === "sending" ? (
                                    "Sending..."
                                ) : (
                                    <>Send Message <Send size={16} /></>
                                )}
                            </button>

                            {status === "error" && (
                                <p className={styles.error}>Something went wrong. Please try again.</p>
                            )}
                        </form>
                    )}
                </div>
            </div>
        </section>
    );
}
