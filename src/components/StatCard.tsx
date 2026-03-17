import { Link } from "@tanstack/react-router";
import type { LucideIcon } from "lucide-react";

export function StatCard({
  label,
  count,
  icon: Icon,
  to,
}: {
  label: string;
  count: number;
  icon: LucideIcon;
  to?: string;
}) {
  const card = (
    <div className="card bg-base-100 shadow-md animate-fade-up hover:shadow-lg transition-shadow">
      <div className="card-body p-5">
        <div className="flex items-center justify-between">
          <p className="text-sm text-base-content/50">{label}</p>
          <Icon className="size-5 text-primary/60" />
        </div>
        <p className="text-3xl font-bold text-primary">{count}</p>
        {to && (
          <p className="text-xs text-base-content/30 mt-1">View details &rarr;</p>
        )}
      </div>
    </div>
  );

  if (to) {
    return <Link to={to} className="no-underline">{card}</Link>;
  }

  return card;
}
