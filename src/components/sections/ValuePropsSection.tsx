import { Monitor, Brain, Link } from "lucide-react";
import { VALUE_PROPS } from "@/data/content";
import styles from "./ValuePropsSection.module.css";

const ICONS: Record<string, React.ReactNode> = {
    Monitor: <Monitor size={28} />,
    Brain: <Brain size={28} />,
    Link: <Link size={28} />,
};

export function ValuePropsSection() {
    return (
        <section className={styles.section}>
            <div className="container">
                <div className={styles.grid}>
                    {VALUE_PROPS.map((prop, i) => (
                        <div key={i} className={`${styles.card} reveal reveal-delay-${i + 1}`}>
                            <div className={styles.iconWrap}>
                                {ICONS[prop.icon]}
                            </div>
                            <h3 className={styles.title}>{prop.title}</h3>
                            <p className={styles.desc}>{prop.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
