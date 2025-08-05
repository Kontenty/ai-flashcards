import React from "react";
import type { TagStatisticDto } from "@/types";

interface StatsOverviewProps {
  cardsCount: number;
  tagStats: TagStatisticDto[];
}

const StatsOverview: React.FC<StatsOverviewProps> = ({ cardsCount, tagStats }) => (
  <div className="grid grid-cols-3 gap-4">
    <div className="p-4 bg-white shadow rounded">
      <h3 className="text-lg font-medium">Wszystkie fiszki</h3>
      <p className="text-2xl">{cardsCount}</p>
    </div>
    {tagStats.map((ts) => (
      <div key={ts.tagId} className="p-2 bg-gray-100 rounded">
        <span className="font-semibold">{ts.tagName}</span>: {ts.cardCount}
      </div>
    ))}
  </div>
);

export default StatsOverview;
