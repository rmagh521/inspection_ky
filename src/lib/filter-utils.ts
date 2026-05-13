export function filterByField<T>(
  data: T[],
  key: keyof T,
  value: string
): T[] {
  if (!value) return data;
  return data.filter((item) => String(item[key]) === value);
}

export function filterByIncludes<T>(
  data: T[],
  key: keyof T,
  value: string
): T[] {
  if (!value) return data;
  return data.filter((item) => {
    const arr = item[key];
    if (Array.isArray(arr)) return arr.includes(value);
    return String(arr) === value;
  });
}

export function getUniqueValues<T>(data: T[], key: keyof T): string[] {
  const set = new Set<string>();
  for (const item of data) {
    const val = item[key];
    if (val != null && val !== "") set.add(String(val));
  }
  return [...set].sort();
}

export function getUniqueArrayValues<T>(data: T[], key: keyof T): string[] {
  const set = new Set<string>();
  for (const item of data) {
    const arr = item[key];
    if (Array.isArray(arr)) {
      for (const v of arr) {
        if (v) set.add(String(v));
      }
    }
  }
  return [...set].sort();
}
