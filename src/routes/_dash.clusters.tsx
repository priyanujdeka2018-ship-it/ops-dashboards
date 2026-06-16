// Module B v2 — Semantic Clusters / Structural Fix Cards.
import { createFileRoute } from "@tanstack/react-router";
import { useDash } from "@/dashboards/app-context";
// @ts-expect-error jsx
import { AurSection, AurStatusPill, aurMono, aurSerif } from "@/dashboards/atoms.jsx";
// @ts-expect-error jsx
import { WORK_TYPE_LABELS, ROOT_CAUSE_LABELS, ROOT_CAUSE_FIX, ROOT_CAUSE_DECISION } from "@/dashboards/data-utils.jsx";
import { Loading } from "./_dash.index";

export const Route = createFileRoute("/_dash/clusters")({
  head: () => ({ meta: [
    { title: "Semantic Clusters · Scale Ops" },
    { name: "description", content: "Module B v2: TF-IDF + cosine clusters that catch repeat themes across different root-cause labels." },
  ]}),
  component: Clusters,
});

function Clusters() {
  const { data: d, AUR, densityPreset } = useDash();
  if (!d) return <Loading AUR={AUR} />;

  return (
    <AurSection AUR={AUR} density={densityPreset}
      eyebrow="Module B v2 · Semantic clusters"
      title="When different teams describe the same breakdown."
      lede="TF-IDF + cosine similarity finds repeat themes that don't share a root-cause label. Each cluster becomes a structural fix card with an owner, a metric to watch, and a decision."
    >
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: densityPreset.gap }}>
        {d.patterns.slice(0, 6).map((p: any) => {
          const fix = ROOT_CAUSE_FIX[p.root_cause] || { fix: "Manager review", owner: "Regional ops", metric: "Escalation count" };
          const decision = ROOT_CAUSE_DECISION[p.root_cause] || "Assign owner + prevention plan";
          const riskColor = p.risk_level === "High" ? AUR.bad : p.risk_level === "Medium" ? AUR.warn : AUR.accent;
          return (
            <div key={p.pattern_id} style={{ background: AUR.surface, border: `1px solid ${AUR.border}`, borderRadius: 16, padding: 24, position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: 0, right: 0, width: 120, height: 120, background: `radial-gradient(circle at top right, ${riskColor}25, transparent 60%)`, pointerEvents: "none" }} />
              <div style={{ position: "relative" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10, gap: 12 }}>
                  <div style={{ fontFamily: aurMono, fontSize: 10.5, color: AUR.textFaint, letterSpacing: 0.6, textTransform: "uppercase" }}>Cluster · {p.pattern_id.slice(-8)}</div>
                  <AurStatusPill AUR={AUR} status={p.recurrence_status} />
                </div>
                <div style={{ fontFamily: aurSerif, fontSize: 24, fontWeight: 400, letterSpacing: -0.5, color: AUR.text, marginBottom: 4, lineHeight: 1.15 }}>
                  {ROOT_CAUSE_LABELS[p.root_cause]} in {WORK_TYPE_LABELS[p.work_type]}
                </div>
                <div style={{ color: AUR.textDim, fontSize: 13, lineHeight: 1.55, marginBottom: 16 }}>
                  <strong style={{ color: AUR.text }}>{p.escalation_count} related incidents</strong> · {p.open_count} open · {p.sev1_count} sev1 + {p.sev2_count} sev2 · spans {p.unique_teams} teams across {p.unique_segments} customer segments.
                </div>
                {p.sample_summaries[0] && (
                  <div style={{ fontSize: 12.5, color: AUR.textDim, fontStyle: "italic", borderLeft: `2px solid ${AUR.border}`, paddingLeft: 12, marginBottom: 16, lineHeight: 1.5 }}>"{p.sample_summaries[0]}"</div>
                )}
                <div style={{ display: "grid", gridTemplateColumns: "70px 1fr", gap: "10px 14px", fontSize: 12.5, marginBottom: 14 }}>
                  <span style={{ color: AUR.textFaint, fontFamily: aurMono, fontSize: 10, textTransform: "uppercase", letterSpacing: 0.5 }}>Fix</span><span style={{ color: AUR.text }}>{fix.fix}</span>
                  <span style={{ color: AUR.textFaint, fontFamily: aurMono, fontSize: 10, textTransform: "uppercase", letterSpacing: 0.5 }}>Owner</span><span style={{ color: AUR.text }}>{fix.owner}</span>
                  <span style={{ color: AUR.textFaint, fontFamily: aurMono, fontSize: 10, textTransform: "uppercase", letterSpacing: 0.5 }}>Watch</span><span style={{ color: AUR.text }}>{fix.metric}</span>
                </div>
                <div style={{ padding: "12px 14px", background: AUR.accentGlow, borderRadius: 10, borderLeft: `2px solid ${AUR.accent}` }}>
                  <div style={{ fontFamily: aurMono, fontSize: 10, color: AUR.accent, letterSpacing: 0.6, textTransform: "uppercase", marginBottom: 4 }}>Decision needed this week</div>
                  <div style={{ fontSize: 13, color: AUR.text, lineHeight: 1.45 }}>{decision}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </AurSection>
  );
}
