import React from "react";
import type { PerformanceStatsDto, TagStatisticDto } from "@/types";

interface StatsOverviewProps {
  stats: PerformanceStatsDto;
  tagStats: TagStatisticDto[];
}

const StatsOverview: React.FC<StatsOverviewProps> = ({ stats, tagStats }) => (
  <div className="grid grid-cols-2 gap-4">
    <div className="p-4 bg-white shadow rounded">
      <h3 className="text-lg font-medium">Total Reviewed</h3>
      <p className="text-2xl">{stats.totalReviews}</p>
    </div>
    <div className="p-4 bg-white shadow rounded">
      <h3 className="text-lg font-medium">Correct %</h3>
      <p className="text-2xl">{stats.correctPercentage}%</p>
    </div>
    {tagStats.map((ts) => (
      <div key={ts.tagId} className="p-2 bg-gray-100 rounded">
        <span className="font-semibold">{ts.tagName}</span>: {ts.cardCount}
      </div>
    ))}
  </div>
);

export default StatsOverview;
