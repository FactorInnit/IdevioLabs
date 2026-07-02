import {
  Flame,
  Calendar,
  CheckSquare,
  DollarSign,
  FileText,
  Globe,
  LayoutDashboard,
  Map,
  MessageSquare,
  Settings,
  Shield,
  Swords,
  Target,
  Users,
  Workflow,
  type LucideIcon,
} from "lucide-react";

export type FounderModuleId =
  | "dashboard"
  | "workspace"
  | "validator"
  | "market"
  | "competitors"
  | "customers"
  | "roadmap"
  | "finance"
  | "pitch"
  | "documents"
  | "tasks"
  | "habits"
  | "calendar"
  | "chat"
  | "settings";

export interface FounderNavItem {
  id: FounderModuleId;
  label: string;
  icon: LucideIcon;
  description: string;
}

export const FOUNDER_NAV: FounderNavItem[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, description: "CEO command center" },
  { id: "workspace", label: "Workspace", icon: Workflow, description: "Company digital twin canvas" },
  { id: "validator", label: "Validator", icon: Shield, description: "Startup readiness scores" },
  { id: "market", label: "Market", icon: Globe, description: "TAM, SAM, SOM research" },
  { id: "competitors", label: "Competitors", icon: Swords, description: "Competitive intelligence" },
  { id: "customers", label: "Customers", icon: Users, description: "Personas & segments" },
  { id: "roadmap", label: "Roadmap", icon: Map, description: "Execution kanban & phases" },
  { id: "finance", label: "Finance", icon: DollarSign, description: "Budget, tools & runway" },
  { id: "habits", label: "Daily Habits", icon: Flame, description: "Founder habit tracker" },
  { id: "pitch", label: "Pitch Deck", icon: Target, description: "Fundraising readiness" },
  { id: "documents", label: "Documents", icon: FileText, description: "Plans & decks" },
  { id: "tasks", label: "Tasks", icon: CheckSquare, description: "Now / Next / Later" },
  { id: "calendar", label: "Calendar", icon: Calendar, description: "Launch timeline" },
  { id: "chat", label: "AI Chat", icon: MessageSquare, description: "Founder coach" },
  { id: "settings", label: "Settings", icon: Settings, description: "Company settings" },
];

export const CANVAS_MODULES = [
  "Business Model",
  "Customer Personas",
  "Revenue",
  "Competitors",
  "MVP",
  "Tech Stack",
  "Hiring",
  "Marketing",
  "Fundraising",
  "Execution",
] as const;

export function companyModuleHref(companyId: string, module: FounderModuleId) {
  return `/company/${companyId}?module=${module}`;
}
