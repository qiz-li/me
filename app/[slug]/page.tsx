import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { notFound, redirect } from "next/navigation";

export const dynamic = "force-dynamic";

const EXPIRES_IN = 300; // 5 minutes

export default async function FilePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const expected = process.env.FILE_SLUG;
  const bucket = process.env.FILE_S3_BUCKET;
  const key = process.env.FILE_S3_KEY;
  const region = process.env.FILE_S3_REGION;

  // Wrong slug (or missing config) renders the normal 404 — indistinguishable
  // from any other unknown path.
  if (!expected || slug !== expected || !bucket || !key || !region) {
    notFound();
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

  redirect(url);
}
