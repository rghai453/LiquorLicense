import { ImageResponse } from "next/og";
import { getLicenseBySlug } from "@/db/queries";

export const runtime = "edge";
export const alt = "License Details — BarBook Texas";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<ImageResponse> {
  const { slug } = await params;
  const license = await getLicenseBySlug(slug);

  const name = license?.businessName ?? "License Detail";
  const type = license?.licenseType ?? "";
  const city = license?.city ? `${license.city}, TX` : "Texas";

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
          padding: 60,
        }}
      >
        <div
          style={{
            fontSize: 24,
            color: "#fbbf24",
            fontWeight: 700,
            marginBottom: 24,
          }}
        >
          BarBook Texas
        </div>
        <div
          style={{
            fontSize: 48,
            fontWeight: 800,
            color: "#ffffff",
            textAlign: "center",
            maxWidth: 900,
            lineClamp: 2,
            overflow: "hidden",
          }}
        >
          {name}
        </div>
        <div
          style={{
            display: "flex",
            gap: 16,
            marginTop: 24,
            alignItems: "center",
          }}
        >
          {type && (
            <div
              style={{
                background: "#fbbf24",
                color: "#3d1f0a",
                padding: "8px 20px",
                borderRadius: 8,
                fontSize: 20,
                fontWeight: 700,
              }}
            >
              {type}
            </div>
          )}
          <div style={{ fontSize: 22, color: "#d6d3d1" }}>{city}</div>
        </div>
      </div>
    ),
    { ...size }
  );
}
