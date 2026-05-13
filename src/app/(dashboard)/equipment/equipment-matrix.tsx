"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface EquipmentMatrixProps {
  data: Record<string, string | number | string[]>[];
  makers: string[];
}

export function EquipmentMatrix({ data, makers }: EquipmentMatrixProps) {
  const [openCell, setOpenCell] = useState<string | null>(null);

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="sticky left-0 bg-card z-10 min-w-[160px]">
              검사 유형
            </TableHead>
            {makers.map((maker) => (
              <TableHead key={maker} className="text-center min-w-[80px] text-xs">
                {maker}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row) => (
            <TableRow key={row.type as string}>
              <TableCell className="sticky left-0 bg-card z-10 font-medium text-xs">
                {row.typeLabel as string}
              </TableCell>
              {makers.map((maker) => {
                const count = row[maker] as number;
                const modelNames = (row[`${maker}__models`] as string[]) ?? [];
                const cellKey = `${row.type}::${maker}`;

                if (count === 0) {
                  return (
                    <TableCell key={maker} className="text-center">
                      <span className="inline-flex h-6 w-6 items-center justify-center rounded text-xs font-medium text-muted-foreground/30">
                        -
                      </span>
                    </TableCell>
                  );
                }

                return (
                  <TableCell key={maker} className="text-center">
                    <Popover
                      open={openCell === cellKey}
                      onOpenChange={(open) => setOpenCell(open ? cellKey : null)}
                    >
                      <PopoverTrigger>
                        <span
                          className={cn(
                            "inline-flex h-6 w-6 items-center justify-center rounded text-xs font-medium cursor-pointer transition-colors",
                            "bg-primary/10 text-primary hover:bg-primary/20"
                          )}
                        >
                          {count}
                        </span>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-3">
                        <div className="space-y-1">
                          <p className="text-xs font-medium text-muted-foreground">
                            {maker} — {row.typeLabel as string}
                          </p>
                          {modelNames.map((name) => (
                            <p key={name} className="text-sm">{name}</p>
                          ))}
                        </div>
                      </PopoverContent>
                    </Popover>
                  </TableCell>
                );
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
