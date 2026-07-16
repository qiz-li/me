import { ImageResponse } from "next/og";

// Link previews (og:image / twitter:image): the same accent square as the
// site icon, scaled up.
export const alt = "the Nathan li";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    <div style={{ width: "100%", height: "100%", background: "#8b2942" }} />,
    size,
  );
}
