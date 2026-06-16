// Shared data + derivation helpers for the Scale Ops Command Center.
// Pure functions; safe to import from any route or atom.
import React from "react";

// ─── Label dictionaries ──────────────────────────────────────────────────────

export const ROOT_CAUSE_LABELS = {
  policy_ambiguity: "Policy ambiguity",
  reviewer_misalignment: "Reviewer misalignment",
  quality_defect: "Quality defect",
  tooling_issue: "Tooling issue",
  customer_requirement_change: "Customer requirement change",
  sla_miss: "SLA miss",
  workflow_handoff_gap: "Workflow handoff gap",
  capacity_shortfall: "Capacity shortfall",
};

export const WORK_TYPE_LABELS = {
  image_annotation: "Image annotation",
  rlhf_evaluation: "RLHF evaluation",
  code_review: "Code review",
  audio_evaluation: "Audio evaluation",
  expert_review: "Expert review",
};

export const ROOT_CAUSE_FIX = {
  policy_ambiguity: {
    fix: "SOP rewrite + calibration huddle",
    owner: "Policy Ops lead + frontline manager",
    metric: "Reviewer agreement rate; repeat escalations",
  },
  reviewer_misalignment: {
    fix: "Reviewer calibration + QA sampling boost",
    owner: "Quality lead + reviewer manager",
    metric: "Disagreement rate; QA defect rate",
  },
  quality_defect: {
    fix: "Gold task refresh + QA containment",
    owner: "QA lead",
    metric: "Quality score; gold task pass rate",
  },
  tooling_issue: {
    fix: "Tooling change + workaround comm",
    owner: "Tooling / product ops",
    metric: "Tooling escalations; outage incidents",
  },
  customer_requirement_change: {
    fix: "Customer instruction propagation",
    owner: "Customer ops lead + training",
    metric: "Instruction-change escalations; CSAT",
  },
  sla_miss: {
    fix: "Staffing / capacity correction",
    owner: "Regional ops manager",
    metric: "SLA adherence; aged backlog",
  },
  workflow_handoff_gap: {
    fix: "Queue routing + named handoff owner",
    owner: "Workflow ops lead",
    metric: "Handoff delay; reopen rate",
  },
  capacity_shortfall: {
    fix: "Staffing rebalance / surge coverage",
    owner: "Workforce planning lead",
    metric: "Backlog age; utilization",
  },
};

export const ROOT_CAUSE_DECISION = {
  policy_ambiguity: "Approve SOP clarification + require examples for ambiguous cases",
  reviewer_misalignment: "Calibration: one team or regional reviewers?",
  quality_defect: "Approve gold-task refresh + temporary QA sampling boost",
  tooling_issue: "Prioritize fix or approve interim operational workaround",
  customer_requirement_change: "Confirm source of truth, audit propagation",
  sla_miss: "Approve temp staffing rebalance / surge coverage",
  workflow_handoff_gap: "Clarify handoff ownership, update routing rules",
  capacity_shortfall: "Approve capacity rebalance / cross-trained backup",
};

export const SEVERITY_LABELS = { sev1: "Sev 1", sev2: "Sev 2", sev3: "Sev 3", sev4: "Sev 4" };

export const STATUS_COLORS = {
  good: "#10B981",
  warn: "#F59E0B",
  bad: "#EF4444",
  info: "#22D3EE",
  muted: "#64748B",
};

// ─── Theme + density presets ─────────────────────────────────────────────────

export const THEME_PRESETS = {
  teal: { id: "teal", label: "Teal", accent: "#5EEAD4", accentDeep: "#0EB8A0", inkOnAccent: "#0A1A18" },
  violet: { id: "violet", label: "Violet", accent: "#B79DFF", accentDeep: "#7C5CFC", inkOnAccent: "#1A0033" },
  rose: { id: "rose", label: "Rose", accent: "#FF8FB1", accentDeep: "#F43F8C", inkOnAccent: "#2A0312" },
  sky: { id: "sky", label: "Sky", accent: "#7DD3FC", accentDeep: "#0284C7", inkOnAccent: "#021627" },
  amber: { id: "amber", label: "Amber", accent: "#FBBF77", accentDeep: "#EA8A1E", inkOnAccent: "#2A1804" },
};

export const DENSITY_PRESETS = {
  compact: { id: "compact", label: "Compact", padX: 32, padY: 24, gap: 12, sectionGap: 24, fontBody: 13, rowGap: 10 },
  cozy:    { id: "cozy",    label: "Cozy",    padX: 48, padY: 36, gap: 18, sectionGap: 36, fontBody: 14, rowGap: 14 },
  spacious:{ id: "spacious",label: "Spacious",padX: 64, padY: 52, gap: 24, sectionGap: 56, fontBody: 15, rowGap: 18 },
};

// ─── Audience lens (interview framing) ───────────────────────────────────────

export const AUDIENCE_LENS = [
  {
    id: "regional_ops_lead",
    title: "Regional Ops Lead",
    blurb: "Owns SLA, backlog, escalations across a region.",
    opens: ["/health", "/capacity"],
    priorityKpis: ["sla_adherence", "backlog", "aged_backlog_72h"],
    ai_leverage:
      "AI scans 250+ escalation summaries each morning, surfaces recurring operational patterns, and drafts the weekly briefing. Lead spends time on decisions, not aggregation.",
  },
  {
    id: "quality_lead",
    title: "Quality Lead",
    blurb: "Defends quality scores, runs calibration, owns rework.",
    opens: ["/workforce", "/patterns"],
    priorityKpis: ["avg_quality", "rework_rate"],
    ai_leverage:
      "Embeddings cluster escalations by how teams describe breakdowns, not just by label. Calibration targets are picked from semantic clusters, not gut feel.",
  },
  {
    id: "workforce_planner",
    title: "Workforce Planner",
    blurb: "Allocates capacity across work types and shifts.",
    opens: ["/capacity", "/workforce"],
    priorityKpis: ["backlog", "escalation_rate_per_1000"],
    ai_leverage:
      "Forecasts backlog 7-14 days out from inflow + throughput + complexity. Flags shortfall before SLA breaks, recommends cross-train swaps.",
  },
  {
    id: "customer_ops_lead",
    title: "Customer Ops Lead",
    blurb: "Owns CSAT, escalation experience, customer comms.",
    opens: ["/patterns", "/clusters"],
    priorityKpis: ["csat_7d", "fcr_proxy"],
    ai_leverage:
      "Semantic clustering catches when 3 different customers report the same friction with different words — fix lands before a 4th account is at risk.",
  },
  {
    id: "engineering_manager",
    title: "Engineering Manager",
    blurb: "Wants production architecture & failure modes.",
    opens: ["/about"],
    priorityKpis: [],
    ai_leverage:
      "All scoring is deterministic and explainable; LLM is scoped to summarization + clustering, not decisions. Pipeline runs offline → JSON snapshot → cached read.",
  },
];

// ─── Metric classification ───────────────────────────────────────────────────

export function classifyMetric(metric, value) {
  switch (metric) {
    case "sla":             return value >= 95 ? "good" : value >= 90 ? "warn" : "bad";
    case "csat":            return value >= 4.4 ? "good" : value >= 4.2 ? "warn" : "bad";
    case "quality":         return value >= 90 ? "good" : value >= 85 ? "warn" : "bad";
    case "escalation_rate": return value <= 8 ? "good" : value <= 15 ? "warn" : "bad";
    case "open":            return value <= 5 ? "good" : value <= 15 ? "warn" : "bad";
    case "sev1":            return value === 0 ? "good" : value <= 2 ? "warn" : "bad";
    case "rework":          return value <= 5 ? "good" : value <= 8 ? "warn" : "bad";
    case "utilization":     return value <= 86 ? "good" : value <= 92 ? "warn" : "bad";
    default:                return "muted";
  }
}

// ─── Formatting helpers ──────────────────────────────────────────────────────

export const fmt = {
  pct:  (v) => `${Number(v).toFixed(1)}%`,
  num:  (v) => Number(v).toLocaleString("en-US"),
  dec:  (v, d = 1) => Number(v).toFixed(d),
  short:(v) => (v >= 1000 ? (v / 1000).toFixed(1) + "k" : String(Math.round(v))),
  date: (iso) => {
    const d = new Date(iso);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  },
  rel: (days) => (days === 0 ? "today" : days === 1 ? "1d ago" : days < 30 ? `${days}d ago` : `${Math.floor(days / 7)}w ago`),
};

// ─── Scenario loader hook ────────────────────────────────────────────────────

export function useScaleData(scenario = "current") {
  const [data, setData] = React.useState(null);
  const [err, setErr] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  React.useEffect(() => {
    let cancelled = false;
    setLoading(true); setErr(null);
    const primary = `/data/data-${scenario}.json`;
    fetch(primary)
      .then((r) => (r.ok ? r.json() : fetch("/data/data.json").then((f) => f.json())))
      .then((d) => { if (!cancelled) { setData(d); setLoading(false); } })
      .catch((e) => { if (!cancelled) { setErr(String(e)); setLoading(false); } });
    return () => { cancelled = true; };
  }, [scenario]);
  return { data, err, loading, scenario };
}

// ─── Sparkline ───────────────────────────────────────────────────────────────

export function Sparkline({ values, color = "currentColor", width = 80, height = 24, fill = false, strokeWidth = 1.5 }) {
  if (!values || values.length < 2) return null;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const stepX = width / (values.length - 1);
  const points = values.map((v, i) => [i * stepX, height - ((v - min) / range) * (height - 4) - 2]);
  const path = points.map((p, i) => (i === 0 ? `M${p[0].toFixed(1)},${p[1].toFixed(1)}` : `L${p[0].toFixed(1)},${p[1].toFixed(1)}`)).join(" ");
  const areaPath = path + ` L${width},${height} L0,${height} Z`;
  return (
    <svg width={width} height={height} style={{ display: "block" }} viewBox={`0 0 ${width} ${height}`}>
      {fill && <path d={areaPath} fill={color} opacity={0.18} />}
      <path d={path} fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ─── Module C: Workforce Quality derivation ─────────────────────────────────
// Deterministic per-team risk derived from the existing team rollup. Mirrors
// the spirit of src/workforce_quality.py: quality gap, csat gap, sev1
// density, escalation pressure, weighted into a 0-100 risk score.

const QUALITY_TARGET = 90;
const CSAT_TARGET = 4.4;

export function deriveWorkforce(d) {
  if (!d?.teams) return null;
  const teams = d.teams.map((t) => {
    const qualityGap = Math.max(0, QUALITY_TARGET - t.quality);                  // 0..15ish
    const csatGap = Math.max(0, CSAT_TARGET - t.csat);                            // 0..1
    const sev1Density = (t.sev1_escalations / Math.max(1, t.contributors)) * 100; // per-100 heads
    const escDensity = (t.escalations / Math.max(1, t.contributors));             // raw per-head
    const openLoad = t.open_escalations;

    const score = Math.round(
      Math.min(100,
        qualityGap * 4.0 +     // 0..60
        csatGap * 20 +         // 0..20
        sev1Density * 0.9 +    // 0..30ish
        Math.min(escDensity, 5) * 2 +  // capped 0..10
        Math.min(openLoad, 20) * 0.5   // capped 0..10
      )
    );
    const band = score >= 55 ? "High" : score >= 28 ? "Medium" : "Low";
    const drivers = [];
    if (qualityGap >= 3) drivers.push(`Quality ${t.quality.toFixed(1)} vs ${QUALITY_TARGET} target`);
    if (csatGap >= 0.15) drivers.push(`CSAT ${t.csat.toFixed(2)} vs ${CSAT_TARGET} target`);
    if (t.sev1_escalations >= 3) drivers.push(`${t.sev1_escalations} sev1 across ${t.contributors} heads`);
    if (t.open_escalations >= 8) drivers.push(`${t.open_escalations} open escalations`);
    if (drivers.length === 0) drivers.push("Holding the line — fold into calibration pool");

    const action =
      band === "High"
        ? "Calibration huddle this week + QA sampling boost. Pair with peer team."
        : band === "Medium"
          ? "Weekly check-in. Refresh top-3 gold tasks for this work type."
          : "Maintain. Use as calibration anchor for higher-risk teams.";

    return { ...t, risk_score: score, risk_band: band, drivers, action, quality_gap: qualityGap };
  });

  const sorted = [...teams].sort((a, b) => b.risk_score - a.risk_score);

  // cohort by work_type
  const cohorts = {};
  for (const t of teams) {
    const c = cohorts[t.work_type] ||= { work_type: t.work_type, teams: [], avg_quality: 0, avg_csat: 0, sev1: 0, contributors: 0, risk_high: 0 };
    c.teams.push(t);
    c.avg_quality += t.quality;
    c.avg_csat += t.csat;
    c.sev1 += t.sev1_escalations;
    c.contributors += t.contributors;
    if (t.risk_band === "High") c.risk_high++;
  }
  const cohortList = Object.values(cohorts).map((c) => ({
    ...c,
    n: c.teams.length,
    avg_quality: c.avg_quality / c.teams.length,
    avg_csat: c.avg_csat / c.teams.length,
  }));

  return {
    teams: sorted,
    cohorts: cohortList,
    counts: {
      high: teams.filter((t) => t.risk_band === "High").length,
      medium: teams.filter((t) => t.risk_band === "Medium").length,
      low: teams.filter((t) => t.risk_band === "Low").length,
    },
  };
}

// ─── Module D: Capacity / SLA forecast derivation ───────────────────────────
// From kpis + kpiTrends.backlog + workTypeRollup we synthesize a 7-day
// outlook per work_type. Aligned to src/capacity_forecast.py vocabulary
// (utilization bands, complexity factor, SLA-protective recommendation).

const SAFE_UTIL = 86;
const HIGH_UTIL = 92;

export function deriveCapacity(d) {
  if (!d) return null;
  const trend = d.kpiTrends?.backlog || [];
  const last = trend[trend.length - 1] || d.kpis.backlog;
  const prev = trend[trend.length - 2] || last;
  const weeklyDelta = last - prev;          // backlog change last week
  const projected7d = Math.max(0, Math.round(last + weeklyDelta));
  const projected14d = Math.max(0, Math.round(last + weeklyDelta * 2));

  // proportional split by work_type using escalations as a load proxy
  const totalEsc = d.workTypeRollup.reduce((s, w) => s + w.escalations, 0) || 1;

  const workTypes = d.workTypeRollup.map((w) => {
    const share = w.escalations / totalEsc;
    const backlogShare = Math.round(last * share);
    const projShare7d = Math.round(projected7d * share);
    const projShare14d = Math.round(projected14d * share);

    // utilization heuristic: open load per head, scaled
    const util = Math.min(100, Math.round(60 + (w.open_escalations / Math.max(1, w.contributors)) * 120));
    const utilBand = util <= SAFE_UTIL ? "safe" : util <= HIGH_UTIL ? "stretched" : "overcapacity";

    // SLA gap vs 95 target
    const slaGap = Math.max(0, 95 - w.sla);

    // recommendation
    let recommendation;
    let owner = "Workforce planner";
    if (utilBand === "overcapacity" && slaGap >= 3) {
      recommendation = "Approve 2-week surge coverage + cross-train from adjacent work type.";
    } else if (utilBand === "overcapacity") {
      recommendation = "Rebalance queues — pull from lowest-utilization team into this work type.";
    } else if (slaGap >= 4) {
      recommendation = "SLA is breaking ahead of capacity — investigate complexity mix and tooling.";
      owner = "Regional ops lead";
    } else if (utilBand === "stretched") {
      recommendation = "Watch. Hold staffing, monitor aged backlog and sev1 trend daily.";
    } else {
      recommendation = "Healthy. Offer this team as cross-train donor for stretched work types.";
    }

    return {
      work_type: w.work_type,
      teams: w.teams,
      contributors: w.contributors,
      backlog: backlogShare,
      projected_7d: projShare7d,
      projected_14d: projShare14d,
      delta_7d: projShare7d - backlogShare,
      sla: w.sla,
      sla_gap: slaGap,
      utilization: util,
      util_band: utilBand,
      open: w.open_escalations,
      sev1: w.sev1,
      recommendation,
      owner,
    };
  });

  // Region rollup
  const totalBacklog = workTypes.reduce((s, w) => s + w.backlog, 0);
  const totalProj7d = workTypes.reduce((s, w) => s + w.projected_7d, 0);
  const totalProj14d = workTypes.reduce((s, w) => s + w.projected_14d, 0);
  const regionUtil = Math.round(
    workTypes.reduce((s, w) => s + w.utilization * w.contributors, 0) /
    Math.max(1, workTypes.reduce((s, w) => s + w.contributors, 0))
  );

  // Suggested rebalances: donor (lowest util) → recipient (highest util & SLA gap)
  const byUtil = [...workTypes].sort((a, b) => a.utilization - b.utilization);
  const donor = byUtil[0];
  const recipient = [...workTypes].sort((a, b) => (b.utilization + b.sla_gap) - (a.utilization + a.sla_gap))[0];
  const rebalance = donor && recipient && donor.work_type !== recipient.work_type
    ? { donor: donor.work_type, recipient: recipient.work_type, heads: Math.max(2, Math.round(donor.contributors * 0.08)) }
    : null;

  return {
    region: {
      backlog: totalBacklog,
      projected_7d: totalProj7d,
      projected_14d: totalProj14d,
      utilization: regionUtil,
      weekly_delta: weeklyDelta,
    },
    workTypes,
    rebalance,
  };
}
