import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatDistanceToNow, isToday, isTomorrow, isPast } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "—";
  const d = typeof date === "string" ? new Date(date) : date;
  if (isToday(d)) return "Today";
  if (isTomorrow(d)) return "Tomorrow";
  return format(d, "MMM d, yyyy");
}

export function formatDateShort(date: Date | string | null | undefined): string {
  if (!date) return "—";
  const d = typeof date === "string" ? new Date(date) : date;
  return format(d, "MMM d");
}

export function formatRelative(date: Date | string | null | undefined): string {
  if (!date) return "—";
  const d = typeof date === "string" ? new Date(date) : date;
  return formatDistanceToNow(d, { addSuffix: true });
}

export function isOverdue(date: Date | string | null | undefined): boolean {
  if (!date) return false;
  const d = typeof date === "string" ? new Date(date) : date;
  return isPast(d) && !isToday(d);
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export const PROJECT_CATEGORY_LABELS: Record<string, string> = {
  CONSULTANCY: "Consultancy",
  RESEARCH: "Research",
  PROPOSAL: "Proposal",
  BUSINESS_DEVELOPMENT: "Business Development",
  PERSONAL: "Personal",
  TRAINING: "Training",
  OPERATIONS: "Operations",
};

export const PROJECT_STATUS_LABELS: Record<string, string> = {
  NOT_STARTED: "Not Started",
  PLANNING: "Planning",
  ACTIVE: "Active",
  ON_HOLD: "On Hold",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

export const PRIORITY_LABELS: Record<string, string> = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
  CRITICAL: "Critical",
};

export const PROJECT_STATUS_COLORS: Record<string, string> = {
  NOT_STARTED: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
  PLANNING: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  ACTIVE: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  ON_HOLD: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  COMPLETED: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  CANCELLED: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
};

export const PRIORITY_COLORS: Record<string, string> = {
  LOW: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
  MEDIUM: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  HIGH: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  CRITICAL: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
};

export const COLOR_LABELS: { value: string; label: string; bg: string }[] = [
  { value: "#6366f1", label: "Indigo", bg: "bg-indigo-500" },
  { value: "#8b5cf6", label: "Violet", bg: "bg-violet-500" },
  { value: "#3b82f6", label: "Blue", bg: "bg-blue-500" },
  { value: "#10b981", label: "Emerald", bg: "bg-emerald-500" },
  { value: "#f59e0b", label: "Amber", bg: "bg-amber-500" },
  { value: "#ef4444", label: "Red", bg: "bg-red-500" },
  { value: "#ec4899", label: "Pink", bg: "bg-pink-500" },
  { value: "#14b8a6", label: "Teal", bg: "bg-teal-500" },
  { value: "#64748b", label: "Slate", bg: "bg-slate-500" },
];
