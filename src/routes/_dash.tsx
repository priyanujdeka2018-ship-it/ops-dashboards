// Pathless layout that wraps every dashboard page in DashProvider + AppShell.
// Validates the global search params (scenario, theme, density) here so they
// propagate to every child route.
import { createFileRoute, Outlet } from "@tanstack/react-router";
import { zodValidator, fallback } from "@tanstack/zod-adapter";
import { z } from "zod";
import { DashProvider } from "@/dashboards/app-context";
import { AppShell } from "@/dashboards/shell";

const searchSchema = z.object({
  s: fallback(z.enum(["healthy", "current", "crisis"]), "current").default("current"),
  t: fallback(z.enum(["teal", "violet", "rose", "sky", "amber"]), "teal").default("teal"),
  d: fallback(z.enum(["compact", "cozy", "spacious"]), "cozy").default("cozy"),
});

export const Route = createFileRoute("/_dash")({
  validateSearch: zodValidator(searchSchema),
  component: DashLayout,
});

function DashLayout() {
  const { s, t, d } = Route.useSearch();
  return (
    <DashProvider scenario={s} theme={t} density={d}>
      <AppShell>
        <Outlet />
      </AppShell>
    </DashProvider>
  );
}
