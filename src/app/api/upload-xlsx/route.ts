import { NextResponse } from "next/server";
import { invalidateCache, validateXlsx } from "@/lib/xlsx-data";

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "파일이 없습니다" }, { status: 400 });
  }

  if (!file.name.endsWith(".xlsx")) {
    return NextResponse.json(
      { error: "XLSX 파일만 업로드 가능합니다" },
      { status: 400 }
    );
  }

  const arrayBuffer = await file.arrayBuffer();
  const { valid, missing } = validateXlsx(arrayBuffer);
  if (!valid) {
    return NextResponse.json(
      { error: `필수 시트 누락: ${missing.join(", ")}` },
      { status: 400 }
    );
  }

  const fs = require("node:fs") as typeof import("fs");
  const path = require("node:path") as typeof import("path");
  const xlsxPath = path.join(process.cwd(), "data", "inspection-data.xlsx");
  const backupPath = path.join(
    process.cwd(),
    "data",
    `inspection-data.backup-${Date.now()}.xlsx`
  );

  if (fs.existsSync(xlsxPath)) {
    fs.copyFileSync(xlsxPath, backupPath);
  }

  fs.writeFileSync(xlsxPath, Buffer.from(arrayBuffer));

  invalidateCache();

  return NextResponse.json({
    ok: true,
    message: "XLSX 업로드 완료",
    size: arrayBuffer.byteLength,
  });
}
