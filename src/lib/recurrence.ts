export type RecurringTaskInput = {
  id: string;
  title: string;
  priority: string;
  frequency: string;
  durationDays: number;
  startingFrom: Date | string;
  endsAt: Date | string | null;
  project: { id: string; name: string; colorLabel: string | null };
};

export type RecurringOccurrence = {
  id: string;
  recurringTaskId: string;
  title: string;
  priority: string;
  status: "TODO";
  startDate: Date;
  dueDate: Date;
  project: { id: string; name: string; colorLabel: string | null };
  isRecurring: true;
};

const APPROX_INTERVAL: Record<string, number> = {
  DAILY: 1,
  WEEKLY: 7,
  BIWEEKLY: 14,
  MONTHLY: 30,
};

function advance(d: Date, frequency: string): void {
  switch (frequency) {
    case "DAILY":    d.setDate(d.getDate() + 1); break;
    case "WEEKLY":   d.setDate(d.getDate() + 7); break;
    case "BIWEEKLY": d.setDate(d.getDate() + 14); break;
    case "MONTHLY":  d.setMonth(d.getMonth() + 1); break;
  }
}

export function computeOccurrences(
  task: RecurringTaskInput,
  windowStart: Date,
  windowEnd: Date,
): RecurringOccurrence[] {
  const { frequency, durationDays } = task;
  const startingFrom = new Date(task.startingFrom);
  const endsAt = task.endsAt ? new Date(task.endsAt) : null;
  const effectiveEnd = endsAt && endsAt < windowEnd ? endsAt : windowEnd;

  const results: RecurringOccurrence[] = [];
  let current = new Date(startingFrom);

  // Fast-forward to near the window start
  if (current < windowStart) {
    const approxInterval = APPROX_INTERVAL[frequency] ?? 1;
    const daysGap = (windowStart.getTime() - current.getTime()) / 86400000;
    const steps = Math.max(0, Math.floor(daysGap / approxInterval) - 1);
    if (frequency === "MONTHLY") {
      current.setMonth(current.getMonth() + steps);
    } else {
      current.setDate(current.getDate() + steps * approxInterval);
    }
  }

  let safety = 0;
  while (current <= effectiveEnd && safety < 200) {
    safety++;
    const occStart = new Date(current);

    if (occStart >= windowStart) {
      const occEnd = new Date(current);
      occEnd.setDate(occEnd.getDate() + Math.max(0, durationDays - 1));

      results.push({
        id: `r-${task.id}-${occStart.getTime()}`,
        recurringTaskId: task.id,
        title: task.title,
        priority: task.priority,
        status: "TODO",
        startDate: occStart,
        dueDate: occEnd,
        project: task.project,
        isRecurring: true,
      });
    }

    advance(current, frequency);
  }

  return results;
}
