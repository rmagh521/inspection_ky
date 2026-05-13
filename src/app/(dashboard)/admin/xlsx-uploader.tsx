"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function XlsxUploader() {
  const [status, setStatus] = useState<"idle" | "uploading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [fileName, setFileName] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleUpload() {
    const file = inputRef.current?.files?.[0];
    if (!file) return;

    setStatus("uploading");
    setMessage("");

    const form = new FormData();
    form.append("file", file);

    try {
      const res = await fetch("/api/upload-xlsx", { method: "POST", body: form });
      const data = await res.json();

      if (res.ok) {
        setStatus("success");
        setMessage(`${data.message} (백업: ${data.backup})`);
        if (inputRef.current) inputRef.current.value = "";
        setFileName("");
        setTimeout(() => window.location.reload(), 1500);
      } else {
        setStatus("error");
        setMessage(data.error || "업로드 실패");
      }
    } catch {
      setStatus("error");
      setMessage("네트워크 오류");
    }
  }

  function handleFileChange() {
    const file = inputRef.current?.files?.[0];
    setFileName(file?.name ?? "");
    setStatus("idle");
    setMessage("");
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">
        새 XLSX 파일을 업로드하면 기존 파일은 자동 백업됩니다.
        필수 시트(10개)가 모두 포함되어야 합니다.
      </p>
      <div className="flex items-center gap-3">
        <input
          ref={inputRef}
          type="file"
          accept=".xlsx"
          onChange={handleFileChange}
          className="text-sm file:mr-3 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-primary-foreground hover:file:bg-primary/90 cursor-pointer"
        />
        <Button
          size="sm"
          onClick={handleUpload}
          disabled={!fileName || status === "uploading"}
        >
          {status === "uploading" ? "업로드 중..." : "업로드"}
        </Button>
      </div>
      {message && (
        <div className="flex items-center gap-2">
          <Badge variant={status === "success" ? "default" : "destructive"} className="text-xs">
            {status === "success" ? "성공" : "오류"}
          </Badge>
          <span className="text-xs">{message}</span>
        </div>
      )}
    </div>
  );
}
