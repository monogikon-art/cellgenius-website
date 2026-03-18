"use client";

import { useState, useEffect } from "react";
import { BarChart3, Menu, X } from "lucide-react";
import { SITE, NAV_LINKS } from "@/data/content";
import styles from "./Header.module.css";

export function Header() {
    const [scrolled, setScrolled] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 50);
        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <header className={`${styles.header} ${scrolled ? styles.scrolled : ""}`}>
            <div className={`container ${styles.inner}`}>
                {/* Logo */}
                <a href="#" className={styles.logo}>
                    <div className={styles.logoIcon}>
                        <BarChart3 size={22} color="#fff" />
                    </div>
                    <div>
                        <span className={styles.logoName}>{SITE.name}</span>
                        <span className={styles.logoTag}>Intelligent Software</span>
                    </div>
                </a>

                {/* Desktop Nav */}
                <nav className={styles.desktopNav}>
                    {NAV_LINKS.map((link) => (
                        <a key={link.href} href={link.href} className={styles.navLink}>
                            {link.label}
                        </a>
                    ))}
                    <a href={SITE.ppmSignupUrl} className="btn btn-primary btn-sm">
                        Get Started
                    </a>
                </nav>

                {/* Mobile Toggle */}
                <button
                    className={styles.mobileToggle}
                    onClick={() => setMobileOpen(!mobileOpen)}
                    aria-label="Menu"
                >
                    {mobileOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Mobile Nav */}
            {mobileOpen && (
                <nav className={styles.mobileNav}>
                    {NAV_LINKS.map((link) => (
                        <a
                            key={link.href}
                            href={link.href}
                            className={styles.mobileLink}
                            onClick={() => setMobileOpen(false)}
                        >
                            {link.label}
                        </a>
                    ))}
                    <a href={SITE.ppmSignupUrl} className="btn btn-primary" style={{ width: "100%" }}>
                        Get Started
                    </a>
                </nav>
            )}
        </header>
    );
}
