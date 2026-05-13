"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { navItems } from "./nav-links";
import { ChevronLeft } from "lucide-react";
import { useState } from "react";

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "flex flex-col border-r bg-card transition-all duration-200",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex h-14 items-center border-b px-4">
        {!collapsed && (
          <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
            <Cpu className="h-5 w-5 text-primary" />
            <span className="text-sm">Inspection Dashboard</span>
          </Link>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            "ml-auto rounded-md p-1 hover:bg-accent",
            collapsed && "mx-auto"
          )}
        >
          <ChevronLeft
            className={cn("h-4 w-4 transition-transform", collapsed && "rotate-180")}
          />
        </button>
      </div>
      <nav className="flex-1 overflow-y-auto p-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;
          return (
            <div key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                  isActive
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {!collapsed && <span>{item.title}</span>}
              </Link>
              {!collapsed && isActive && item.children && (
                <div className="ml-7 mt-1 space-y-1">
                  {item.children.map((child) => (
                    <Link
                      key={child.href}
                      href={child.href}
                      className={cn(
                        "block rounded-md px-3 py-1.5 text-xs transition-colors",
                        pathname === child.href
                          ? "text-primary font-medium"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {child.title}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>
      {!collapsed && (
        <div className="border-t p-4">
          <p className="text-xs text-muted-foreground">Koh Young Technology</p>
          <p className="text-xs text-muted-foreground">Optical Inspection Analysis</p>
        </div>
      )}
    </aside>
  );
}

function Cpu(props: React.ComponentProps<"svg">) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect width="16" height="16" x="4" y="4" rx="2"/><rect width="6" height="6" x="9" y="9" rx="1"/><path d="M15 2v2"/><path d="M15 20v2"/><path d="M2 15h2"/><path d="M2 9h2"/><path d="M20 15h2"/><path d="M20 9h2"/><path d="M9 2v2"/><path d="M9 20v2"/></svg>
  );
}
