import { TRUST } from "@/data/content";
import styles from "./TrustSection.module.css";

export function TrustSection() {
    return (
        <section className={styles.section}>
            <div className={`container ${styles.inner}`}>
                <p className={`${styles.headline} reveal`}>{TRUST.headline}</p>
                <div className={styles.stats}>
                    {TRUST.stats.map((stat, i) => (
                        <div key={i} className={`${styles.stat} reveal reveal-delay-${i + 1}`}>
                            <span className={styles.value}>{stat.value}</span>
                            <span className={styles.label}>{stat.label}</span>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
