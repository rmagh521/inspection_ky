"use client";

import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PrintButton() {
  return (
    <Button
      variant="outline"
      size="sm"
      className="print:hidden"
      onClick={() => window.print()}
    >
      <Printer className="mr-1 h-4 w-4" />
      인쇄 / PDF 저장
    </Button>
  );
}
