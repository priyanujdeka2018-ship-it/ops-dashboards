import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
// @ts-expect-error - jsx module without types
import { AuroraDashboard } from "@/dashboards/dashboard-aurora.jsx";
// @ts-expect-error - jsx module without types
import { useScaleData } from "@/dashboards/data-utils.jsx";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Scale · Regional Ops Command Center" },
      {
        name: "description",
        content:
          "Regional operations command center prototype — SLA, CSAT, backlog, escalation patterns, quality risk, and capacity in one operating view.",
      },
      { property: "og:title", content: "Scale · Regional Ops Command Center" },
      {
        property: "og:description",
        content:
          "Interview-ready operations dashboard prototype: SLA, CSAT, escalation patterns, quality, capacity.",
      },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700&family=Geist+Mono:wght@400;500;600&family=JetBrains+Mono:wght@400;500;600;700&family=Instrument+Serif:ital@0;1&display=swap",
      },
    ],
  }),
  component: Index,
});

function Index() {
  const [scenario, setScenario] = useState<string>("current");
  const { data, err, loading } = useScaleData(scenario);
  const [showAbout, setShowAbout] = useState(false);

  useEffect(() => {
    document.body.style.background = "#0A0A12";
    document.body.style.color = "#F5F5F0";
    document.body.style.fontFamily = '"Geist", system-ui, sans-serif';
    document.body.style.margin = "0";
  }, []);

  if (err) {
    return (
      <div style={{ padding: 40, color: "#F87171", fontFamily: "monospace", background: "#0A0A12", minHeight: "100vh" }}>
        Failed to load data: {String(err)}
      </div>
    );
  }

  return (
    <AuroraDashboard
      data={data}
      scenario={scenario}
      setScenario={setScenario}
      loading={loading}
      region={data ? data.region : ""}
      accent="#5EEAD4"
      showAbout={showAbout}
      setShowAbout={setShowAbout}
    />
  );
}
