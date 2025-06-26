"use client";

import { useState, useRef, useEffect } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { LayoutDashboard, Settings, LogOut } from "lucide-react";

interface User {
  email: string;
  id: string;
  avatar_url?: string;
}

interface UserNavProps {
  user?: User;
}

export default function UserNav({ user }: UserNavProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/auth/login";
  };

  if (!user) {
    return (
      <div className="flex space-x-4">
        <a href="/auth/login" className="text-sm font-medium text-primary hover:underline">
          Zaloguj się
        </a>
        <a href="/auth/register" className="text-sm font-medium text-primary hover:underline">
          Zarejestruj się
        </a>
      </div>
    );
  }

  const initials = user.email.charAt(0).toUpperCase();

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen(!open)} className="p-1 rounded-full hover:bg-muted">
        <Avatar>
          {user.avatar_url ? (
            <AvatarImage src={user.avatar_url} alt={user.email} />
          ) : (
            <AvatarFallback>{initials}</AvatarFallback>
          )}
        </Avatar>
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-md shadow-lg z-50">
          <ul className="py-1">
            <li>
              <a
                href="/dashboard"
                className="flex items-center px-4 py-2 text-sm text-foreground hover:bg-muted"
              >
                <LayoutDashboard className="mr-2 h-4 w-4" /> Dashboard
              </a>
            </li>
            <li>
              <a
                href="/settings"
                className="flex items-center px-4 py-2 text-sm text-foreground hover:bg-muted"
              >
                <Settings className="mr-2 h-4 w-4" /> Ustawienia
              </a>
            </li>
            <li>
              <button
                onClick={handleLogout}
                className="w-full text-left flex items-center px-4 py-2 text-sm text-destructive hover:bg-muted"
              >
                <LogOut className="mr-2 h-4 w-4" /> Wyloguj
              </button>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}
