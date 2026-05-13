import {
  LayoutDashboard,
  Cpu,
  Search,
  Wrench,
  Layers,
  BarChart3,
  Map,
  FileText,
  Settings,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  children?: { title: string; href: string }[];
}

export const navItems: NavItem[] = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { title: "Products", href: "/products", icon: Cpu },
  { title: "Inspection Points", href: "/inspection-points", icon: Search },
  {
    title: "Equipment",
    href: "/equipment",
    icon: Wrench,
    children: [
      { title: "Comparison Matrix", href: "/equipment" },
      { title: "Makers", href: "/equipment/makers" },
    ],
  },
  { title: "Technologies", href: "/technologies", icon: Layers },
  { title: "KY Analysis", href: "/ky-analysis", icon: BarChart3 },
  { title: "Roadmap", href: "/roadmap", icon: Map },
  { title: "Reports", href: "/reports", icon: FileText },
  { title: "Admin", href: "/admin", icon: Settings },
];
