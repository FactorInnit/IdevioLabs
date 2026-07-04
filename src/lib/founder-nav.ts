import {
  Flame,
  Calendar,
  ClipboardList,
  DollarSign,
  FileText,
  LayoutDashboard,
  Map,
  MessageSquare,
  Settings,
  Shield,
  Swords,
  Target,
  UserPlus,
  Users,
  Workflow,
  type LucideIcon,
} from "lucide-react";

export type FounderModuleId =
  | "dashboard"
  | "workspace"
  | "validator"
  | "competitors"
  | "customers"
  | "roadmap"
  | "finance"
  | "pitch"
  | "documents"
  | "habits"
  | "calendar"
  | "team"
  | "chat"
  | "ceo-review"
  | "settings";

export interface FounderNavItem {
  id: FounderModuleId;
  label: string;
  icon: LucideIcon;
  description: string;
}

export const FOUNDER_NAV: FounderNavItem[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, description: "Today, health & activity" },
  { id: "workspace", label: "Workspace", icon: Workflow, description: "Interactive startup canvas" },
  { id: "validator", label: "Validator", icon: Shield, description: "Deep AI validation report" },
  { id: "competitors", label: "Competitors", icon: Swords, description: "Beat-them playbook" },
  { id: "customers", label: "Customers", icon: Users, description: "Personas & segments" },
  { id: "roadmap", label: "Roadmap", icon: Map, description: "Sequence map & progress" },
  { id: "finance", label: "Finance", icon: DollarSign, description: "Budget, tools & runway" },
  { id: "habits", label: "Daily Habits", icon: Flame, description: "Habits, planner & notes" },
  { id: "calendar", label: "Calendar", icon: Calendar, description: "Appointments & deadlines" },
  { id: "team", label: "Team", icon: UserPlus, description: "Collaborate with your team" },
  { id: "pitch", label: "Investor Export", icon: Target, description: "PDF reports & one-pager" },
  { id: "ceo-review", label: "CEO Review", icon: ClipboardList, description: "Weekly founder ritual" },
  { id: "documents", label: "Documents", icon: FileText, description: "Plans & decks" },
  { id: "chat", label: "AI Chat", icon: MessageSquare, description: "Founder coach" },
  { id: "settings", label: "Settings", icon: Settings, description: "Company settings" },
];

export function companyModuleHref(companyId: string, module: FounderModuleId) {
  return `/company/${companyId}?module=${module}`;
}
