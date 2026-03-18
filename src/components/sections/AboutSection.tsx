import { Lightbulb, Users, ShieldCheck } from "lucide-react";
import { ABOUT } from "@/data/content";
import styles from "./AboutSection.module.css";

const VALUE_ICONS = [
    <Lightbulb key="0" size={22} />,
    <Users key="1" size={22} />,
    <ShieldCheck key="2" size={22} />,
];

export function AboutSection() {
    return (
        <section id="about" className={styles.section}>
            <div className="container">
                <div className={`${styles.header} reveal`}>
                    <h2 className={styles.headline}>{ABOUT.headline}</h2>
                    <p className={styles.mission}>{ABOUT.mission}</p>
                </div>

                <div className={styles.grid}>
                    {ABOUT.values.map((val, i) => (
                        <div key={i} className={`${styles.card} reveal reveal-delay-${i + 1}`}>
                            <div className={styles.iconWrap}>
                                {VALUE_ICONS[i]}
                            </div>
                            <h3 className={styles.cardTitle}>{val.title}</h3>
                            <p className={styles.cardDesc}>{val.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
