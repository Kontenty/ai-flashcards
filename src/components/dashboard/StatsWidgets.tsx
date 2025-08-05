import type { StatsTileVm } from "@/types/dashboard";
import { StatsTile } from "./StatsTile";

interface StatsWidgetsProps {
  tiles: StatsTileVm[];
}

export function StatsWidgets({ tiles }: StatsWidgetsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {tiles.map((tile, index) => (
        <StatsTile key={index} {...tile} />
      ))}
    </div>
  );
}
