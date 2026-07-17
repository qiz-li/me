import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";

// Streams a private S3 object inline. Not reachable directly — proxy.ts blocks
// external requests to this path and only rewrites the configured slug here, so
// the object's location never leaves the server and the browser URL is unchanged.
export const dynamic = "force-dynamic";

export async function GET() {
  const bucket = process.env.FILE_S3_BUCKET;
  const key = process.env.FILE_S3_KEY;
  const region = process.env.FILE_S3_REGION;

  if (!bucket || !key || !region) {
    return new Response("Not configured", { status: 500 });
  }

  // In production the SDK picks up temporary credentials from the compute
  // role (no static keys). For local dev, set FILE_AWS_* in .env.local.
  const accessKeyId = process.env.FILE_AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.FILE_AWS_SECRET_ACCESS_KEY;
  const client = new S3Client({
    region,
    ...(accessKeyId && secretAccessKey
      ? { credentials: { accessKeyId, secretAccessKey } }
      : {}),
  });

  const obj = await client.send(
    new GetObjectCommand({ Bucket: bucket, Key: key }),
  );
  if (!obj.Body) {
    return new Response("Not Found", { status: 404 });
  }

  const downloadName = process.env.FILE_DOWNLOAD_NAME;
  return new Response(obj.Body.transformToWebStream(), {
    headers: {
      "Content-Type": "application/pdf",
      // Open in the browser rather than force a download.
      "Content-Disposition": downloadName
        ? `inline; filename="${downloadName}"`
        : "inline",
      "Cache-Control": "no-store",
      "X-Robots-Tag": "noindex",
    },
  });
}
