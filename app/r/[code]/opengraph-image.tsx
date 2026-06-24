import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const runtime = "nodejs";
export const alt = "ScribeZero — a medical record verified on 0G";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const jade = "#84c4a0";
const cream = "#f5efe2";
const dim = "#6e6d66";

function Dot() {
  return <div style={{ display: "flex", width: 14, height: 14, borderRadius: 7, background: jade }} />;
}

// Branded share card for unresolved share links. Real share records require a 0G KV index entry.
export default async function Image() {
  const logo = await readFile(join(process.cwd(), "public/brand/scribe-zero-icon-192.png"));
  const logoSrc = `data:image/png;base64,${logo.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#0e0f0d",
          padding: "64px 72px",
          fontFamily: "Georgia, serif",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <img
              src={logoSrc}
              alt=""
              width={58}
              height={58}
              style={{ borderRadius: 12, display: "flex" }}
            />
            <div style={{ display: "flex", fontSize: 42, color: cream }}>ScribeZero</div>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              border: `1px solid ${jade}66`,
              background: "rgba(132,196,160,0.12)",
              color: jade,
              borderRadius: 999,
              padding: "12px 24px",
              fontSize: 24,
            }}
          >
            <Dot />
            <div style={{ display: "flex" }}>0G root required</div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ display: "flex", fontSize: 28, color: dim, letterSpacing: 2 }}>Encrypted medical records on 0G</div>
          <div style={{ display: "flex", fontSize: 68, fontStyle: "italic", color: cream, lineHeight: 1.05 }}>
            Verify the Storage root.
          </div>
          <div style={{ display: "flex", fontSize: 30, color: "#a9a89e", maxWidth: 920 }}>
            A medical record generated in 0G Compute and owned by you on 0G Storage. Verifiable by
            anyone, readable by no one but you.
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <div style={{ display: "flex", gap: 28, fontSize: 24, color: jade }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Dot />
              <div style={{ display: "flex" }}>TEE inference</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Dot />
              <div style={{ display: "flex" }}>0G Storage</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Dot />
              <div style={{ display: "flex" }}>hash unchanged</div>
            </div>
          </div>
          <div style={{ display: "flex", fontSize: 24, color: dim }}>root required</div>
        </div>
      </div>
    ),
    { ...size },
  );
}
