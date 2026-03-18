import { Bell } from "lucide-react";
import { TRACKERS } from "@/data/content";
import styles from "./TrackersSection.module.css";

export function TrackersSection() {
    return (
        <section id="trackers" className={styles.section}>
            <div className={`container ${styles.inner}`}>
                <div className="reveal">
                    <span className="badge badge-purple">{TRACKERS.badge}</span>
                    <h2 className={styles.headline}>{TRACKERS.headline}</h2>
                    <p className={styles.subheadline}>{TRACKERS.subheadline}</p>
                </div>

                {/* Coming Soon Card */}
                <div className={`${styles.comingSoon} reveal`}>
                    <div className={styles.comingSoonIcon}>
                        <Bell size={32} />
                    </div>
                    <p className={styles.comingSoonText}>{TRACKERS.comingSoonMessage}</p>
                    <div className={styles.previewGrid}>
                        <div className={styles.previewCard}>
                            <span className={styles.previewEmoji}>❤️</span>
                            <span>Health Tracker</span>
                        </div>
                        <div className={styles.previewCard}>
                            <span className={styles.previewEmoji}>🎉</span>
                            <span>Event Planner</span>
                        </div>
                        <div className={styles.previewCard}>
                            <span className={styles.previewEmoji}>💰</span>
                            <span>Finance Tracker</span>
                        </div>
                        <div className={styles.previewCard}>
                            <span className={styles.previewEmoji}>✅</span>
                            <span>Task Manager</span>
                        </div>
                    </div>
                    <button className="btn btn-outline btn-lg" style={{ marginTop: "1.5rem" }}>
                        <Bell size={16} /> {TRACKERS.ctaLabel}
                    </button>
                </div>
            </div>
        </section>
    );
}
