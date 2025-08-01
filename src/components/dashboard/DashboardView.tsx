import React, { useState } from "react";
import { useDashboardData } from "@/hooks/useDashboardData";
import { StatsWidgets } from "./StatsWidgets";
import { QuickActions } from "./QuickActions";
// import { ActivityChart } from "./ActivityChart";
import { RecentFlashcardsList } from "./RecentFlashcardsList";
import { DueFlashcardsList } from "./DueFlashcardsList";
import { Toaster } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import { Plus, Zap, Repeat } from "lucide-react";
import { CreateFlashcardModal } from "@/components/flashcards/CreateFlashcardModal";

export function DashboardView() {
  const { data, loading, error, reload } = useDashboardData();
  const [showCreateModal, setShowCreateModal] = useState(false);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-20 bg-gray-200 dark:bg-gray-700 rounded" />
          ))}
        </div>
        <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded" />
        <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded" />
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="h-40 bg-gray-200 dark:bg-gray-700 rounded" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center p-4 space-y-4">
        <p className="text-destructive">Wystąpił błąd: {error}</p>
        <Button onClick={reload}>Ponów próbę</Button>
        <Toaster />
      </div>
    );
  }

  const statsTiles = [
    { label: "Łącznie fiszek", value: data.totalFlashcards },
    { label: "Łącznie recenzji", value: data.stats.totalReviewed },
    { label: "Poprawność", value: `${data.stats.correctPercent}%` },
    {
      label: "Tagów",
      value: data.tagStats.length,
    },
  ];

  const actions = [
    { label: "Generuj AI", icon: <Zap className="h-4 w-4" />, href: "/flashcards/generate" },
    {
      label: "Dodaj fiszkę",
      icon: <Plus className="h-4 w-4" />,
      onClick: () => setShowCreateModal(true),
    },
    { label: "Rozpocznij powtórkę", icon: <Repeat className="h-4 w-4" />, href: "/reviews" },
  ];

  return (
    <>
      <div className="mb-6">
        <StatsWidgets tiles={statsTiles} />
      </div>
      <div className="mb-6">
        <QuickActions actions={actions} />
      </div>
      {/* TODO: fix activity chart */}
      {/* <div className="mb-6">
        <ActivityChart data={data.activity} />
      </div> */}
      <div className="grid gap-6 md:grid-cols-2 mb-6">
        <RecentFlashcardsList items={data.recent} />
        <DueFlashcardsList items={data.due} />
      </div>
      <Toaster />
      <CreateFlashcardModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreated={reload}
      />
    </>
  );
}
