import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// Serves file from S3 at an env-configured slug.
export const dynamic = "force-dynamic";
export const revalidate = 0;

const EXPIRES_IN = 300; // 5 minutes

export async function GET(_req: Request, ctx: RouteContext<"/[slug]">) {
  const { slug } = await ctx.params;

  const expected = process.env.FILE_SLUG;
  // A wrong (or unconfigured) slug looks like any other unknown path: a bare
  // 404 that reveals nothing about what lives here.
  if (!expected || slug !== expected) {
    return new Response("Not Found", { status: 404 });
  }

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

  const downloadName = process.env.FILE_DOWNLOAD_NAME;
  const url = await getSignedUrl(
    client,
    new GetObjectCommand({
      Bucket: bucket,
      Key: key,
      // Open in the browser rather than force a download.
      ResponseContentDisposition: downloadName
        ? `inline; filename="${downloadName}"`
        : "inline",
      ResponseContentType: "application/pdf",
    }),
    { expiresIn: EXPIRES_IN },
  );

  return new Response(null, {
    status: 307,
    headers: {
      Location: url,
      // Never let a CDN cache the redirect — the presigned URL expires.
      "Cache-Control": "no-store",
      "X-Robots-Tag": "noindex",
    },
  });
}
