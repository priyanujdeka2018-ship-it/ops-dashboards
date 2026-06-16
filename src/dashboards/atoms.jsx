// Atom design primitives — extracted from the original aurora dashboard.
// Themed via the AUR object built from a theme preset + accent.
import React from "react";

export const aurSans  = `"Geist", "Geist Sans", ui-sans-serif, system-ui, sans-serif`;
export const aurSerif = `"Instrument Serif", "Source Serif Pro", Georgia, serif`;
export const aurMono  = `"Geist Mono", "JetBrains Mono", ui-monospace, monospace`;

export function buildAurTheme(themePreset) {
  return {
    bg: "#0A0A12",
    surface: "rgba(255,255,255,0.025)",
    surfaceHi: "rgba(255,255,255,0.045)",
    border: "rgba(255,255,255,0.08)",
    borderHi: "rgba(255,255,255,0.15)",
    text: "#F5F5F0",
    textDim: "#B7B5AA",
    textFaint: "#6E6C66",
    accent: themePreset.accent,
    accentDeep: themePreset.accentDeep,
    accentGlow: themePreset.accent + "30",
    inkOnAccent: themePreset.inkOnAccent,
    good: "#5EEAD4",
    warn: "#FBBF77",
    bad: "#F87171",
  };
}

// ─── Atoms ──────────────────────────────────────────────────────────────────

export function AurChip({ children, color, bg, AUR }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 6, padding: "3px 10px",
      borderRadius: 999, background: bg || AUR.surface, color: color || AUR.textDim,
      fontFamily: aurMono, fontSize: 10.5, letterSpacing: 0.5, textTransform: "uppercase",
      border: `1px solid ${AUR.border}`,
    }}>{children}</span>
  );
}

export function AurStatusPill({ status, AUR }) {
  const map = {
    Accelerating:   { c: AUR.bad,  label: "Accelerating" },
    Recurring:      { c: AUR.warn, label: "Recurring" },
    Watchlist:      { c: AUR.warn, label: "Watchlist" },
    New:            { c: AUR.accent, label: "New" },
    Resolved:       { c: AUR.good, label: "Resolved" },
    Dormant:        { c: AUR.textFaint, label: "Dormant" },
    "Low activity": { c: AUR.textFaint, label: "Low activity" },
  };
  const m = map[status] || { c: AUR.textFaint, label: status };
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 6, padding: "3px 10px",
      borderRadius: 999, background: m.c + "18", color: m.c, fontFamily: aurMono,
      fontSize: 10.5, letterSpacing: 0.5, textTransform: "uppercase",
      border: `1px solid ${m.c}40`,
    }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: m.c }} />
      {m.label}
    </span>
  );
}

export function AurRiskBadge({ level, AUR }) {
  const c = level === "High" ? AUR.bad : level === "Medium" ? AUR.warn : AUR.good;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", padding: "3px 10px", borderRadius: 999,
      background: c + "18", color: c, fontFamily: aurMono, fontSize: 10.5,
      letterSpacing: 0.5, textTransform: "uppercase", border: `1px solid ${c}40`,
    }}>{level}</span>
  );
}

import { Sparkline } from "./data-utils";

export function AurKpi({ label, value, sub, status = "good", trendData, large = false, AUR }) {
  const dotColor = status === "good" ? AUR.good : status === "warn" ? AUR.warn : status === "bad" ? AUR.bad : AUR.textFaint;
  return (
    <div style={{
      background: AUR.surface, border: `1px solid ${AUR.border}`, borderRadius: 14,
      padding: large ? "18px 20px" : "14px 16px", position: "relative", overflow: "hidden",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
        <div style={{ fontFamily: aurMono, fontSize: 10.5, color: AUR.textFaint, letterSpacing: 0.6, textTransform: "uppercase" }}>{label}</div>
        <span style={{ width: 6, height: 6, borderRadius: "50%", background: dotColor, boxShadow: `0 0 8px ${dotColor}66` }} />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12 }}>
        <div style={{ fontFamily: aurSerif, fontSize: large ? 42 : 28, fontWeight: 400, letterSpacing: -1, lineHeight: 1, color: AUR.text, fontVariantNumeric: "tabular-nums" }}>{value}</div>
        {trendData && trendData.length > 1 && (
          <Sparkline values={trendData} color={dotColor} width={large ? 80 : 60} height={large ? 28 : 22} fill strokeWidth={1.5} />
        )}
      </div>
      {sub && <div style={{ fontFamily: aurMono, fontSize: 10.5, color: AUR.textFaint, letterSpacing: 0.4, marginTop: 8 }}>{sub}</div>}
    </div>
  );
}

export function AurSection({ eyebrow, title, lede, right, children, AUR, density }) {
  const gapBelow = density?.sectionGap || 32;
  return (
    <section style={{ marginTop: gapBelow }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 18, gap: 24, flexWrap: "wrap" }}>
        <div style={{ minWidth: 0, flex: 1 }}>
          {eyebrow && <div style={{ fontFamily: aurMono, fontSize: 10.5, color: AUR.accent, letterSpacing: 0.8, textTransform: "uppercase", marginBottom: 8 }}>{eyebrow}</div>}
          {title && <h2 style={{ fontFamily: aurSerif, fontSize: 30, fontWeight: 400, letterSpacing: -0.7, margin: 0, lineHeight: 1.1, color: AUR.text }}>{title}</h2>}
          {lede && <p style={{ fontFamily: aurSans, fontSize: 13.5, color: AUR.textDim, marginTop: 8, maxWidth: 720, lineHeight: 1.55 }}>{lede}</p>}
        </div>
        {right}
      </div>
      {children}
    </section>
  );
}

export function AurButton({ children, variant = "ghost", onClick, active = false, AUR }) {
  const styles = {
    ghost:   { background: active ? AUR.surfaceHi : "transparent", color: AUR.text, border: `1px solid ${active ? AUR.borderHi : AUR.border}` },
    primary: { background: AUR.accent, color: AUR.inkOnAccent, border: "none" },
    chip:    { background: active ? AUR.accentGlow : "transparent", color: active ? AUR.accent : AUR.textDim, border: `1px solid ${active ? AUR.accent + "55" : AUR.border}` },
  }[variant] || {};
  return (
    <button onClick={onClick} style={{
      ...styles, borderRadius: 999, padding: "8px 16px", fontFamily: aurSans,
      fontSize: 12.5, fontWeight: 500, cursor: "pointer", transition: "all 180ms ease",
    }}>{children}</button>
  );
}

export function MetricCell({ value, status, AUR }) {
  const color = status === "good" ? AUR.good : status === "warn" ? AUR.warn : status === "bad" ? AUR.bad : AUR.text;
  return (
    <div style={{
      textAlign: "center", padding: "10px 8px", borderRadius: 10,
      background: color + "12", border: `1px solid ${color}28`,
      fontFamily: aurMono, fontSize: 13, color, fontVariantNumeric: "tabular-nums",
    }}>{value}</div>
  );
}
