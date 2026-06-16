// AppShell: header (logo, scenario, theme, density), nav rail, content slot,
// briefing + about modals. Read state from useDash(), write state by
// navigating with search params.
import React, { useState } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useDash, type ScenarioId, type ThemeId, type DensityId } from "./app-context";
// @ts-expect-error jsx module
import { aurMono, aurSans, aurSerif, AurChip, AurButton } from "./atoms.jsx";
// @ts-expect-error jsx module
import { THEME_PRESETS, DENSITY_PRESETS } from "./data-utils.jsx";
// @ts-expect-error jsx module
import { BriefingModal, AboutModal } from "./modals.jsx";

const NAV = [
  { to: "/",          label: "Home",       desc: "Command center" },
  { to: "/health",    label: "Health",     desc: "Module A · regional" },
  { to: "/patterns",  label: "Patterns",   desc: "Module B · recurrence" },
  { to: "/clusters",  label: "Clusters",   desc: "Module B v2 · semantic" },
  { to: "/workforce", label: "Workforce",  desc: "Module C · quality risk" },
  { to: "/capacity",  label: "Capacity",   desc: "Module D · SLA forecast" },
  { to: "/drilldown", label: "Drilldown",  desc: "Work-type detail" },
  { to: "/about",     label: "About",      desc: "Audience + production" },
] as const;

export function AppShell({ children }: { children: React.ReactNode }) {
  const { AUR, densityPreset, themePreset, density, theme, scenario, data, loading } = useDash();
  const [showBriefing, setShowBriefing] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const updateSearch = (patch: Partial<{ s: ScenarioId; t: ThemeId; d: DensityId }>) => {
    navigate({ to: pathname as any, search: ((prev: any) => ({ ...prev, ...patch })) as any });
  };

  const padX = densityPreset.padX;
  const padY = densityPreset.padY;

  return (
    <div style={{
      minHeight: "100vh", background: AUR.bg, color: AUR.text,
      fontFamily: aurSans, fontSize: densityPreset.fontBody,
      display: "grid", gridTemplateColumns: "232px 1fr", position: "relative", overflow: "hidden",
    }}>
      {/* ambient glow */}
      <div style={{ position: "fixed", top: -200, right: -200, width: 700, height: 700, borderRadius: "50%", background: `radial-gradient(circle, ${AUR.accent}30 0%, transparent 65%)`, pointerEvents: "none", zIndex: 0 }} />
      <div style={{ position: "fixed", bottom: -300, left: -150, width: 800, height: 800, borderRadius: "50%", background: `radial-gradient(circle, ${AUR.good}15 0%, transparent 60%)`, pointerEvents: "none", zIndex: 0 }} />

      {/* nav rail */}
      <aside style={{
        position: "sticky", top: 0, height: "100vh", padding: "28px 18px",
        borderRight: `1px solid ${AUR.border}`, background: "rgba(8,8,14,0.6)",
        backdropFilter: "blur(12px)", zIndex: 2, display: "flex", flexDirection: "column", gap: 18,
      }}>
        <Link to="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none", color: AUR.text }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: `linear-gradient(135deg, ${AUR.accent}, ${AUR.accentDeep})`, display: "grid", placeItems: "center", fontFamily: aurSerif, fontSize: 18, color: AUR.inkOnAccent }}>S</div>
          <div>
            <div style={{ fontFamily: aurSerif, fontSize: 16, color: AUR.text, lineHeight: 1.1 }}>Scale Ops</div>
            <div style={{ fontFamily: aurMono, fontSize: 9.5, color: AUR.textFaint, letterSpacing: 0.5, textTransform: "uppercase" }}>Command Center</div>
          </div>
        </Link>

        <nav style={{ display: "flex", flexDirection: "column", gap: 2, marginTop: 8 }}>
          {NAV.map((n) => {
            const active = pathname === n.to;
            return (
              <Link
                key={n.to} to={n.to as any}
                search={((prev: any) => prev) as any}
                style={{
                  textDecoration: "none", padding: "9px 12px", borderRadius: 10,
                  background: active ? AUR.accentGlow : "transparent",
                  border: `1px solid ${active ? AUR.accent + "55" : "transparent"}`,
                  color: active ? AUR.accent : AUR.text,
                  display: "block", transition: "all 150ms ease",
                }}
              >
                <div style={{ fontSize: 13, fontWeight: 500 }}>{n.label}</div>
                <div style={{ fontFamily: aurMono, fontSize: 9.5, color: active ? AUR.accent : AUR.textFaint, letterSpacing: 0.4, marginTop: 2 }}>{n.desc}</div>
              </Link>
            );
          })}
        </nav>

        <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: 12 }}>
          <button onClick={() => setShowAbout(true)} style={{ background: "transparent", border: `1px solid ${AUR.border}`, color: AUR.textDim, fontFamily: aurMono, fontSize: 10, letterSpacing: 0.5, textTransform: "uppercase", padding: "8px 10px", borderRadius: 8, cursor: "pointer", textAlign: "left" }}>About the prototype</button>
          <div style={{ fontFamily: aurMono, fontSize: 9.5, color: AUR.textFaint, letterSpacing: 0.4 }}>
            {data ? <>Pipeline: {data.scenario}<br />{data.generated_at}</> : "Loading…"}
          </div>
        </div>
      </aside>

      {/* main */}
      <div style={{ position: "relative", zIndex: 1, padding: `${padY}px ${padX}px ${padY + 24}px`, minWidth: 0 }}>
        <header style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 24, marginBottom: 28, flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <AurChip AUR={AUR} color={AUR.good}><span style={{ width: 6, height: 6, borderRadius: "50%", background: AUR.good, boxShadow: `0 0 8px ${AUR.good}` }} />Live</AurChip>
            {data && <AurChip AUR={AUR}>{data.region}</AurChip>}
            {data && <AurChip AUR={AUR}>Week of {data.weekStart} → {data.refDate}</AurChip>}
            {loading && <span style={{ fontFamily: aurMono, fontSize: 10, color: AUR.textFaint }}>loading scenario…</span>}
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: 14, alignItems: "center", justifyContent: "flex-end" }}>
            {/* Scenario */}
            <TogglePill label="Scenario" AUR={AUR}>
              {(["healthy","current","crisis"] as ScenarioId[]).map((s) => (
                <PillButton key={s} active={scenario === s} AUR={AUR} onClick={() => updateSearch({ s })}>{s[0].toUpperCase() + s.slice(1)}</PillButton>
              ))}
            </TogglePill>

            {/* Theme */}
            <TogglePill label="Accent" AUR={AUR}>
              {Object.values(THEME_PRESETS).map((tp: any) => (
                <button key={tp.id} title={tp.label} onClick={() => updateSearch({ t: tp.id })} style={{
                  width: 22, height: 22, borderRadius: "50%", margin: "0 2px",
                  background: tp.accent, cursor: "pointer",
                  border: theme === tp.id ? `2px solid ${AUR.text}` : `2px solid transparent`,
                  boxShadow: theme === tp.id ? `0 0 12px ${tp.accent}99` : "none",
                }} />
              ))}
            </TogglePill>

            {/* Density */}
            <TogglePill label="Density" AUR={AUR}>
              {(Object.values(DENSITY_PRESETS) as any[]).map((dp) => (
                <PillButton key={dp.id} active={density === dp.id} AUR={AUR} onClick={() => updateSearch({ d: dp.id })}>{dp.label}</PillButton>
              ))}
            </TogglePill>

            <AurButton AUR={AUR} variant="primary" onClick={() => setShowBriefing(true)}>Weekly briefing →</AurButton>
          </div>
        </header>

        <main style={{ maxWidth: 1480 }}>{children}</main>
      </div>

      {showBriefing && data && <BriefingModal d={data} k={data.kpis} AUR={AUR} onClose={() => setShowBriefing(false)} />}
      {showAbout && <AboutModal AUR={AUR} onClose={() => setShowAbout(false)} />}
    </div>
  );
}

function TogglePill({ label, AUR, children }: { label: string; AUR: any; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <span style={{ fontFamily: aurMono, fontSize: 9.5, color: AUR.textFaint, letterSpacing: 0.6, textTransform: "uppercase" }}>{label}</span>
      <div style={{ display: "flex", alignItems: "center", gap: 4, padding: 4, background: AUR.surface, border: `1px solid ${AUR.border}`, borderRadius: 999 }}>{children}</div>
    </div>
  );
}

function PillButton({ active, AUR, onClick, children }: any) {
  return (
    <button onClick={onClick} style={{
      background: active ? AUR.accent : "transparent",
      color: active ? AUR.inkOnAccent : AUR.textDim,
      border: "none", borderRadius: 999, padding: "5px 12px",
      fontFamily: aurSans, fontSize: 11.5, fontWeight: 500, cursor: "pointer",
      transition: "all 180ms ease",
    }}>{children}</button>
  );
}
