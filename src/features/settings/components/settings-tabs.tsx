import Link from "next/link";

export type SettingsTabId =
  | "brand"
  | "team"
  | "brand-kit"
  | "ai-providers"
  | "usage";

export const settingsTabs: Array<{ id: SettingsTabId; label: string }> = [
  { id: "brand", label: "Brand" },
  { id: "team", label: "Team" },
  { id: "brand-kit", label: "Brand Kit" },
  { id: "ai-providers", label: "AI Providers" },
  { id: "usage", label: "Usage" },
];

export function isSettingsTabId(value: unknown): value is SettingsTabId {
  return (
    typeof value === "string" &&
    settingsTabs.some((tab) => tab.id === value)
  );
}

export function SettingsTabs({ activeTab }: { activeTab: SettingsTabId }) {
  return (
    <nav
      aria-label="Settings sections"
      className="flex gap-2 overflow-x-auto border-b border-stone-200 pb-2 dark:border-stone-800"
    >
      {settingsTabs.map((tab) => {
        const isActive = tab.id === activeTab;

        return (
          <Link
            aria-current={isActive ? "page" : undefined}
            className={
              isActive
                ? "whitespace-nowrap rounded-md bg-stone-950 px-3 py-2 text-sm font-medium text-white dark:bg-stone-50 dark:text-stone-950"
                : "whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium text-stone-600 transition hover:bg-stone-100 hover:text-stone-950 dark:text-stone-300 dark:hover:bg-stone-900 dark:hover:text-stone-50"
            }
            href={`/settings?tab=${tab.id}`}
            key={tab.id}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
