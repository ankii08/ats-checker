const bucket = new Map<string, { count: number; ts: number }>();
const WINDOW_MS = 60_000; // 1 min
const MAX = 10;           // 10 requests/min per IP

export const ratelimit = {
  check(ip: string) {
    const now = Date.now();
    const rec = bucket.get(ip) ?? { count: 0, ts: now };
    if (now - rec.ts > WINDOW_MS) {
      rec.count = 0; rec.ts = now;
    }
    rec.count++;
    bucket.set(ip, rec);
    return rec.count <= MAX;
  },
};
