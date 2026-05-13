import { getDashboardStats } from "@/lib/xlsx-data";
import { NextResponse } from "next/server";

export async function GET() {
  const stats = await getDashboardStats();
  return NextResponse.json(stats);
}
