import React from "react";
import type { ActionVm } from "@/types/dashboard";
import { ActionButton } from "./ActionButton";

interface QuickActionsProps {
  actions: ActionVm[];
}

// QuickActions renders a row of action buttons for dashboard shortcuts
export function QuickActions({ actions }: QuickActionsProps) {
  return (
    <div className="flex flex-wrap gap-4">
      {actions.map((action, index) => (
        <ActionButton key={index} {...action} />
      ))}
    </div>
  );
}
