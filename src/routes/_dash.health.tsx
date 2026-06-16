// Module A — Regional Operations Health. Heatmap-style work-type x metric
// table + leadership alerts panel.
import { createFileRoute, Link } from "@tanstack/react-router";
import { useDash } from "@/dashboards/app-context";
// @ts-expect-error jsx
import { AurSection, AurChip, MetricCell, aurMono, aurSerif, aurSans, Sparkline as _ } from "@/dashboards/atoms.jsx";
// @ts-expect-error jsx
import { classifyMetric, WORK_TYPE_LABELS, ROOT_CAUSE_LABELS, ROOT_CAUSE_FIX, ROOT_CAUSE_DECISION, Sparkline, fmt } from "@/dashboards/data-utils.jsx";
import { Loading } from "./_dash.index";

export const Route = createFileRoute("/_dash/health")({
  head: () => ({ meta: [
    { title: "Regional Health · Scale Ops" },
    { name: "description", content: "Module A: regional health heatmap with SLA, CSAT, quality, and escalation pressure per work type." },
  ]}),
  component: Health,
});

function Health() {
  const { data: d, AUR, densityPreset } = useDash();
  if (!d) return <Loading AUR={AUR} />;
  const rollup = d.workTypeRollup;

  const rootCausesTop = Object.entries(d.rootCauseCounts).sort((a:any, b:any) => b[1] - a[1]).slice(0, 6);
  const maxRoot = (rootCausesTop[0] as any)[1];

  const alerts = buildAlerts(d, AUR);

  return (
    <>
      <AurSection AUR={AUR} density={densityPreset}
        eyebrow="Module A · Regional Health"
        title="Where the region is breathing — and where it isn't."
        lede="Every work-type metric, classified against Scale ops thresholds. Red is a breach. Amber is a watch. Teal holds the line. Click a row to drill into one work type."
        right={
          <div style={{ display: "flex", gap: 8 }}>
            <AurChip AUR={AUR} color={AUR.good}><span style={{ width: 6, height: 6, borderRadius: "50%", background: AUR.good }} />On target</AurChip>
            <AurChip AUR={AUR} color={AUR.warn}><span style={{ width: 6, height: 6, borderRadius: "50%", background: AUR.warn }} />Watch</AurChip>
            <AurChip AUR={AUR} color={AUR.bad}><span style={{ width: 6, height: 6, borderRadius: "50%", background: AUR.bad }} />Breach</AurChip>
          </div>
        }
      >
        <div style={{ background: AUR.surface, border: `1px solid ${AUR.border}`, borderRadius: 16, padding: 24 }}>
          <div style={{ display: "grid", gridTemplateColumns: "240px repeat(6, 1fr) 56px", gap: 14, alignItems: "center" }}>
            <div />
            {["SLA","CSAT","Quality","Esc / 1k","Open","Sev 1"].map((l) => (
              <div key={l} style={{ fontFamily: aurMono, fontSize: 10.5, color: AUR.textFaint, letterSpacing: 0.6, textTransform: "uppercase", textAlign: "center" }}>{l}</div>
            ))}
            <div />
            {rollup.map((row: any) => (
              <RowFragment key={row.work_type} row={row} AUR={AUR} />
            ))}
          </div>
        </div>
      </AurSection>

      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: densityPreset.gap, marginTop: densityPreset.sectionGap }}>
        <AurSection AUR={AUR} density={{ ...densityPreset, sectionGap: 0 }} eyebrow="Leadership attention" title="Three things that matter this week.">
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {alerts.slice(0, 3).map((a: any, i: number) => (
              <div key={i} style={{ background: AUR.surface, border: `1px solid ${AUR.border}`, borderRadius: 14, padding: 20 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: a.color, boxShadow: `0 0 12px ${a.color}99` }} />
                  <span style={{ fontFamily: aurMono, fontSize: 10.5, color: a.color, letterSpacing: 0.7, textTransform: "uppercase" }}>{a.sev} severity · {WORK_TYPE_LABELS[a.wt]}</span>
                </div>
                <div style={{ fontFamily: aurSerif, fontSize: 20, fontWeight: 400, color: AUR.text, letterSpacing: -0.4, marginBottom: 6 }}>{a.title}</div>
                <div style={{ color: AUR.textDim, lineHeight: 1.55, marginBottom: 10, fontSize: 13.5 }}>{a.body}</div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 8, color: AUR.accent, fontSize: 13 }}>
                  <span style={{ fontFamily: aurMono, fontSize: 10.5, color: AUR.textFaint, letterSpacing: 0.6, textTransform: "uppercase" }}>Action</span>
                  <span>{a.action}</span>
                </div>
              </div>
            ))}
          </div>
        </AurSection>

        <AurSection AUR={AUR} density={{ ...densityPreset, sectionGap: 0 }} eyebrow="Module B · Recurring themes" title="What keeps coming back."
          right={<Link to="/patterns" search={((prev:any)=>prev) as any} style={{ textDecoration: "none", color: AUR.accent, fontFamily: aurMono, fontSize: 11, letterSpacing: 0.5, textTransform: "uppercase" }}>Detector →</Link>}
        >
          <div style={{ background: AUR.surface, border: `1px solid ${AUR.border}`, borderRadius: 14, padding: 20 }}>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 16, paddingBottom: 14, borderBottom: `1px solid ${AUR.border}` }}>
              <div>
                <div style={{ fontFamily: aurSerif, fontSize: 44, fontWeight: 400, letterSpacing: -1.2, lineHeight: 1, color: AUR.text }}>{d.totals.escalations}</div>
                <div style={{ fontFamily: aurMono, fontSize: 11, color: AUR.textFaint, letterSpacing: 0.6, textTransform: "uppercase", marginTop: 6 }}>14 wks · {d.totals.open} open · {d.totals.sev1} sev1</div>
              </div>
              <Sparkline values={d.weeklyTrend.map((w: any) => w.count)} color={AUR.accent} width={140} height={44} fill strokeWidth={1.5} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {rootCausesTop.map(([rc, c]: any) => (
                <div key={rc} style={{ display: "grid", gridTemplateColumns: "1fr 36px", gap: 10, alignItems: "center" }}>
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 4 }}>
                      <span style={{ color: AUR.text, fontSize: 13 }}>{ROOT_CAUSE_LABELS[rc] || rc}</span>
                    </div>
                    <div style={{ height: 4, background: AUR.surfaceHi, borderRadius: 2, overflow: "hidden" }}>
                      <div style={{ width: `${(c / maxRoot) * 100}%`, height: "100%", background: `linear-gradient(90deg, ${AUR.accent}, ${AUR.accentDeep})`, borderRadius: 2 }} />
                    </div>
                  </div>
                  <span style={{ fontFamily: aurMono, fontSize: 13, color: AUR.text, fontVariantNumeric: "tabular-nums", textAlign: "right" }}>{c}</span>
                </div>
              ))}
            </div>
          </div>
        </AurSection>
      </div>

      <AurSection AUR={AUR} density={densityPreset} eyebrow="Follow the trail" title="Next click suggestion.">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: densityPreset.gap }}>
          <NextTile to="/patterns"  title="See recurring patterns"  body="Find the operational gaps producing these escalations week after week." AUR={AUR} />
          <NextTile to="/workforce" title="Find quality risk teams" body="Same KPIs, sliced per team — pick targets for calibration."             AUR={AUR} />
          <NextTile to="/capacity"  title="Project backlog forward" body="See where SLA breaks 7-14 days out and which queue needs heads."        AUR={AUR} />
        </div>
      </AurSection>
    </>
  );
}

function RowFragment({ row, AUR }: any) {
  return (
    <>
      <div>
        <div style={{ fontFamily: aurSerif, fontSize: 19, fontWeight: 400, color: AUR.text, letterSpacing: -0.3 }}>{WORK_TYPE_LABELS[row.work_type]}</div>
        <div style={{ fontFamily: aurMono, fontSize: 10.5, color: AUR.textFaint, letterSpacing: 0.4, marginTop: 2 }}>{row.teams} teams · {row.contributors} heads</div>
      </div>
      <MetricCell AUR={AUR} value={`${row.sla.toFixed(1)}%`} status={classifyMetric("sla", row.sla)} />
      <MetricCell AUR={AUR} value={row.csat.toFixed(2)}     status={classifyMetric("csat", row.csat)} />
      <MetricCell AUR={AUR} value={row.quality.toFixed(1)}  status={classifyMetric("quality", row.quality)} />
      <MetricCell AUR={AUR} value={row.escalation_rate_per_1000} status={classifyMetric("escalation_rate", row.escalation_rate_per_1000)} />
      <MetricCell AUR={AUR} value={row.open_escalations}    status={classifyMetric("open", row.open_escalations)} />
      <MetricCell AUR={AUR} value={row.sev1}                status={classifyMetric("sev1", row.sev1)} />
      <Link to="/drilldown" search={((prev: any) => ({ ...prev, wt: row.work_type })) as any} style={{ textAlign: "center", color: AUR.textFaint, fontSize: 18, fontFamily: aurSans, textDecoration: "none" }}>→</Link>
    </>
  );
}

function NextTile({ to, title, body, AUR }: any) {
  return (
    <Link to={to as any} search={((prev:any)=>prev) as any} style={{ textDecoration: "none" }}>
      <div style={{
        background: AUR.surface, border: `1px solid ${AUR.border}`, borderRadius: 12, padding: 18,
        transition: "all 180ms ease", cursor: "pointer",
      }}
        onMouseEnter={(e)=>{(e.currentTarget as HTMLDivElement).style.borderColor=AUR.accent+"55";}}
        onMouseLeave={(e)=>{(e.currentTarget as HTMLDivElement).style.borderColor=AUR.border;}}
      >
        <div style={{ fontFamily: aurSerif, fontSize: 18, color: AUR.text, letterSpacing: -0.3, marginBottom: 6 }}>{title}</div>
        <div style={{ color: AUR.textDim, fontSize: 13, lineHeight: 1.5 }}>{body}</div>
        <div style={{ marginTop: 10, color: AUR.accent, fontFamily: aurMono, fontSize: 10.5, letterSpacing: 0.5, textTransform: "uppercase" }}>Open →</div>
      </div>
    </Link>
  );
}

function buildAlerts(d: any, AUR: any) {
  const rollup = d.workTypeRollup;
  const alerts: any[] = [];
  const expertRow = rollup.find((r: any) => r.work_type === "expert_review");
  if (expertRow && expertRow.sev1 >= 3) {
    alerts.push({ sev: "High", color: AUR.bad, wt: "expert_review",
      title: "Expert Review · SLA breach + sev1 cluster",
      body: `${expertRow.sev1} sev1 escalations this period across ${expertRow.teams} teams. SLA at ${expertRow.sla.toFixed(1)}% against a 95% target.`,
      action: "Stand up a war room with EXPERT_01/02 managers by EOD." });
  }
  const acc = d.patterns.find((p: any) => p.recurrence_status === "Accelerating" && p.risk_level === "High");
  if (acc) {
    alerts.push({ sev: "High", color: AUR.bad, wt: acc.work_type,
      title: `${WORK_TYPE_LABELS[acc.work_type]} · ${ROOT_CAUSE_LABELS[acc.root_cause]} accelerating`,
      body: `${acc.escalation_count} escalations across this pattern · last-14-day count ${acc.last_14d} exceeds prior-14-day count of ${acc.prior_14d}. Same operational gap is failing at scale.`,
      action: ROOT_CAUSE_DECISION[acc.root_cause] || "Approve structural fix this week." });
  }
  const rec = d.patterns.find((p: any) => p.recurrence_status === "Recurring" && p.open_count >= 3 && (!acc || p.pattern_id !== acc.pattern_id));
  if (rec) {
    const fix = ROOT_CAUSE_FIX[rec.root_cause] || { fix: "Manager review" };
    alerts.push({ sev: "Medium", color: AUR.warn, wt: rec.work_type,
      title: `${WORK_TYPE_LABELS[rec.work_type]} · ${ROOT_CAUSE_LABELS[rec.root_cause]} recurrence`,
      body: `${rec.escalation_count} escalations · ${rec.open_count} open · avg ${rec.avg_days_to_resolve}d to resolve. Spans ${rec.unique_teams} teams.`,
      action: fix.fix + "." });
  }
  return alerts;
}
