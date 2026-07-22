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

  const record: Record<string, number | string> = {};
  for (const f of NUMBER_FIELDS) {
    const v = Number(body[f]);
    // Clamp to a day in ms so a garbage payload can't flood the log.
    record[f] = Number.isFinite(v) ? Math.min(Math.max(v, 0), 86_400_000) : -1;
  }
  for (const f of STRING_FIELDS) {
    record[f] = String(body[f] ?? "").slice(0, 120);
  }

  console.log("RUM", JSON.stringify(record));
  return new Response(null, { status: 204 });
}
