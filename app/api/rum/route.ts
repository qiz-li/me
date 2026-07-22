// Receives a one-shot navigation-timing beacon from the layout's inline
// script and echoes it into the compute log, which lands in CloudWatch
// (/aws/amplify/<app-id>). No storage of its own — filter the log group for
// "RUM" to read real-visitor timings.
export const dynamic = "force-dynamic";

const NUMBER_FIELDS = [
  "dns",
  "tcp",
  "tls",
  "ttfb",
  "dcl",
  "load",
  "transfer",
] as const;
const STRING_FIELDS = ["proto", "type", "path", "ua"] as const;

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return new Response(null, { status: 400 });
  }

  // Clamp to a day in ms so a garbage payload can't flood the log.
  const num = (v: unknown) => {
    const n = Number(v);
    return Number.isFinite(n) ? Math.min(Math.max(n, 0), 86_400_000) : -1;
  };

  const record: Record<string, unknown> = {};
  for (const f of NUMBER_FIELDS) {
    record[f] = num(body[f]);
  }
  for (const f of STRING_FIELDS) {
    record[f] = String(body[f] ?? "").slice(0, 120);
  }

  // Slow loads attach their worst subresources: path, start, duration,
  // protocol, transfer bytes.
  if (Array.isArray(body.slow)) {
    record.slow = body.slow.slice(0, 5).map((e) => {
      const item = (e ?? {}) as Record<string, unknown>;
      return {
        p: String(item.p ?? "").slice(0, 120),
        s: num(item.s),
        d: num(item.d),
        pr: String(item.pr ?? "").slice(0, 20),
        b: num(item.b),
      };
    });
  }

  console.log("RUM", JSON.stringify(record));
  return new Response(null, { status: 204 });
}
