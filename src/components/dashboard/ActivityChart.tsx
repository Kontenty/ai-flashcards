import React from "react";
import type { ActivityPoint } from "@/types/dashboard";
import { ResponsiveBar } from "@nivo/bar";

interface ActivityChartNivoProps {
  data: (ActivityPoint & Record<string, string | number>)[];
}

export function ActivityChart({ data }: ActivityChartNivoProps) {
  if (!data?.length) return null;

  return (
    <div className="aspect-video w-full md:aspect-5/2">
      <ResponsiveBar
        data={data}
        keys={["reviews"]}
        indexBy="date"
        margin={{ top: 20, right: 20, bottom: 50, left: 50 }}
        padding={0.3}
        enableGridY={false}
        enableLabel={false}
        axisBottom={{
          // tickRotation: -45,
          tickSize: 0,
          tickPadding: 6,
          legend: "Date",
          legendPosition: "middle",
          legendOffset: 40,
        }}
        axisLeft={{
          tickSize: 0,
          tickPadding: 4,
          legend: "Reviews",
          legendPosition: "middle",
          legendOffset: -40,
        }}
        tooltip={({ indexValue, value }) => (
          <div className="border-border/50 bg-background rounded-md border px-2 py-1 text-xs shadow-xl">
            <span className="font-medium">{indexValue}:</span> {value}
          </div>
        )}
        role="application"
        ariaLabel="Daily review activity chart"
      />
    </div>
  );
}
