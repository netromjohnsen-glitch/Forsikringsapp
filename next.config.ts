import type { NextConfig } from "next";
import { termsArchiveDocuments } from "./lib/terms-archive-documents.ts";

const nextConfig: NextConfig = {
  outputFileTracingIncludes: {
    "/api/vilkar/*/*": [...new Set(termsArchiveDocuments.map(document => "./" + document.archivePath))],
    "/api/analyze": ["./lib/pdf-text-worker.mjs", "./node_modules/pdf-parse/**/*",
      "./node_modules/pdfjs-dist/**/*", "./node_modules/@napi-rs/canvas*/**/*"],
  },
  serverExternalPackages: ["pdf-parse", "@napi-rs/canvas"],
  async headers() {
    return [{
      source: "/api/analyze",
      headers: [
        { key: "Cache-Control", value: "private, no-store, max-age=0" },
        { key: "Pragma", value: "no-cache" },
      ],
    }];
  },
};

export default nextConfig;
