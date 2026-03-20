import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "BarBook Texas — Texas Liquor License Intelligence";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image(): ImageResponse {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#3d1f0a",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            fontSize: 72,
            fontWeight: 800,
            color: "#fbbf24",
            letterSpacing: "-0.02em",
          }}
        >
          BarBook Texas
        </div>
        <div
          style={{
            fontSize: 28,
            color: "#d6d3d1",
            marginTop: 16,
          }}
        >
          Texas Liquor License Intelligence
        </div>
      </div>
    ),
    { ...size }
  );
}
