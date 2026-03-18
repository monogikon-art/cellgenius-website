import { BarChart3, Mail, MapPin, ExternalLink } from "lucide-react";
import { SITE, NAV_LINKS } from "@/data/content";
import styles from "./Footer.module.css";

export function Footer() {
    return (
        <footer className={styles.footer}>
            <div className={`container ${styles.inner}`}>
                {/* Brand Column */}
                <div className={styles.brand}>
                    <div className={styles.logo}>
                        <div className={styles.logoIcon}>
                            <BarChart3 size={20} color="#fff" />
                        </div>
                        <span className={styles.logoName}>{SITE.name}</span>
                    </div>
                    <p className={styles.brandText}>
                        Making organization effortless through data and AI — from everyday life to enterprise strategy.
                    </p>
                    <div className={styles.contactInfo}>
                        <a href={`mailto:${SITE.email}`} className={styles.contactLink}>
                            <Mail size={14} /> {SITE.email}
                        </a>
                    </div>
                </div>

                {/* Products */}
                <div className={styles.column}>
                    <h4 className={styles.columnTitle}>Products</h4>
                    <a href="#enterprise" className={styles.footerLink}>Enterprise PPM</a>
                    <a href="#trackers" className={styles.footerLink}>Personal Trackers</a>
                    <a href={SITE.ppmSignupUrl} className={styles.footerLink}>
                        Start Free Trial <ExternalLink size={12} />
                    </a>
                </div>

                {/* Company */}
                <div className={styles.column}>
                    <h4 className={styles.columnTitle}>Company</h4>
                    {NAV_LINKS.map((link) => (
                        <a key={link.href} href={link.href} className={styles.footerLink}>
                            {link.label}
                        </a>
                    ))}
                </div>

                {/* Legal */}
                <div className={styles.column}>
                    <h4 className={styles.columnTitle}>Legal</h4>
                    <a href="#" className={styles.footerLink}>Privacy Policy</a>
                    <a href="#" className={styles.footerLink}>Terms of Service</a>
                    <a href="#" className={styles.footerLink}>Cookie Policy</a>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className={styles.bottom}>
                <div className="container">
                    <p className={styles.copyright}>{SITE.copyright}</p>
                </div>
            </div>
        </footer>
    );
}
