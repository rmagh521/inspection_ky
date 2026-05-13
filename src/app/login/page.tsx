"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

function LoginForm() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get("from") || "/dashboard";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(false);

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    if (res.ok) {
      router.push(from);
      router.refresh();
    } else {
      setError(true);
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        type="password"
        placeholder="비밀번호"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        autoFocus
      />
      {error && (
        <p className="text-sm text-red-500">
          비밀번호가 올바르지 않습니다.
        </p>
      )}
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "확인 중..." : "접속"}
      </Button>
    </form>
  );
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-lg">Inspection Dashboard</CardTitle>
          <p className="text-sm text-muted-foreground">
            접속 비밀번호를 입력해주세요
          </p>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<div className="h-24 animate-pulse bg-muted rounded" />}>
            <LoginForm />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}
