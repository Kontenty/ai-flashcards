import React from "react";
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarSeparator,
  SidebarInset,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { LayoutDashboard, Layers, Repeat } from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}

const NAV_ITEMS: NavItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Fiszki",
    href: "/flashcards",
    icon: Layers,
  },
  {
    label: "Powtórki",
    href: "/reviews",
    icon: Repeat,
  },
];

/**
 * SidebarNavigation
 * -----------------
 * Wrapper around the shadcn/ui Sidebar primitives that renders
 * the main application navigation as specified in `.ai/ui-plan.md`.
 *
 * The component itself does **not** include any logic to decide
 * when it should be rendered – hide/show it at the layout or page
 * level (e.g. don’t include it on `/` or under `/auth/*`).
 */
export default function SidebarNavigation({ children }: { children?: React.ReactNode }) {
  // Reading pathname on mount keeps the component SSR-friendly.
  const pathname = typeof window !== "undefined" ? window.location.pathname : "";

  return (
    <SidebarProvider>
      <Sidebar>
        {/* Actual sidebar content */}
        <SidebarContent>
          <SidebarHeader>AI Flash Cards</SidebarHeader>
          <SidebarMenu>
            {NAV_ITEMS.map(({ label, href, icon: Icon }) => (
              <SidebarMenuItem key={href}>
                <SidebarMenuButton asChild isActive={pathname.startsWith(href)}>
                  <a href={href}>
                    <Icon />
                    <span>{label}</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>

          {/* Simple separator and inset to keep main content aligned */}
          <SidebarSeparator />
        </SidebarContent>
      </Sidebar>

      {/* This ensures the page content keeps its layout when the sidebar is present */}
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  );
}
