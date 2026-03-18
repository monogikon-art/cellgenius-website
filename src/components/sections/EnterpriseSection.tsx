import { ArrowRight, Check, Sparkles, Target, Shield, Workflow, Package, Users, Monitor, Brain, Link } from "lucide-react";
import { ENTERPRISE, VALUE_PROPS } from "@/data/content";
import styles from "./EnterpriseSection.module.css";

const FEATURE_ICONS = [
    <Target key="0" size={24} />,
    <Sparkles key="1" size={24} />,
    <Package key="2" size={24} />,
    <Users key="3" size={24} />,
    <Shield key="4" size={24} />,
    <Workflow key="5" size={24} />,
];

// CSS-rendered feature visuals (no external images needed)
function FeatureVisual({ index }: { index: number }) {
    const visuals = [
        // 0 — Strategy Cascade
        <div key="0" className={styles.visualCard}>
            <div className={styles.cascade}>
                <div className={`${styles.cascadeNode} ${styles.nodeKPI}`}>
                    <span className={styles.nodeIcon}>◎</span> Corporate KPIs
                </div>
                <div className={styles.cascadeLine} />
                <div className={`${styles.cascadeNode} ${styles.nodeOKR}`}>
                    <span className={styles.nodeIcon}>◈</span> OKRs
                </div>
                <div className={styles.cascadeLine} />
                <div className={`${styles.cascadeNode} ${styles.nodeProject}`}>
                    <span className={styles.nodeIcon}>◆</span> Projects
                </div>
                <div className={styles.progressRow}>
                    <div className={styles.progressItem}>
                        <div className={styles.progressBar}><div className={styles.progressFill} style={{ width: "85%" }} /></div>
                        <span>Revenue Growth</span>
                    </div>
                    <div className={styles.progressItem}>
                        <div className={styles.progressBar}><div className={`${styles.progressFill} ${styles.fillIndigo}`} style={{ width: "62%" }} /></div>
                        <span>Market Expansion</span>
                    </div>
                </div>
            </div>
        </div>,

        // 1 — AI Zero-Effort Planning
        <div key="1" className={styles.visualCard}>
            <div className={styles.aiPanel}>
                <div className={styles.aiHeader}>
                    <span className={styles.aiDot} /> AI Planning Engine
                </div>
                <div className={styles.aiItem}>
                    <span className={styles.aiStatusGreen}>●</span>
                    <span>Auto-generated Gantt chart — 47 tasks created</span>
                </div>
                <div className={styles.aiItem}>
                    <span className={styles.aiStatusGreen}>●</span>
                    <span>Design workshops scheduled (Weeks 1-3)</span>
                </div>
                <div className={styles.aiItem}>
                    <span className={styles.aiStatusAmber}>●</span>
                    <span>Dev packages planned across 4 sprints</span>
                </div>
                <div className={styles.aiItem}>
                    <span className={styles.aiStatusGreen}>●</span>
                    <span>Test cycles allocated: SIT, UAT, E2E</span>
                </div>
                <div className={styles.aiItem}>
                    <span className={styles.aiStatusGreen}>●</span>
                    <span>Change enablement & deployment releases linked</span>
                </div>
                <div className={styles.aiFooter}>✦ Zero manual planning effort required</div>
            </div>
        </div>,

        // 2 — Vendor Platform
        <div key="2" className={styles.visualCard}>
            <div className={styles.vendorPanel}>
                <div className={styles.vendorHeader}>Vendor Development Portal</div>
                <div className={styles.vendorItem}>
                    <div className={styles.vendorPackage}>
                        <span className={styles.vendorDot} />
                        <div>
                            <strong>PKG-001</strong>
                            <span className={styles.vendorMeta}>Login Module → REQ-142, REQ-143</span>
                        </div>
                    </div>
                    <span className={styles.vendorBadgeGreen}>Delivered</span>
                </div>
                <div className={styles.vendorItem}>
                    <div className={styles.vendorPackage}>
                        <span className={`${styles.vendorDot} ${styles.vendorDotAmber}`} />
                        <div>
                            <strong>PKG-002</strong>
                            <span className={styles.vendorMeta}>Payment API → REQ-201, REQ-202</span>
                        </div>
                    </div>
                    <span className={styles.vendorBadgeAmber}>In Progress</span>
                </div>
                <div className={styles.vendorItem}>
                    <div className={styles.vendorPackage}>
                        <span className={`${styles.vendorDot} ${styles.vendorDotGray}`} />
                        <div>
                            <strong>PKG-003</strong>
                            <span className={styles.vendorMeta}>Reports Engine → REQ-310</span>
                        </div>
                    </div>
                    <span className={styles.vendorBadgeGray}>Planned</span>
                </div>
            </div>
        </div>,

        // 3 — Agile Board
        <div key="3" className={styles.visualCard}>
            <div className={styles.agileBoard}>
                <div className={styles.agileHeader}>Sprint 7 — Agile Board</div>
                <div className={styles.agileColumns}>
                    <div className={styles.agileCol}>
                        <span className={styles.agileColLabel}>Backlog</span>
                        <div className={`${styles.agileTask} ${styles.agileTaskBlue}`}>API integration</div>
                        <div className={`${styles.agileTask} ${styles.agileTaskBlue}`}>Data migration</div>
                    </div>
                    <div className={styles.agileCol}>
                        <span className={styles.agileColLabel}>In Progress</span>
                        <div className={`${styles.agileTask} ${styles.agileTaskAmber}`}>UI redesign</div>
                        <div className={`${styles.agileTask} ${styles.agileTaskAmber}`}>Auth module</div>
                    </div>
                    <div className={styles.agileCol}>
                        <span className={styles.agileColLabel}>Done</span>
                        <div className={`${styles.agileTask} ${styles.agileTaskGreen}`}>DB schema ✓</div>
                        <div className={`${styles.agileTask} ${styles.agileTaskGreen}`}>CI/CD setup ✓</div>
                    </div>
                </div>
            </div>
        </div>,

        // 4 — Delivery Dashboard
        <div key="4" className={styles.visualCard}>
            <div className={styles.deliveryGrid}>
                <div className={styles.deliveryCard}>
                    <span className={styles.deliveryLabel}>CapEx Budget</span>
                    <span className={styles.deliveryValue}>$2.4M</span>
                    <div className={styles.deliveryBar}><div className={styles.deliveryFill} style={{ width: "68%" }} /></div>
                </div>
                <div className={styles.deliveryCard}>
                    <span className={styles.deliveryLabel}>Test Coverage</span>
                    <span className={`${styles.deliveryValue} ${styles.valueGreen}`}>92%</span>
                    <div className={styles.deliveryBar}><div className={`${styles.deliveryFill} ${styles.fillGreen}`} style={{ width: "92%" }} /></div>
                </div>
                <div className={styles.deliveryCard}>
                    <span className={styles.deliveryLabel}>Vendor Releases</span>
                    <span className={`${styles.deliveryValue} ${styles.valuePurple}`}>8</span>
                    <div className={styles.deliveryBar}><div className={`${styles.deliveryFill} ${styles.fillPurple}`} style={{ width: "50%" }} /></div>
                </div>
                <div className={styles.deliveryCard}>
                    <span className={styles.deliveryLabel}>Deployments</span>
                    <span className={`${styles.deliveryValue} ${styles.valueIndigo}`}>3</span>
                    <div className={styles.deliveryBar}><div className={`${styles.deliveryFill} ${styles.fillIndigo}`} style={{ width: "75%" }} /></div>
                </div>
            </div>
        </div>,

        // 5 — Smart Workflows
        <div key="5" className={styles.visualCard}>
            <div className={styles.workflowPanel}>
                <div className={styles.workflowItem}>
                    <div className={styles.workflowStep}>
                        <span className={styles.stepNum}>1</span>
                        <span>Procurement Request</span>
                    </div>
                    <div className={styles.workflowArrow}>→</div>
                </div>
                <div className={styles.workflowItem}>
                    <div className={styles.workflowStep}>
                        <span className={`${styles.stepNum} ${styles.stepIndigo}`}>2</span>
                        <span>Vendor Evaluation</span>
                    </div>
                    <div className={styles.workflowArrow}>→</div>
                </div>
                <div className={styles.workflowItem}>
                    <div className={styles.workflowStep}>
                        <span className={`${styles.stepNum} ${styles.stepPurple}`}>3</span>
                        <span>Auto-Schedule</span>
                    </div>
                    <div className={styles.workflowArrow}>→</div>
                </div>
                <div className={styles.workflowItem}>
                    <div className={styles.workflowStep}>
                        <span className={`${styles.stepNum} ${styles.stepGreen}`}>✓</span>
                        <span>Roadmap Updated</span>
                    </div>
                </div>
            </div>
        </div>,
    ];
    return visuals[index] || null;
}

export function EnterpriseSection() {
    return (
        <section id="enterprise" className={styles.section}>
            <div className="container">
                {/* Header */}
                <div className={`${styles.header} reveal`}>
                    <span className="badge badge-teal">{ENTERPRISE.badge}</span>
                    <h2 className={styles.headline}>{ENTERPRISE.headline}</h2>
                    <p className={styles.subheadline}>{ENTERPRISE.subheadline}</p>
                </div>

                {/* Value Propositions */}
                <div className={styles.valueGrid}>
                    {VALUE_PROPS.map((prop, i) => {
                        const icons: Record<string, React.ReactNode> = {
                            Monitor: <Monitor size={28} />,
                            Brain: <Brain size={28} />,
                            Link: <Link size={28} />,
                        };
                        return (
                            <div key={i} className={`${styles.valueCard} reveal reveal-delay-${i + 1}`}>
                                <div className={styles.valueIconWrap}>{icons[prop.icon]}</div>
                                <h3 className={styles.valueTitle}>{prop.title}</h3>
                                <p className={styles.valueDesc}>{prop.description}</p>
                            </div>
                        );
                    })}
                </div>

                {/* Features — alternating layout */}
                <div className={styles.features}>
                    {ENTERPRISE.features.map((feature, i) => (
                        <div
                            key={i}
                            className={`${styles.featureRow} ${i % 2 === 1 ? styles.reversed : ""} reveal`}
                        >
                            <div className={styles.featureText}>
                                <div className={styles.featureIcon}>
                                    {FEATURE_ICONS[i]}
                                </div>
                                <h3 className={styles.featureTitle}>{feature.title}</h3>
                                <p className={styles.featureDesc}>{feature.description}</p>
                                <ul className={styles.bullets}>
                                    {feature.bullets.map((b, j) => (
                                        <li key={j}>
                                            <Check size={14} className={styles.checkIcon} />
                                            {b}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className={styles.featureVisual}>
                                <FeatureVisual index={i} />
                            </div>
                        </div>
                    ))}
                </div>

                {/* CTA */}
                <div className={`${styles.ctaWrap} reveal`}>
                    <a href={ENTERPRISE.cta.href} className="btn btn-primary btn-lg">
                        {ENTERPRISE.cta.label} <ArrowRight size={18} />
                    </a>
                </div>
            </div>
        </section>
    );
}
