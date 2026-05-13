"use client";

import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { useCallback, useMemo } from "react";

export function useFilterParams<T extends Record<string, string>>(
  defaults: T
) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const filters = useMemo(() => {
    const result = { ...defaults };
    for (const key of Object.keys(defaults)) {
      result[key as keyof T] = (searchParams.get(key) ?? defaults[key]) as T[keyof T];
    }
    return result;
  }, [searchParams, defaults]);

  const setFilter = useCallback(
    (key: keyof T, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value && value !== defaults[key]) {
        params.set(key as string, value);
      } else {
        params.delete(key as string);
      }
      const qs = params.toString();
      router.replace(pathname + (qs ? `?${qs}` : ""), { scroll: false });
    },
    [searchParams, pathname, router, defaults]
  );

  const clearFilters = useCallback(() => {
    router.replace(pathname, { scroll: false });
  }, [pathname, router]);

  const hasActiveFilters = useMemo(
    () => Object.keys(defaults).some((key) => searchParams.has(key)),
    [searchParams, defaults]
  );

  return { filters, setFilter, clearFilters, hasActiveFilters };
}
