import { ImageResponse } from "next/og";

// Same accent square as app/icon.svg; iOS rounds the corners itself.
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    <div style={{ width: "100%", height: "100%", background: "#8b2942" }} />,
    size,
  );
}
