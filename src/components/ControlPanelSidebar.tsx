import React from "react";
import {
  Home,
  MessageSquare,
  NotebookPen,
  BookOpen,
  Upload,
  Blocks,
  Settings,
  Search,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "./lib/utils";
import { getCachedPlatform } from "../utils/platform";

const platform = getCachedPlatform();

export type ControlPanelView =
  "home" | "chat" | "personal-notes" | "dictionary" | "upload" | "integrations";

interface ControlPanelSidebarProps {
  activeView: ControlPanelView;
  onViewChange: (view: ControlPanelView) => void;
  onOpenSettings: () => void;
  onOpenSearch?: () => void;
  updateAction?: React.ReactNode;
}

export default function ControlPanelSidebar({
  activeView,
  onViewChange,
  onOpenSettings,
  onOpenSearch,
  updateAction,
}: ControlPanelSidebarProps) {
  const { t } = useTranslation();
  const navItems = [
    { id: "home" as const, label: t("sidebar.home"), icon: Home },
    { id: "chat" as const, label: t("sidebar.chat"), icon: MessageSquare },
    { id: "personal-notes" as const, label: t("sidebar.notes"), icon: NotebookPen },
    { id: "upload" as const, label: t("sidebar.upload"), icon: Upload },
    { id: "dictionary" as const, label: t("sidebar.dictionary"), icon: BookOpen },
    { id: "integrations" as const, label: t("sidebar.integrations"), icon: Blocks },
  ];

  return (
    <div className="w-48 h-full shrink-0 border-r border-border/15 dark:border-white/6 flex flex-col bg-surface-1/60 dark:bg-surface-1">
      <div
        className="w-full h-10 shrink-0"
        style={{ WebkitAppRegion: "drag" } as React.CSSProperties}
      />
      {onOpenSearch && (
        <div className="px-2 pt-2 pb-1">
          <button
            onClick={onOpenSearch}
            className="flex items-center w-full h-7 px-2.5 rounded-md border border-border/70 gap-2"
          >
            <Search size={11} className="text-muted-foreground/50" />
            <span className="flex-1 text-[11px] text-left text-muted-foreground/50">
              {t("commandSearch.shortPlaceholder")}
            </span>
            <kbd className="text-[10px] text-muted-foreground/40">
              {platform === "darwin" ? "⌘K" : "Ctrl K"}
            </kbd>
          </button>
        </div>
      )}
      <nav className="flex flex-col gap-0.5 px-2 pt-2 pb-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={cn(
                "flex items-center gap-2.5 w-full h-8 px-2.5 rounded-md text-left",
                active ? "bg-primary/8" : "hover:bg-foreground/4"
              )}
            >
              <Icon size={15} className={active ? "text-primary" : "text-foreground/60"} />
              <span className="text-xs">{item.label}</span>
            </button>
          );
        })}
      </nav>
      <div className="flex-1" />
      <div className="px-2 pb-2 space-y-1">
        {updateAction}
        <button
          onClick={onOpenSettings}
          className="flex items-center gap-2.5 w-full h-8 px-2.5 rounded-md hover:bg-foreground/4"
        >
          <Settings size={15} className="text-foreground/60" />
          <span className="text-xs">{t("sidebar.settings")}</span>
        </button>
      </div>
    </div>
  );
}
