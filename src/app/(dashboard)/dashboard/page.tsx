import { getDashboardStats, getProducts } from "@/lib/xlsx-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Cpu,
  Search,
  Wrench,
  Layers,
  BarChart3,
  Map,
} from "lucide-react";
import Link from "next/link";
import { DashboardClient } from "./dashboard-client";

const kpiCards = [
  { key: "products", label: "제품군", icon: Cpu, color: "text-blue-600", href: "/products" },
  { key: "inspectionPoints", label: "검사 포인트", icon: Search, color: "text-green-600", href: "/inspection-points" },
  { key: "equipmentModels", label: "장비 모델", icon: Wrench, color: "text-orange-600", href: "/equipment" },
  { key: "technologies", label: "핵심 기술", icon: Layers, color: "text-purple-600", href: "/technologies" },
  { key: "developmentProjects", label: "개발 프로젝트", icon: BarChart3, color: "text-red-600", href: "/roadmap" },
  { key: "kyProducts", label: "KY 제품", icon: Map, color: "text-teal-600", href: "/ky-analysis" },
] as const;

export default async function DashboardPage() {
  const stats = await getDashboardStats();
  const products = await getProducts();

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
        {kpiCards.map((card) => {
          const Icon = card.icon;
          const value = stats.kpis[card.key];
          return (
            <Link key={card.key} href={card.href}>
              <Card className="transition-colors hover:bg-accent cursor-pointer">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-xs font-medium text-muted-foreground">
                    {card.label}
                  </CardTitle>
                  <Icon className={`h-4 w-4 ${card.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{value}</div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      <DashboardClient stats={stats} products={products} />
    </div>
  );
}
