import { ImageResponse } from "next/og";
import { getPublishedArticleBySlug } from "@/lib/articles/public";

export const alt = "The Daily";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = await getPublishedArticleBySlug(slug);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 80,
          background: "#faf8f4",
        }}
      >
        <div
          style={{
            fontSize: 28,
            color: "#a3241b",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: 4,
          }}
        >
          {article?.category?.name ?? "The Daily"}
        </div>
        <div
          style={{
            fontSize: 64,
            fontWeight: 700,
            color: "#17140f",
            marginTop: 28,
            lineHeight: 1.15,
          }}
        >
          {article?.title ?? "The Daily"}
        </div>
      </div>
    ),
    size
  );
}
