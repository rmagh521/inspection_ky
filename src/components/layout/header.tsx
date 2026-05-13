"use client";

import { usePathname } from "next/navigation";
import { navItems } from "./nav-links";

function getPageTitle(pathname: string): string {
  for (const item of navItems) {
    if (pathname === item.href || pathname.startsWith(item.href + "/")) {
      return item.title;
    }
  }
  return "Dashboard";
}

export function Header() {
  const pathname = usePathname();
  const title = getPageTitle(pathname);

  return (
    <header className="flex h-14 items-center border-b bg-card px-6">
      <h1 className="text-lg font-semibold">{title}</h1>
      <div className="ml-auto flex items-center gap-4">
        <span className="text-sm text-muted-foreground">
          Semiconductor Inspection Analysis
        </span>
      </div>
    </header>
  );
}
