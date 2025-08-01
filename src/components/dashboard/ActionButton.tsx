import React from "react";
import { Button } from "@/components/ui/button";
import type { ActionVm } from "@/types/dashboard";

// ActionButton renders a stylized button with an icon that navigates to the given href
type ActionButtonProps = ActionVm;

export function ActionButton({ label, icon, href, onClick }: ActionButtonProps) {
  if (onClick) {
    return (
      <Button variant="outline" onClick={onClick} className="flex items-center gap-2">
        {icon}
        <span>{label}</span>
      </Button>
    );
  }

  return (
    <Button asChild variant="outline">
      <a href={href} className="flex items-center gap-2">
        {icon}
        <span>{label}</span>
      </a>
    </Button>
  );
}
