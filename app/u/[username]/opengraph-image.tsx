import { ImageResponse } from "next/og";
import { lookupProfile } from "@/lib/profile/lookup";

export const alt = "Coded public developer profile";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

function reportedCount(value: number | null) {
  return value === null ? "—" : value.toLocaleString("en-GB");
}

export default async function ProfileOpenGraphImage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const result = await lookupProfile(username);
  const profile = result.kind === "success" ? result.profile : null;
  const handle = profile?.username ?? username.slice(0, 39);
  const name = profile?.displayName || handle;
  const biography =
    profile?.biography ||
    "A clear snapshot of public GitHub work, repositories and languages.";
  const counts = [
    ["Public repositories", profile?.counts.publicRepositories ?? null],
    ["Followers", profile?.counts.followers ?? null],
    ["Following", profile?.counts.following ?? null],
  ] as const;

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: "#111315",
        color: "#f3f4f1",
        padding: "48px 56px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid rgba(255,255,255,0.16)",
          paddingBottom: 24,
        }}
      >
        <div style={{ display: "flex", fontSize: 30, fontWeight: 700 }}>
          coded<span style={{ color: "#d3ef8b" }}>.</span>
        </div>
        <div
          style={{
            display: "flex",
            color: "#d3ef8b",
            fontSize: 16,
            letterSpacing: 4,
            textTransform: "uppercase",
          }}
        >
          A public snapshot
        </div>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          flex: 1,
          justifyContent: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: 22,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: 70,
              fontWeight: 700,
              letterSpacing: -3,
              whiteSpace: "nowrap",
              textOverflow: "ellipsis",
              overflow: "hidden",
              maxWidth: 780,
            }}
          >
            {name}
          </div>
          <div style={{ display: "flex", color: "#d3ef8b", fontSize: 28 }}>
            @{handle}
          </div>
        </div>
        <div
          style={{
            display: "flex",
            color: "#b9beb6",
            fontSize: 27,
            lineHeight: 1.35,
            marginTop: 22,
            maxWidth: 950,
            maxHeight: 74,
            overflow: "hidden",
          }}
        >
          {biography}
        </div>
      </div>

      <div style={{ display: "flex", gap: 16 }}>
        {counts.map(([label, value]) => (
          <div
            key={label}
            style={{
              display: "flex",
              flexDirection: "column",
              flex: 1,
              border: "1px solid rgba(255,255,255,0.16)",
              background: "rgba(255,255,255,0.025)",
              padding: "22px 24px",
            }}
          >
            <div style={{ display: "flex", color: "#b9beb6", fontSize: 17 }}>
              {label}
            </div>
            <div
              style={{
                display: "flex",
                fontSize: 35,
                fontWeight: 700,
                marginTop: 10,
              }}
            >
              {reportedCount(value)}
            </div>
          </div>
        ))}
      </div>
    </div>,
    size,
  );
}
