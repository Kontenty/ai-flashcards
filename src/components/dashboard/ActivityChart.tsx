import React, { useState } from "react";
import type { ActivityPoint } from "@/types/dashboard";
import { ResponsiveBar } from "@nivo/bar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ActivityChartNivoProps {
  data: ActivityPoint[];
}
const nivoTheme = {
  // Global font family
  fontFamily: "var(--font-sans)",

  // Styles for text in the tooltip
  tooltip: {
    container: {
      fontFamily: "var(--font-sans)",
      fontSize: 12,
    },
  },

  // Styles for the axes
  axis: {
    legend: {
      text: {
        fontFamily: "var(--font-sans)",
        fontSize: 15,
        fontWeight: 500,
      },
    },
    ticks: {
      text: {
        fontFamily: "var(--font-sans)",
        fontSize: 14,
      },
    },
  },

  // Styles for the chart legends
  legends: {
    text: {
      fontFamily: "var(--font-sans)",
    },
  },

  // Styles for chart labels (e.g., pie chart labels)
  labels: {
    text: {
      fontFamily: "var(--font-sans)",
    },
  },
};

const dateToDay = (value: string) =>
  new Intl.DateTimeFormat("pl-PL", { weekday: "short" }).format(new Date(value));

export function ActivityChart({ data }: ActivityChartNivoProps) {
  const [showReviews, setShowReviews] = useState(true);

  if (!data?.length) return null;

  const selectedKey = showReviews ? "reviews" : "meanQuality";
  const axisLabel = showReviews ? "Powtórki" : "Średnia jakość";

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <h3 className="text-lg font-semibold mr-4">Twoje postępy:</h3>
        <Button
          variant={showReviews ? "default" : "outline"}
          size="sm"
          onClick={() => setShowReviews(true)}
          className={cn(showReviews && "bg-primary text-primary-foreground")}
        >
          Powtórki
        </Button>
        <Button
          variant={!showReviews ? "default" : "outline"}
          size="sm"
          onClick={() => setShowReviews(false)}
          className={cn(!showReviews && "bg-primary text-primary-foreground")}
        >
          Średnia jakość
        </Button>
      </div>

      <div className="aspect-video w-full md:aspect-5/2">
        <ResponsiveBar
          data={data}
          keys={[selectedKey]}
          indexBy="date"
          margin={{ top: 20, right: 20, bottom: 50, left: 50 }}
          padding={0.3}
          enableGridY={false}
          enableLabel={false}
          axisBottom={{
            // tickRotation: -45,
            tickSize: 0,
            tickPadding: 6,
            legend: "Dzień",
            legendPosition: "middle",
            legendOffset: 40,
            format: dateToDay,
          }}
          axisLeft={{
            tickSize: 0,
            tickPadding: 4,
            legend: axisLabel,
            legendPosition: "middle",
            legendOffset: -40,
          }}
          tooltip={({ indexValue, value }) => (
            <div className="border-border/50 bg-background rounded-md border px-2 py-1 text-xs shadow-xl min-w-20">
              <span className="font-medium">{dateToDay(indexValue as string)}:</span> {value}
            </div>
          )}
          role="application"
          ariaLabel="Daily review activity chart"
          colors={{ scheme: "pastel1" }}
          theme={nivoTheme}
        />
      </div>
    </div>
  );
}
