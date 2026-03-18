import { HERO } from "@/data/content";
import styles from "./HeroSection.module.css";

export function HeroSection() {
    return (
        <section className={styles.hero}>
            {/* Animated background */}
            <div className={styles.bgGrid} />
            <div className={styles.glowOrb1} />
            <div className={styles.glowOrb2} />
            <div className={styles.glowOrb3} />

            <div className={`container ${styles.inner}`}>
                {/* Text Side */}
                <div className={styles.text}>
                    <h1 className={styles.headline}>
                        {HERO.headline}
                        <br />
                        <span className="text-gradient">{HERO.headlineAccent}</span>
                    </h1>
                    <p className={styles.subheadline}>{HERO.subheadline}</p>
                    <div className={styles.ctas}>
                        <a href={HERO.cta1.href} className="btn btn-primary btn-lg">
                            {HERO.cta1.label}
                        </a>
                        <a href={HERO.cta2.href} className="btn btn-secondary btn-lg">
                            {HERO.cta2.label}
                        </a>
                    </div>
                </div>

                {/* Visual Side — stylized dashboard preview */}
                <div className={styles.visual}>
                    <div className={styles.dashboardFrame}>
                        {/* Header bar */}
                        <div className={styles.dashHeader}>
                            <div className={styles.dots}>
                                <span /><span /><span />
                            </div>
                            <span className={styles.dashTitle}>CellGenius PPM</span>
                        </div>

                        {/* KPI Row */}
                        <div className={styles.kpiRow}>
                            <div className={styles.kpi}>
                                <span className={styles.kpiValue}>94%</span>
                                <span className={styles.kpiLabel}>On Track</span>
                            </div>
                            <div className={styles.kpi}>
                                <span className={`${styles.kpiValue} ${styles.kpiTeal}`}>47</span>
                                <span className={styles.kpiLabel}>Active Projects</span>
                            </div>
                            <div className={styles.kpi}>
                                <span className={`${styles.kpiValue} ${styles.kpiPurple}`}>12</span>
                                <span className={styles.kpiLabel}>AI Alerts</span>
                            </div>
                        </div>

                        {/* Mini Gantt */}
                        <div className={styles.gantt}>
                            <div className={styles.ganttLabel}>Strategic Initiative A</div>
                            <div className={styles.ganttBar} style={{ width: "85%" }}>
                                <div className={styles.ganttFill} style={{ width: "75%" }} />
                            </div>
                            <div className={styles.ganttLabel}>Platform Migration</div>
                            <div className={styles.ganttBar} style={{ width: "65%" }}>
                                <div className={`${styles.ganttFill} ${styles.ganttFillIndigo}`} style={{ width: "45%" }} />
                            </div>
                            <div className={styles.ganttLabel}>AI Integration Phase</div>
                            <div className={styles.ganttBar} style={{ width: "50%" }}>
                                <div className={`${styles.ganttFill} ${styles.ganttFillPurple}`} style={{ width: "30%" }} />
                            </div>
                        </div>

                        {/* Status row */}
                        <div className={styles.statusRow}>
                            <div className={styles.statusBadge}>
                                <span className={styles.statusDot} /> 6 Completed
                            </div>
                            <div className={`${styles.statusBadge} ${styles.statusAmber}`}>
                                <span className={`${styles.statusDot} ${styles.statusDotAmber}`} /> 3 At Risk
                            </div>
                            <div className={`${styles.statusBadge} ${styles.statusAI}`}>
                                ✦ AI Report Ready
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Scroll indicator */}
            <div className={styles.scrollIndicator}>
                <div className={styles.scrollMouse}>
                    <div className={styles.scrollWheel} />
                </div>
            </div>
        </section>
    );
}
