import { Award, Footprints, Trophy, type LucideIcon } from "lucide-react";
import type { DashboardData } from "../../types";

const ICONS: Record<string, LucideIcon> = {
  footprints: Footprints,
  trophy: Trophy,
};

export function BadgeList({ badges }: { badges: DashboardData["badges"] }) {
  if (badges.length === 0) {
    return <p className="text-sm text-slate-500">Aucun badge pour le moment. Terminez une leçon pour en débloquer un !</p>;
  }

  return (
    <ul className="flex flex-wrap gap-3">
      {badges.map((badge) => {
        const Icon = ICONS[badge.icon] ?? Award;
        return (
          <li
            key={badge.code}
            className="flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-sm text-amber-800"
            title={badge.description}
          >
            <Icon className="h-4 w-4" />
            {badge.title}
          </li>
        );
      })}
    </ul>
  );
}
