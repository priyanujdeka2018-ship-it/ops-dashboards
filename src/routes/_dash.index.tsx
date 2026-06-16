// Home — Command Center landing. KPI strip + entry tiles per module +
// audience lens previews. Keeps the experience roomy: no dense tables here,
// each module gets its own dedicated route.
import { createFileRoute, Link } from "@tanstack/react-router";
import { useDash } from "@/dashboards/app-context";
// @ts-expect-error jsx
import { AurKpi, AurSection, aurMono, aurSerif, aurSans } from "@/dashboards/atoms.jsx";
// @ts-expect-error jsx
import { fmt, classifyMetric, AUDIENCE_LENS } from "@/dashboards/data-utils.jsx";

export const Route = createFileRoute("/_dash/")({
  head: () => ({
    meta: [
      { title: "Scale Ops · Regional Command Center" },
      { name: "description", content: "One operating view across SLA, CSAT, escalations, workforce quality, and capacity for a regional operations leader." },
    ],
  }),
  component: Home,
});

const MODULES = [
  { to: "/health",    eyebrow: "Module A", title: "Regional health",     blurb: "SLA, CSAT, quality and escalation rate across every work type, classified against thresholds." },
  { to: "/patterns",  eyebrow: "Module B", title: "Pattern detector",    blurb: "Every escalation grouped on work_type + root_cause. Deterministic, explainable risk score." },
  { to: "/clusters",  eyebrow: "Module B v2", title: "Semantic clusters", blurb: "TF-IDF + cosine catches when different teams describe the same breakdown in different words." },
  { to: "/workforce", eyebrow: "Module C", title: "Workforce quality",   blurb: "Per-team quality risk for coaching, calibration, staffing — not punitive ranking." },
  { to: "/capacity",  eyebrow: "Module D", title: "Capacity / SLA",      blurb: "Backlog and utilization 7–14 days out per work type. Recommends rebalances before SLA breaks." },
  { to: "/drilldown", eyebrow: "Module A·detail", title: "Work-type drilldown", blurb: "One work type, every team. Find the team carrying the cluster." },
] as const;

function Home() {
  const { data, AUR, densityPreset } = useDash();
  if (!data) return <Loading AUR={AUR} />;
  const k = data.kpis, d = data;

  return (
    <>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: aurSerif, fontSize: 48, fontWeight: 400, letterSpacing: -1.6, margin: 0, lineHeight: 1.04, maxWidth: 920, color: AUR.text }}>
          The operating system <em style={{ color: AUR.accent, fontStyle: "italic" }}>before</em> customer impact lands.
        </h1>
        <p style={{ fontFamily: aurSans, fontSize: 16, color: AUR.textDim, marginTop: 14, maxWidth: 760, lineHeight: 1.55 }}>
          One regional view across SLA, backlog, CSAT, quality, escalation risk, workforce quality, and capacity forecasts — deterministic where it matters, AI-assisted where it pays.
        </p>
      </div>

      {/* KPI strip — primary */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: densityPreset.gap }}>
        <AurKpi AUR={AUR} large label="SLA Adherence"  value={fmt.pct(k.sla_adherence)} sub="target ≥ 95.0%"               status={classifyMetric("sla", k.sla_adherence)}            trendData={d.kpiTrends.sla} />
        <AurKpi AUR={AUR} large label="CSAT · 7-day"   value={fmt.dec(k.csat_7d, 2)}    sub="target ≥ 4.40"                status={classifyMetric("csat", k.csat_7d)}                 trendData={d.kpiTrends.csat} />
        <AurKpi AUR={AUR} large label="Backlog"        value={fmt.num(k.backlog)}       sub={`${k.aged_backlog_72h} aged >72h`} status={k.aged_backlog_72h > 800 ? "bad" : "warn"}     trendData={d.kpiTrends.backlog} />
        <AurKpi AUR={AUR} large label="Avg Quality"    value={fmt.dec(k.avg_quality)}   sub={`100-pt · rework ${k.rework_rate.toFixed(1)}%`} status={classifyMetric("quality", k.avg_quality)} trendData={d.kpiTrends.quality} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: densityPreset.gap, marginTop: densityPreset.gap }}>
        <AurKpi AUR={AUR} label="Escalation rate / 1k" value={fmt.dec(k.escalation_rate_per_1000, 1)} sub="target ≤ 8" status={classifyMetric("escalation_rate", k.escalation_rate_per_1000)} trendData={d.kpiTrends.esc_rate} />
        <AurKpi AUR={AUR} label="FCR proxy"            value={fmt.pct(k.fcr_proxy)}     sub="1st-pass resolved" status={k.fcr_proxy > 88 ? "good" : "warn"} trendData={d.kpiTrends.fcr} />
        <AurKpi AUR={AUR} label="Open escalations"     value={d.totals.open}            sub={`${d.totals.sev1} sev1 · ${d.totals.sev2} sev2`} status={d.totals.sev1 > 5 ? "bad" : d.totals.sev1 > 2 ? "warn" : "good"} />
        <AurKpi AUR={AUR} label="Recurring patterns"   value={d.patterns.filter((p:any) => ["Recurring","Accelerating"].includes(p.recurrence_status)).length} sub={`${d.patterns.filter((p:any) => p.risk_level === "High").length} high-risk`} status="warn" />
      </div>

      <AurSection AUR={AUR} density={densityPreset}
        eyebrow="Pick a module"
        title="Each view answers one question well."
        lede="The dashboard is intentionally roomy. Open a module, sit with it, follow the trail. The header keeps your scenario, accent, and density choices as you move."
      >
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: densityPreset.gap }}>
          {MODULES.map((m) => (
            <Link key={m.to} to={m.to as any} search={((prev:any) => prev) as any} style={{ textDecoration: "none" }}>
              <div style={{
                background: AUR.surface, border: `1px solid ${AUR.border}`, borderRadius: 14,
                padding: 22, height: "100%", transition: "all 180ms ease",
                cursor: "pointer", display: "flex", flexDirection: "column", gap: 10,
              }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = AUR.accent + "55"; (e.currentTarget as HTMLDivElement).style.background = AUR.surfaceHi; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = AUR.border; (e.currentTarget as HTMLDivElement).style.background = AUR.surface; }}
              >
                <div style={{ fontFamily: aurMono, fontSize: 10.5, color: AUR.accent, letterSpacing: 0.7, textTransform: "uppercase" }}>{m.eyebrow}</div>
                <div style={{ fontFamily: aurSerif, fontSize: 24, fontWeight: 400, color: AUR.text, letterSpacing: -0.5, lineHeight: 1.1 }}>{m.title}</div>
                <div style={{ color: AUR.textDim, fontSize: 13.5, lineHeight: 1.55, flex: 1 }}>{m.blurb}</div>
                <div style={{ color: AUR.accent, fontSize: 12.5, fontFamily: aurMono, letterSpacing: 0.5, textTransform: "uppercase", marginTop: 4 }}>Open →</div>
              </div>
            </Link>
          ))}
        </div>
      </AurSection>

      <AurSection AUR={AUR} density={densityPreset}
        eyebrow="Audience lens"
        title="Built for five different morning routines."
        lede="Same data, different first click. Use the lens to walk through what each role asks of this dashboard — and which AI techniques would land in production for them."
      >
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: densityPreset.gap }}>
          {AUDIENCE_LENS.map((a: any) => (
            <Link key={a.id} to="/about" search={((prev: any) => ({ ...prev, who: a.id })) as any} style={{ textDecoration: "none" }}>
              <div style={{
                background: AUR.surface, border: `1px solid ${AUR.border}`, borderRadius: 14,
                padding: 20, height: "100%", cursor: "pointer", transition: "all 180ms ease",
              }}>
                <div style={{ fontFamily: aurMono, fontSize: 10.5, color: AUR.textFaint, letterSpacing: 0.6, textTransform: "uppercase", marginBottom: 6 }}>Role</div>
                <div style={{ fontFamily: aurSerif, fontSize: 20, color: AUR.text, letterSpacing: -0.3, marginBottom: 6 }}>{a.title}</div>
                <div style={{ color: AUR.textDim, fontSize: 13, lineHeight: 1.5 }}>{a.blurb}</div>
                <div style={{ marginTop: 10, fontFamily: aurMono, fontSize: 10.5, color: AUR.accent, letterSpacing: 0.5 }}>Opens {a.opens.join(" · ")}</div>
              </div>
            </Link>
          ))}
        </div>
      </AurSection>
    </>
  );
}

export function Loading({ AUR }: { AUR: any }) {
  return <div style={{ padding: 40, color: AUR.textDim, fontFamily: aurSans }}>Loading scenario…</div>;
}
