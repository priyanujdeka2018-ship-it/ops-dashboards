// Module C — Distributed Workforce Quality Scorer.
// Per-team risk bands, cohort-by-work-type summary, drilldown with drivers
// and recommended coaching action.
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { zodValidator, fallback } from "@tanstack/zod-adapter";
import { z } from "zod";
import { useDash } from "@/dashboards/app-context";
// @ts-expect-error jsx
import { AurSection, AurKpi, AurRiskBadge, aurMono, aurSerif, aurSans } from "@/dashboards/atoms.jsx";
// @ts-expect-error jsx
import { deriveWorkforce, WORK_TYPE_LABELS, classifyMetric } from "@/dashboards/data-utils.jsx";
import { Loading } from "./_dash.index";

const search = z.object({
  band: fallback(z.enum(["all","High","Medium","Low"]), "all").default("all"),
  wt: fallback(z.string(), "all").default("all"),
  team: fallback(z.string().optional(), undefined as any).default(undefined as any),
});

export const Route = createFileRoute("/_dash/workforce")({
  validateSearch: zodValidator(search),
  head: () => ({ meta: [
    { title: "Workforce Quality · Scale Ops" },
    { name: "description", content: "Module C: per-team quality risk for coaching and calibration, not punitive ranking." },
  ]}),
  component: Workforce,
});

function Workforce() {
  const { data: d, AUR, densityPreset } = useDash();
  const { band, wt, team } = Route.useSearch();
  const navigate = useNavigate({ from: "/workforce" });
  const setSearch = (patch: any) => navigate({ search: ((prev: any) => ({ ...prev, ...patch })) as any });
  if (!d) return <Loading AUR={AUR} />;

  const wf = deriveWorkforce(d);
  const selected = team ? wf.teams.find((t: any) => t.team_id === team) : null;

  const filtered = wf.teams.filter((t: any) => {
    if (band !== "all" && t.risk_band !== band) return false;
    if (wt !== "all" && t.work_type !== wt) return false;
    return true;
  });

  return (
    <>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontFamily: aurSerif, fontSize: 36, fontWeight: 400, letterSpacing: -1, margin: 0, lineHeight: 1.1, color: AUR.text }}>
          Quality is an <em style={{ color: AUR.accent, fontStyle: "italic" }}>operating signal</em>, not a scoreboard.
        </h1>
        <p style={{ color: AUR.textDim, fontSize: 14.5, marginTop: 10, maxWidth: 760, lineHeight: 1.55 }}>
          {wf.counts.high} high-risk teams · {wf.counts.medium} medium · {wf.counts.low} holding the line. Risk is a deterministic blend of quality gap, CSAT gap, sev1 density, escalation pressure, and open load.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: densityPreset.gap }}>
        <AurKpi AUR={AUR} large label="High-risk teams"   value={wf.counts.high}   sub="calibration this week"      status={wf.counts.high > 3 ? "bad" : wf.counts.high > 0 ? "warn" : "good"} />
        <AurKpi AUR={AUR} large label="Medium-risk teams" value={wf.counts.medium} sub="weekly check-in"            status="warn" />
        <AurKpi AUR={AUR} large label="Holding teams"     value={wf.counts.low}    sub="use as calibration anchors" status="good" />
        <AurKpi AUR={AUR} large label="Total heads"       value={wf.teams.reduce((s: number, t: any) => s + t.contributors, 0)} sub={`${wf.teams.length} teams`} status="muted" />
      </div>

      <AurSection AUR={AUR} density={densityPreset} eyebrow="Cohort view" title="Risk by work type."
        lede="Where the quality problem clusters before you go team-by-team. The cohort with the most high-risk teams gets the calibration program first.">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: densityPreset.gap }}>
          {wf.cohorts.map((c: any) => (
            <button key={c.work_type} onClick={() => setSearch({ wt: wt === c.work_type ? "all" : c.work_type })}
              style={{
                textAlign: "left", background: wt === c.work_type ? AUR.surfaceHi : AUR.surface,
                border: `1px solid ${wt === c.work_type ? AUR.accent + "55" : AUR.border}`,
                borderRadius: 14, padding: 18, cursor: "pointer", fontFamily: aurSans, color: AUR.text,
              }}
            >
              <div style={{ fontFamily: aurMono, fontSize: 10.5, color: AUR.textFaint, letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 4 }}>{c.n} teams · {c.contributors} heads</div>
              <div style={{ fontFamily: aurSerif, fontSize: 22, color: AUR.text, letterSpacing: -0.4, marginBottom: 10 }}>{WORK_TYPE_LABELS[c.work_type]}</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, fontSize: 12 }}>
                <Stat AUR={AUR} label="Quality" value={c.avg_quality.toFixed(1)} status={classifyMetric("quality", c.avg_quality)} />
                <Stat AUR={AUR} label="CSAT"    value={c.avg_csat.toFixed(2)}    status={classifyMetric("csat", c.avg_csat)} />
                <Stat AUR={AUR} label="Sev 1"   value={c.sev1}                   status={classifyMetric("sev1", c.sev1)} />
                <Stat AUR={AUR} label="High-risk" value={c.risk_high}            status={c.risk_high > 0 ? "bad" : "good"} />
              </div>
            </button>
          ))}
        </div>
      </AurSection>

      <AurSection AUR={AUR} density={densityPreset}
        eyebrow="Teams"
        title="Sorted by risk score, descending."
        lede="Click a team to see the drivers behind its risk score and the recommended coaching action. The intent is intervention — calibration, gold tasks, SOP refresh — not ranking."
        right={
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {["all","High","Medium","Low"].map((b) => (
              <button key={b} onClick={() => setSearch({ band: b })} style={chipStyle(AUR, band === b)}>{b === "all" ? "All bands" : b}</button>
            ))}
          </div>
        }
      >
        <div style={{ background: AUR.surface, border: `1px solid ${AUR.border}`, borderRadius: 16, overflow: "hidden" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1.8fr 1fr 0.6fr 0.6fr 0.6fr 0.5fr 0.7fr 0.6fr", padding: "14px 22px", borderBottom: `1px solid ${AUR.border}`, fontFamily: aurMono, fontSize: 10.5, color: AUR.textFaint, letterSpacing: 0.6, textTransform: "uppercase" }}>
            <div>Team · manager</div><div>Work type</div><div style={{ textAlign: "right" }}>Heads</div><div style={{ textAlign: "right" }}>Quality</div><div style={{ textAlign: "right" }}>CSAT</div><div style={{ textAlign: "right" }}>Sev1</div><div>Band</div><div style={{ textAlign: "right" }}>Score</div>
          </div>
          {filtered.length === 0 && <div style={{ padding: 32, textAlign: "center", color: AUR.textFaint, fontStyle: "italic" }}>No teams match these filters.</div>}
          {filtered.map((t: any, i: number) => (
            <button key={t.team_id} onClick={() => setSearch({ team: team === t.team_id ? undefined : t.team_id })}
              style={{
                display: "grid", gridTemplateColumns: "1.8fr 1fr 0.6fr 0.6fr 0.6fr 0.5fr 0.7fr 0.6fr",
                padding: "14px 22px", alignItems: "center", width: "100%", textAlign: "left",
                background: team === t.team_id ? AUR.surfaceHi : "transparent",
                border: "none", borderLeft: team === t.team_id ? `3px solid ${AUR.accent}` : "3px solid transparent",
                borderBottom: i === filtered.length - 1 ? "none" : `1px solid ${AUR.border}`,
                fontFamily: aurSans, cursor: "pointer", color: AUR.text,
              }}
            >
              <div>
                <div style={{ fontFamily: aurMono, fontSize: 12.5, color: AUR.text }}>{t.team_id}</div>
                <div style={{ fontFamily: aurSans, fontSize: 12, color: AUR.textFaint, marginTop: 2 }}>{t.manager} · {t.city} · {t.shift}</div>
              </div>
              <div style={{ color: AUR.textDim, fontSize: 12.5 }}>{WORK_TYPE_LABELS[t.work_type]}</div>
              <div style={{ textAlign: "right", fontFamily: aurMono, fontVariantNumeric: "tabular-nums" }}>{t.contributors}</div>
              <div style={{ textAlign: "right", fontFamily: aurMono, fontVariantNumeric: "tabular-nums", color: classifyMetric("quality", t.quality) === "good" ? AUR.good : classifyMetric("quality", t.quality) === "warn" ? AUR.warn : AUR.bad }}>{t.quality.toFixed(1)}</div>
              <div style={{ textAlign: "right", fontFamily: aurMono, fontVariantNumeric: "tabular-nums", color: classifyMetric("csat", t.csat) === "good" ? AUR.good : classifyMetric("csat", t.csat) === "warn" ? AUR.warn : AUR.bad }}>{t.csat.toFixed(2)}</div>
              <div style={{ textAlign: "right", fontFamily: aurMono, fontVariantNumeric: "tabular-nums", color: t.sev1_escalations > 0 ? AUR.bad : AUR.textFaint }}>{t.sev1_escalations}</div>
              <div><AurRiskBadge AUR={AUR} level={t.risk_band} /></div>
              <div style={{ textAlign: "right", fontFamily: aurSerif, fontSize: 22, color: t.risk_score > 55 ? AUR.bad : t.risk_score > 30 ? AUR.warn : AUR.text, fontVariantNumeric: "tabular-nums", letterSpacing: -0.5 }}>{t.risk_score}</div>
            </button>
          ))}
        </div>

        {selected && <TeamDetail t={selected} AUR={AUR} />}
      </AurSection>
    </>
  );
}

function TeamDetail({ t, AUR }: any) {
  return (
    <div style={{ marginTop: 20, background: `linear-gradient(135deg, ${AUR.accentGlow}, transparent 60%)`, border: `1px solid ${AUR.accent}55`, borderRadius: 16, padding: 26 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18, gap: 16 }}>
        <div>
          <div style={{ fontFamily: aurMono, fontSize: 10.5, color: AUR.accent, letterSpacing: 0.8, textTransform: "uppercase", marginBottom: 6 }}>Team drilldown · {t.team_id}</div>
          <div style={{ fontFamily: aurSerif, fontSize: 26, fontWeight: 400, color: AUR.text, letterSpacing: -0.5, lineHeight: 1.15 }}>
            {WORK_TYPE_LABELS[t.work_type]} <span style={{ color: AUR.textFaint }}>·</span> {t.manager} <span style={{ color: AUR.textFaint }}>·</span> {t.city}
          </div>
        </div>
        <AurRiskBadge AUR={AUR} level={t.risk_band} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 24 }}>
        <div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 18 }}>
            {[
              { l: "Heads", v: t.contributors },
              { l: "Quality", v: t.quality.toFixed(1) },
              { l: "CSAT", v: t.csat.toFixed(2) },
              { l: "Sev 1", v: t.sev1_escalations },
            ].map((m: any, i: number) => (
              <div key={i} style={{ background: AUR.surface, borderRadius: 10, padding: "10px 12px", border: `1px solid ${AUR.border}` }}>
                <div style={{ fontFamily: aurMono, fontSize: 10, color: AUR.textFaint, letterSpacing: 0.5, textTransform: "uppercase" }}>{m.l}</div>
                <div style={{ fontFamily: aurSerif, fontSize: 22, color: AUR.text, marginTop: 2, fontVariantNumeric: "tabular-nums" }}>{m.v}</div>
              </div>
            ))}
          </div>
          <div style={{ fontFamily: aurMono, fontSize: 10.5, color: AUR.textFaint, letterSpacing: 0.6, textTransform: "uppercase", marginBottom: 8 }}>Risk drivers</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {t.drivers.map((s: string, i: number) => (
              <div key={i} style={{ fontSize: 13.5, color: AUR.textDim, paddingLeft: 14, borderLeft: `2px solid ${AUR.border}`, lineHeight: 1.5 }}>{s}</div>
            ))}
          </div>
        </div>
        <div style={{ background: AUR.surface, border: `1px solid ${AUR.border}`, borderRadius: 12, padding: 18 }}>
          <div style={{ fontFamily: aurMono, fontSize: 10.5, color: AUR.textFaint, letterSpacing: 0.6, textTransform: "uppercase", marginBottom: 12 }}>Recommended action</div>
          <div style={{ color: AUR.text, fontSize: 14, lineHeight: 1.55, marginBottom: 14 }}>{t.action}</div>
          <div style={{ padding: "12px 14px", background: AUR.accentGlow, borderRadius: 10, borderLeft: `2px solid ${AUR.accent}` }}>
            <div style={{ fontFamily: aurMono, fontSize: 10, color: AUR.accent, letterSpacing: 0.6, textTransform: "uppercase", marginBottom: 4 }}>How AI helps in production</div>
            <div style={{ fontSize: 12.5, color: AUR.text, lineHeight: 1.5 }}>LLM summarizes the team's last 30 days of escalation summaries into a 3-bullet calibration brief. Manager opens, reviews, runs the huddle. No autonomous decisions.</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({ AUR, label, value, status }: any) {
  const color = status === "good" ? AUR.good : status === "warn" ? AUR.warn : status === "bad" ? AUR.bad : AUR.text;
  return (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 10px", background: color + "12", borderRadius: 8, border: `1px solid ${color}28` }}>
      <span style={{ color: AUR.textFaint, fontFamily: aurMono, fontSize: 10, letterSpacing: 0.4, textTransform: "uppercase" }}>{label}</span>
      <span style={{ color, fontFamily: aurMono, fontSize: 12, fontVariantNumeric: "tabular-nums" }}>{value}</span>
    </div>
  );
}

function chipStyle(AUR: any, active: boolean) {
  return {
    background: active ? AUR.accentGlow : "transparent",
    color: active ? AUR.accent : AUR.textDim,
    border: `1px solid ${active ? AUR.accent + "55" : AUR.border}`,
    borderRadius: 999, padding: "6px 12px", fontFamily: aurMono, fontSize: 10.5,
    letterSpacing: 0.5, textTransform: "uppercase", cursor: "pointer",
  } as const;
}
