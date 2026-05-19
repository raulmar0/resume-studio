import { ImageResponse } from "next/og";

export const size = {
  width: 32,
  height: 32,
};

export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          alignItems: "center",
          background: "#111827",
          color: "#f8fafc",
          display: "flex",
          fontSize: 17,
          fontWeight: 800,
          justifyContent: "center",
          letterSpacing: 0,
          lineHeight: 1,
        }}
      >
        RB
      </div>
    ),
    size,
  );
}
