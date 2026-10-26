const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

export type RedisCommand = string[];

export function isAnalyticsConfigured() {
  return Boolean(redisUrl && redisToken);
}

export async function runRedisCommands(commands: RedisCommand[]) {
  if (!redisUrl || !redisToken) {
    throw new Error("Page analytics is not configured.");
  }

  const response = await fetch(redisUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${redisToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(commands.length === 1 ? commands[0] : commands),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Analytics storage returned ${response.status}.`);
  }

  const payload = await response.json();
  if (Array.isArray(payload)) {
    const failed = payload.find((item) => item?.error);
    if (failed) throw new Error("Analytics storage command failed.");
    return payload.map((item) => item?.result);
  }
  if (payload?.error) throw new Error("Analytics storage command failed.");
  return [payload?.result];
}

export function pageKey(path: string) {
  const encodedPath = Buffer.from(path).toString("base64url");
  return `pageviews:${encodedPath}`;
}

export function dayKey(day: string) {
  return day.replaceAll("-", "");
}

export function utcDay(date = new Date()) {
  return date.toISOString().slice(0, 10);
}
