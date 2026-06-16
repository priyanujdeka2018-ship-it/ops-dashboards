// Module B v1 — Pattern Detector. Filterable table + inline detail panel.
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { zodValidator, fallback } from "@tanstack/zod-adapter";
import { z } from "zod";
import { useDash } from "@/dashboards/app-context";
// @ts-expect-error jsx
import { AurSection, AurStatusPill, AurRiskBadge, aurMono, aurSerif, aurSans } from "@/dashboards/atoms.jsx";
// @ts-expect-error jsx
import { WORK_TYPE_LABELS, ROOT_CAUSE_LABELS, ROOT_CAUSE_FIX, ROOT_CAUSE_DECISION, fmt } from "@/dashboards/data-utils.jsx";
import { Loading } from "./_dash.index";

const patternSearch = z.object({
  status: fallback(z.string(), "all").default("all"),
  risk: fallback(z.string(), "all").default("all"),
  pid: fallback(z.string().optional(), undefined as any).default(undefined as any),
});

export const Route = createFileRoute("/_dash/patterns")({
  validateSearch: zodValidator(patternSearch),
  head: () => ({ meta: [
    { title: "Pattern Detector · Scale Ops" },
    { name: "description", content: "Module B: detect when escalations are recurring operating-system failures, not isolated events." },
  ]}),
  component: Patterns,
});

function Patterns() {
  const { data: d, AUR, densityPreset } = useDash();
  const { status, risk, pid } = Route.useSearch();
  const navigate = useNavigate({ from: "/patterns" });
  const setSearch = (patch: any) => navigate({ search: ((prev: any) => ({ ...prev, ...patch })) as any });
  if (!d) return <Loading AUR={AUR} />;

  const filtered = d.patterns.filter((p: any) => {
    if (status !== "all" && p.recurrence_status !== status) return false;
    if (risk !== "all" && p.risk_level !== risk) return false;
    return true;
  });
  const selected = pid ? d.patterns.find((p: any) => p.pattern_id === pid) : null;

  return (
    <>
      <AurSection AUR={AUR} density={densityPreset}
        eyebrow="Module B · Pattern Detector"
        title={`${d.patterns.length} recurring patterns. ${d.patterns.filter((p:any) => p.risk_level === "High").length} demand action.`}
        lede="Every escalation grouped on work_type + root_cause. Risk score is deterministic and explainable — escalation count, severity weight, open count, segment spread, slow-resolution penalty, acceleration bonus."
        right={
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {["all", "High", "Medium", "Low"].map((r) => (
              <button key={r} onClick={() => setSearch({ risk: r })} style={chip(AUR, risk === r)}>{r === "all" ? "All risk" : r}</button>
            ))}
          </div>
        }
      >
        <div style={{ display: "flex", gap: 6, marginBottom: 14, flexWrap: "wrap" }}>
          {["all", "Accelerating", "Recurring", "Watchlist", "New", "Resolved", "Dormant", "Low activity"].map((s) => {
            const count = s === "all" ? d.patterns.length : d.patterns.filter((p: any) => p.recurrence_status === s).length;
            if (s !== "all" && count === 0) return null;
            return (
              <button key={s} onClick={() => setSearch({ status: s })} style={{
                background: status === s ? AUR.surfaceHi : "transparent",
                color: status === s ? AUR.text : AUR.textDim,
                border: `1px solid ${status === s ? AUR.borderHi : AUR.border}`,
                borderRadius: 999, padding: "5px 12px", fontFamily: aurSans, fontSize: 12, cursor: "pointer",
              }}>{s === "all" ? "All status" : s} <span style={{ color: AUR.textFaint, marginLeft: 4 }}>{count}</span></button>
            );
          })}
        </div>

        <div style={{ background: AUR.surface, border: `1px solid ${AUR.border}`, borderRadius: 16, overflow: "hidden" }}>
          <div style={{ display: "grid", gridTemplateColumns: "2.3fr 0.5fr 0.5fr 0.5fr 1fr 0.8fr 0.6fr", padding: "14px 22px", borderBottom: `1px solid ${AUR.border}`, fontFamily: aurMono, fontSize: 10.5, color: AUR.textFaint, letterSpacing: 0.6, textTransform: "uppercase" }}>
            <div>Pattern</div><div style={{ textAlign: "right" }}>Esc</div><div style={{ textAlign: "right" }}>Sev1</div><div style={{ textAlign: "right" }}>Open</div><div>Status</div><div>Risk</div><div style={{ textAlign: "right" }}>Score</div>
          </div>
          {filtered.length === 0 && <div style={{ padding: 32, textAlign: "center", color: AUR.textFaint, fontStyle: "italic" }}>No patterns match these filters.</div>}
          {filtered.map((p: any, i: number) => (
            <button key={p.pattern_id} onClick={() => setSearch({ pid: pid === p.pattern_id ? undefined : p.pattern_id })}
              style={{
                display: "grid", gridTemplateColumns: "2.3fr 0.5fr 0.5fr 0.5fr 1fr 0.8fr 0.6fr",
                padding: "14px 22px", alignItems: "center", width: "100%", textAlign: "left",
                background: pid === p.pattern_id ? AUR.surfaceHi : "transparent",
                border: "none", borderLeft: pid === p.pattern_id ? `3px solid ${AUR.accent}` : "3px solid transparent",
                borderBottom: i === filtered.length - 1 ? "none" : `1px solid ${AUR.border}`,
                fontFamily: aurSans, cursor: "pointer", color: AUR.text, transition: "background 150ms ease",
              }}
            >
              <div>
                <div style={{ fontFamily: aurSerif, fontSize: 17, fontWeight: 400, color: AUR.text, letterSpacing: -0.2 }}>
                  {ROOT_CAUSE_LABELS[p.root_cause]} <span style={{ color: AUR.textFaint }}>in</span> {WORK_TYPE_LABELS[p.work_type]}
                </div>
                <div style={{ fontFamily: aurMono, fontSize: 11, color: AUR.textFaint, letterSpacing: 0.4, marginTop: 2 }}>{p.unique_teams} teams · {p.unique_segments} segments · first seen {fmt.date(p.first_seen)} · latest {fmt.date(p.latest_seen)}</div>
              </div>
              <div style={{ textAlign: "right", fontFamily: aurMono, color: AUR.text, fontVariantNumeric: "tabular-nums" }}>{p.escalation_count}</div>
              <div style={{ textAlign: "right", fontFamily: aurMono, color: p.sev1_count > 0 ? AUR.bad : AUR.textFaint, fontVariantNumeric: "tabular-nums" }}>{p.sev1_count}</div>
              <div style={{ textAlign: "right", fontFamily: aurMono, color: p.open_count > 5 ? AUR.warn : AUR.text, fontVariantNumeric: "tabular-nums" }}>{p.open_count}</div>
              <div><AurStatusPill AUR={AUR} status={p.recurrence_status} /></div>
              <div><AurRiskBadge AUR={AUR} level={p.risk_level} /></div>
              <div style={{ textAlign: "right", fontFamily: aurSerif, fontSize: 22, color: p.risk_score > 50 ? AUR.bad : p.risk_score > 20 ? AUR.warn : AUR.text, fontVariantNumeric: "tabular-nums", letterSpacing: -0.5 }}>{p.risk_score}</div>
            </button>
          ))}
        </div>

        {selected && <PatternDetail p={selected} AUR={AUR} />}
      </AurSection>
    </>
  );
}

function PatternDetail({ p, AUR }: any) {
  const fix = ROOT_CAUSE_FIX[p.root_cause] || { fix: "Manager review", owner: "Regional ops", metric: "Escalation count" };
  const decision = ROOT_CAUSE_DECISION[p.root_cause] || "Assign owner + prevention plan";
  return (
    <div style={{ marginTop: 20, background: `linear-gradient(135deg, ${AUR.accentGlow}, transparent 60%)`, border: `1px solid ${AUR.accent}55`, borderRadius: 16, padding: 26 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18, gap: 16 }}>
        <div>
          <div style={{ fontFamily: aurMono, fontSize: 10.5, color: AUR.accent, letterSpacing: 0.8, textTransform: "uppercase", marginBottom: 6 }}>Pattern drilldown · {p.pattern_id}</div>
          <div style={{ fontFamily: aurSerif, fontSize: 26, fontWeight: 400, color: AUR.text, letterSpacing: -0.5, lineHeight: 1.15 }}>
            {ROOT_CAUSE_LABELS[p.root_cause]} <span style={{ color: AUR.textFaint }}>in</span> {WORK_TYPE_LABELS[p.work_type]}
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <AurStatusPill AUR={AUR} status={p.recurrence_status} />
          <AurRiskBadge AUR={AUR} level={p.risk_level} />
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 24 }}>
        <div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 10, marginBottom: 18 }}>
            {[
              { l: "Escalations", v: p.escalation_count },
              { l: "Sev 1 / 2", v: `${p.sev1_count} / ${p.sev2_count}` },
              { l: "Open", v: p.open_count },
              { l: "Avg days", v: p.avg_days_to_resolve },
              { l: "Last 14d", v: `${p.last_14d} (prior ${p.prior_14d})` },
            ].map((m: any, i: number) => (
              <div key={i} style={{ background: AUR.surface, borderRadius: 10, padding: "10px 12px", border: `1px solid ${AUR.border}` }}>
                <div style={{ fontFamily: aurMono, fontSize: 10, color: AUR.textFaint, letterSpacing: 0.5, textTransform: "uppercase" }}>{m.l}</div>
                <div style={{ fontFamily: aurSerif, fontSize: 22, color: AUR.text, marginTop: 2, fontVariantNumeric: "tabular-nums" }}>{m.v}</div>
              </div>
            ))}
          </div>
          <div style={{ fontFamily: aurMono, fontSize: 10.5, color: AUR.textFaint, letterSpacing: 0.6, textTransform: "uppercase", marginBottom: 8 }}>Recent escalation summaries</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {p.sample_summaries.map((s: string, i: number) => (
              <div key={i} style={{ fontSize: 13, color: AUR.textDim, paddingLeft: 14, borderLeft: `2px solid ${AUR.border}`, lineHeight: 1.5, fontStyle: "italic" }}>"{s}"</div>
            ))}
          </div>
          <div style={{ marginTop: 14, fontFamily: aurMono, fontSize: 11, color: AUR.textFaint }}>
            Affected teams: <span style={{ color: AUR.text }}>{p.teams.join(", ")}</span>
          </div>
        </div>
        <div style={{ background: AUR.surface, border: `1px solid ${AUR.border}`, borderRadius: 12, padding: 18 }}>
          <div style={{ fontFamily: aurMono, fontSize: 10.5, color: AUR.textFaint, letterSpacing: 0.6, textTransform: "uppercase", marginBottom: 12 }}>Recommended structural fix</div>
          <div style={{ display: "grid", gridTemplateColumns: "70px 1fr", gap: "10px 14px", fontSize: 13, marginBottom: 14 }}>
            <span style={{ color: AUR.textFaint, fontFamily: aurMono, fontSize: 10.5, textTransform: "uppercase", letterSpacing: 0.5 }}>Fix</span><span style={{ color: AUR.text }}>{fix.fix}</span>
            <span style={{ color: AUR.textFaint, fontFamily: aurMono, fontSize: 10.5, textTransform: "uppercase", letterSpacing: 0.5 }}>Owner</span><span style={{ color: AUR.text }}>{fix.owner}</span>
            <span style={{ color: AUR.textFaint, fontFamily: aurMono, fontSize: 10.5, textTransform: "uppercase", letterSpacing: 0.5 }}>Metric</span><span style={{ color: AUR.text }}>{fix.metric}</span>
          </div>
          <div style={{ padding: "12px 14px", background: AUR.accentGlow, borderRadius: 10, borderLeft: `2px solid ${AUR.accent}` }}>
            <div style={{ fontFamily: aurMono, fontSize: 10, color: AUR.accent, letterSpacing: 0.6, textTransform: "uppercase", marginBottom: 4 }}>Decision needed this week</div>
            <div style={{ fontSize: 13, color: AUR.text, lineHeight: 1.45 }}>{decision}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function chip(AUR: any, active: boolean) {
  return {
    background: active ? AUR.accentGlow : "transparent",
    color: active ? AUR.accent : AUR.textDim,
    border: `1px solid ${active ? AUR.accent + "55" : AUR.border}`,
    borderRadius: 999, padding: "6px 12px", fontFamily: aurMono, fontSize: 10.5,
    letterSpacing: 0.5, textTransform: "uppercase", cursor: "pointer",
  } as const;
}
