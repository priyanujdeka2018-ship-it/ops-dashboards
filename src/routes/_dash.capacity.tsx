// Module D — Capacity, Staffing, and SLA Forecasting.
// Region rollup + per-work-type forecast + recommended rebalance.
import { createFileRoute } from "@tanstack/react-router";
import { useDash } from "@/dashboards/app-context";
// @ts-expect-error jsx
import { AurSection, AurKpi, aurMono, aurSerif, aurSans } from "@/dashboards/atoms.jsx";
// @ts-expect-error jsx
import { deriveCapacity, WORK_TYPE_LABELS, classifyMetric, fmt } from "@/dashboards/data-utils.jsx";
import { Loading } from "./_dash.index";

export const Route = createFileRoute("/_dash/capacity")({
  head: () => ({ meta: [
    { title: "Capacity / SLA Forecast · Scale Ops" },
    { name: "description", content: "Module D: backlog and utilization 7-14 days out per work type, with recommended staffing rebalances." },
  ]}),
  component: Capacity,
});

const utilColor = (band: string, AUR: any) =>
  band === "safe" ? AUR.good : band === "stretched" ? AUR.warn : AUR.bad;

function Capacity() {
  const { data: d, AUR, densityPreset } = useDash();
  if (!d) return <Loading AUR={AUR} />;
  const cap = deriveCapacity(d);
  const arrow = cap.region.weekly_delta > 0 ? "↑" : cap.region.weekly_delta < 0 ? "↓" : "→";

  return (
    <>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontFamily: aurSerif, fontSize: 36, fontWeight: 400, letterSpacing: -1, margin: 0, lineHeight: 1.1, color: AUR.text }}>
          Catch the SLA break <em style={{ color: AUR.accent, fontStyle: "italic" }}>before</em> the customer does.
        </h1>
        <p style={{ color: AUR.textDim, fontSize: 14.5, marginTop: 10, maxWidth: 760, lineHeight: 1.55 }}>
          7-day backlog projection per work type, derived from current backlog, inflow trend, and complexity-weighted throughput. Recommendations land before staffing decisions become reactive.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: densityPreset.gap }}>
        <AurKpi AUR={AUR} large label="Backlog now"        value={fmt.num(cap.region.backlog)}      sub={`${arrow} ${Math.abs(cap.region.weekly_delta)} vs last week`} status={cap.region.backlog > 1500 ? "bad" : cap.region.backlog > 1000 ? "warn" : "good"} />
        <AurKpi AUR={AUR} large label="7-day projection"   value={fmt.num(cap.region.projected_7d)} sub="straight-line from weekly trend" status={cap.region.projected_7d > cap.region.backlog * 1.1 ? "bad" : "warn"} />
        <AurKpi AUR={AUR} large label="14-day projection"  value={fmt.num(cap.region.projected_14d)} sub="straight-line · scenario sensitive" status={cap.region.projected_14d > cap.region.backlog * 1.2 ? "bad" : "warn"} />
        <AurKpi AUR={AUR} large label="Region utilization" value={`${cap.region.utilization}%`}     sub="safe ≤ 86% · stretched 87-92%" status={classifyMetric("utilization", cap.region.utilization)} />
      </div>

      {cap.rebalance && (
        <AurSection AUR={AUR} density={densityPreset} eyebrow="Recommendation" title="One rebalance to approve this week.">
          <div style={{ background: `linear-gradient(135deg, ${AUR.accentGlow}, transparent 60%)`, border: `1px solid ${AUR.accent}55`, borderRadius: 16, padding: 24, display: "grid", gridTemplateColumns: "1fr auto 1fr auto", alignItems: "center", gap: 20 }}>
            <RebalanceSide AUR={AUR} label="Donor" wt={cap.rebalance.donor} color={AUR.good} />
            <div style={{ fontFamily: aurSerif, fontSize: 30, color: AUR.accent }}>→</div>
            <RebalanceSide AUR={AUR} label="Recipient" wt={cap.rebalance.recipient} color={AUR.warn} />
            <div style={{ textAlign: "right" }}>
              <div style={{ fontFamily: aurMono, fontSize: 10.5, color: AUR.textFaint, letterSpacing: 0.6, textTransform: "uppercase" }}>Suggested heads</div>
              <div style={{ fontFamily: aurSerif, fontSize: 44, color: AUR.text, letterSpacing: -1, lineHeight: 1, marginTop: 4 }}>{cap.rebalance.heads}</div>
              <div style={{ fontFamily: aurMono, fontSize: 10.5, color: AUR.textFaint, letterSpacing: 0.4, marginTop: 4 }}>2-week cross-train</div>
            </div>
          </div>
        </AurSection>
      )}

      <AurSection AUR={AUR} density={densityPreset}
        eyebrow="Per work type"
        title="Where the pressure builds."
        lede="Utilization is heuristic — open load per head. SLA gap is the distance to 95%. Read both columns to tell apart capacity problems from quality/tooling problems."
      >
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: densityPreset.gap }}>
          {cap.workTypes.map((w: any) => {
            const uc = utilColor(w.util_band, AUR);
            return (
              <div key={w.work_type} style={{
                background: AUR.surface, border: `1px solid ${AUR.border}`, borderRadius: 14,
                padding: 22, display: "grid", gridTemplateColumns: "1.5fr 1.4fr 1.4fr 1.6fr", gap: 22, alignItems: "center",
              }}>
                <div>
                  <div style={{ fontFamily: aurSerif, fontSize: 22, color: AUR.text, letterSpacing: -0.4 }}>{WORK_TYPE_LABELS[w.work_type]}</div>
                  <div style={{ fontFamily: aurMono, fontSize: 10.5, color: AUR.textFaint, letterSpacing: 0.5, marginTop: 4 }}>{w.teams} teams · {w.contributors} heads · SLA {w.sla.toFixed(1)}%</div>
                </div>

                <div>
                  <div style={{ fontFamily: aurMono, fontSize: 10, color: AUR.textFaint, letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 6 }}>Backlog trajectory</div>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                    <span style={{ fontFamily: aurSerif, fontSize: 28, color: AUR.text, fontVariantNumeric: "tabular-nums" }}>{fmt.num(w.backlog)}</span>
                    <span style={{ fontFamily: aurMono, fontSize: 11, color: AUR.textFaint }}>now</span>
                    <span style={{ fontFamily: aurMono, fontSize: 11, color: w.delta_7d > 0 ? AUR.bad : AUR.good }}>{w.delta_7d > 0 ? "+" : ""}{w.delta_7d} in 7d</span>
                  </div>
                  <div style={{ fontFamily: aurMono, fontSize: 11, color: AUR.textFaint, marginTop: 4 }}>14d: {fmt.num(w.projected_14d)}</div>
                </div>

                <div>
                  <div style={{ fontFamily: aurMono, fontSize: 10, color: AUR.textFaint, letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 6 }}>Utilization</div>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                    <span style={{ fontFamily: aurSerif, fontSize: 28, color: uc, fontVariantNumeric: "tabular-nums" }}>{w.utilization}%</span>
                    <span style={{ fontFamily: aurMono, fontSize: 10.5, color: uc, textTransform: "uppercase", letterSpacing: 0.5 }}>{w.util_band}</span>
                  </div>
                  <div style={{ height: 5, background: AUR.surfaceHi, borderRadius: 3, marginTop: 8, overflow: "hidden" }}>
                    <div style={{ width: `${Math.min(100, w.utilization)}%`, height: "100%", background: `linear-gradient(90deg, ${uc}, ${AUR.accentDeep})` }} />
                  </div>
                </div>

                <div style={{ padding: "12px 14px", background: AUR.accentGlow, borderRadius: 10, borderLeft: `2px solid ${AUR.accent}` }}>
                  <div style={{ fontFamily: aurMono, fontSize: 10, color: AUR.accent, letterSpacing: 0.6, textTransform: "uppercase", marginBottom: 4 }}>Recommendation · {w.owner}</div>
                  <div style={{ fontSize: 13, color: AUR.text, lineHeight: 1.5 }}>{w.recommendation}</div>
                </div>
              </div>
            );
          })}
        </div>
      </AurSection>

      <AurSection AUR={AUR} density={densityPreset} eyebrow="What this would look like in production" title="Forecast plumbing.">
        <div style={{ background: AUR.surface, border: `1px solid ${AUR.border}`, borderRadius: 14, padding: 22, color: AUR.textDim, fontSize: 14, lineHeight: 1.65 }}>
          The prototype uses a straight-line projection from the weekly backlog trend. In production: <strong style={{ color: AUR.text }}>inflow rate × complexity weight ÷ skill-adjusted throughput</strong>, recomputed nightly. Each forecast carries a confidence band derived from rolling inflow variance. Recommendations only surface when projected utilization crosses 92% AND projected SLA gap ≥ 3 percentage points — to avoid alarm fatigue.
        </div>
      </AurSection>
    </>
  );
}

function RebalanceSide({ AUR, label, wt, color }: any) {
  return (
    <div>
      <div style={{ fontFamily: aurMono, fontSize: 10.5, color, letterSpacing: 0.7, textTransform: "uppercase" }}>{label}</div>
      <div style={{ fontFamily: aurSerif, fontSize: 24, color: AUR.text, letterSpacing: -0.5, marginTop: 4 }}>{WORK_TYPE_LABELS[wt]}</div>
    </div>
  );
}
