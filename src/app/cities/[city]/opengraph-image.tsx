import { ImageResponse } from "next/og";
import { getLicensesByCity } from "@/db/queries";

export const runtime = "edge";
export const alt = "City Liquor Licenses — BarBook Texas";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({
  params,
}: {
  params: Promise<{ city: string }>;
}): Promise<ImageResponse> {
  const { city } = await params;
  const cityName = decodeURIComponent(city)
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

  let count = 0;
  try {
    const { total } = await getLicensesByCity(cityName, 1);
    count = total;
  } catch {
    // fallback to 0
  }

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
            fontSize: 56,
            fontWeight: 800,
            color: "#ffffff",
          }}
        >
          {cityName}, TX
        </div>
        <div
          style={{
            fontSize: 28,
            color: "#d6d3d1",
            marginTop: 16,
          }}
        >
          {count.toLocaleString()} Liquor Licenses
        </div>
      </div>
    ),
    { ...size }
  );
}
