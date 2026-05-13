"use client";

import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  type SortingState,
  type VisibilityState,
  useReactTable,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState, useCallback } from "react";
import { ArrowUpDown, Download, Columns3 } from "lucide-react";
import { DataTablePagination } from "./data-table-pagination";
import { cn } from "@/lib/utils";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  searchPlaceholder?: string;
  onRowClick?: (row: TData) => void;
  exportFilename?: string;
  showColumnVisibility?: boolean;
  pageSize?: number;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  searchPlaceholder = "검색...",
  onRowClick,
  exportFilename,
  showColumnVisibility = false,
  pageSize = 20,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onColumnVisibilityChange: setColumnVisibility,
    state: { sorting, globalFilter, columnVisibility },
    initialState: { pagination: { pageSize } },
  });

  const handleExportCSV = useCallback(() => {
    const rows = table.getFilteredRowModel().rows;
    const headers = table
      .getVisibleFlatColumns()
      .filter((c) => c.id !== "actions")
      .map((c) => {
        const header = c.columnDef.header;
        return typeof header === "string" ? header : c.id;
      });

    const csvRows = rows.map((row) =>
      table
        .getVisibleFlatColumns()
        .filter((c) => c.id !== "actions")
        .map((col) => {
          const val = row.getValue(col.id);
          const str = String(val ?? "");
          return str.includes(",") || str.includes('"')
            ? `"${str.replace(/"/g, '""')}"`
            : str;
        })
        .join(",")
    );

    const bom = "﻿";
    const csv = bom + [headers.join(","), ...csvRows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${exportFilename ?? "export"}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [table, exportFilename]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <Input
          placeholder={searchPlaceholder}
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          className="max-w-sm h-8 text-xs"
        />
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground shrink-0">
            {table.getFilteredRowModel().rows.length}개
          </span>
          {showColumnVisibility && (
            <DropdownMenu>
              <DropdownMenuTrigger
                render={<Button variant="outline" size="sm" className="h-8 text-xs" />}
              >
                <Columns3 className="mr-1 h-3 w-3" />
                컬럼
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {table
                  .getAllColumns()
                  .filter((col) => col.getCanHide())
                  .map((col) => (
                    <DropdownMenuCheckboxItem
                      key={col.id}
                      checked={col.getIsVisible()}
                      onCheckedChange={(v) => col.toggleVisibility(!!v)}
                      className="text-xs"
                    >
                      {typeof col.columnDef.header === "string"
                        ? col.columnDef.header
                        : col.id}
                    </DropdownMenuCheckboxItem>
                  ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          {exportFilename && (
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs"
              onClick={handleExportCSV}
            >
              <Download className="mr-1 h-3 w-3" />
              CSV
            </Button>
          )}
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder ? null : header.column.getCanSort() ? (
                      <button
                        className="flex items-center gap-1 hover:text-foreground"
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        <ArrowUpDown className="h-3 w-3" />
                      </button>
                    ) : (
                      flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className={cn(onRowClick && "cursor-pointer hover:bg-accent")}
                  onClick={() => onRowClick?.(row.original)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  데이터가 없습니다.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {table.getPageCount() > 1 && <DataTablePagination table={table} />}
    </div>
  );
}
