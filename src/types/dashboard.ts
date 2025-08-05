import type { ReactNode } from "react";
import type {
  PerformanceStatsDto,
  TagStatisticDto,
  FlashcardListItemDto,
  ReviewCardDto,
} from "../types";

export interface StatsTileVm {
  label: string; // e.g. "Łącznie fiszek"
  value: number | string;
  tooltip?: string;
}

export interface ActionVm {
  label: string; // e.g. "Generuj AI"
  icon: ReactNode;
  href?: string;
  onClick?: () => void;
}

export interface ActivityPoint {
  [key: string]: string | number;
  date: string; // ISO YYYY-MM-DD
  reviews: number;
  meanQuality: number;
}

export interface DashboardData {
  totalFlashcards: number;
  stats: PerformanceStatsDto;
  tagStats: TagStatisticDto[];
  recent: FlashcardListItemDto[];
  due: ReviewCardDto[];
  activity: ActivityPoint[];
}
