export function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

export function getRangeDates(range, customStart, customEnd) {
  const now = new Date();
  const start = new Date(now);
  const end = new Date(now);
  start.setHours(0, 0, 0, 0);
  end.setHours(23, 59, 59, 999);

  if (range === "week") {
    const day = start.getDay() || 7;
    start.setDate(start.getDate() - day + 1);
  }
  if (range === "month") start.setDate(1);
  if (range === "year") start.setMonth(0, 1);
  if (range === "custom") {
    if (customStart) start.setTime(new Date(`${customStart}T00:00:00`).getTime());
    if (customEnd) end.setTime(new Date(`${customEnd}T23:59:59`).getTime());
  }

  return { start, end };
}

export function transactionMatchesRange(transaction, range, customStart, customEnd) {
  const date = new Date(`${transaction.date}T00:00:00`);
  const { start, end } = getRangeDates(range, customStart, customEnd);
  return date >= start && date <= end;
}

export function makeTrendBuckets(range) {
  const buckets = {};
  const now = new Date();
  const count = range === "year" ? 12 : 7;

  for (let index = count - 1; index >= 0; index -= 1) {
    const date = new Date(now);
    if (range === "year") date.setMonth(now.getMonth() - index, 1);
    else date.setDate(now.getDate() - index);

    const key = range === "year" ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}` : date.toISOString().slice(0, 10);
    const label = range === "year" ? `${date.getMonth() + 1}月` : `${date.getMonth() + 1}/${date.getDate()}`;
    buckets[key] = { label, income: 0, expense: 0 };
  }

  return buckets;
}
