#!/usr/bin/env node

/**
 * fQRGen MCP Server
 *
 * Usage:
 *   node index.js [--server=<url>]
 *
 * Arguments:
 *   --server=<url> : (옵션) fQRGen REST API 서버 주소 (기본값: http://localhost:3014)
 *
 * Environment:
 *   FQRGEN_SERVER : fQRGen REST API 서버 주소 (--server 옵션보다 우선순위 낮음)
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { writeFile } from "node:fs/promises";
import { resolve } from "node:path";

// 서버 주소 결정: CLI 인자 > 환경변수 > 기본값
function getServerUrl() {
  const arg = process.argv.find((a) => a.startsWith("--server="));
  if (arg) return arg.split("=").slice(1).join("=");
  return process.env.FQRGEN_SERVER || "http://localhost:3014";
}

const SERVER_URL = getServerUrl();

const server = new McpServer({
  name: "fqrgen-mcp",
  version: "1.0.0",
});

// Tool: health_check
server.tool(
  "health_check",
  "fQRGen 서버 상태를 확인합니다",
  {},
  async () => {
    try {
      const res = await fetch(SERVER_URL);
      const contentType = res.headers.get("content-type") || "";

      if (contentType.includes("application/json")) {
        const json = await res.json();
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(json, null, 2),
            },
          ],
        };
      }

      return {
        content: [
          {
            type: "text",
            text: `서버 응답: ${res.status} ${res.statusText} (HTML UI - Node.js 서버)`,
          },
        ],
      };
    } catch (err) {
      return {
        isError: true,
        content: [
          {
            type: "text",
            text: `서버 연결 실패: ${err.message}\n서버 주소: ${SERVER_URL}`,
          },
        ],
      };
    }
  }
);

// Tool: generate_qr
server.tool(
  "generate_qr",
  "텍스트 또는 URL로 QR 코드를 생성합니다. PNG 바이너리 또는 SVG 문자열을 반환합니다.",
  {
    data: z
      .string()
      .default("https://example.com")
      .describe("QR 코드에 인코딩할 텍스트 또는 URL"),
    format: z
      .enum(["png", "svg"])
      .default("png")
      .describe("출력 형식: png 또는 svg"),
    save_path: z
      .string()
      .optional()
      .describe("(옵션) 생성된 QR 이미지를 저장할 파일 경로"),
  },
  async ({ data, format, save_path }) => {
    try {
      const res = await fetch(`${SERVER_URL}/api/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data, format }),
      });

      if (!res.ok) {
        const errBody = await res.text();
        return {
          isError: true,
          content: [
            {
              type: "text",
              text: `QR 생성 실패 (${res.status}): ${errBody}`,
            },
          ],
        };
      }

      const buffer = Buffer.from(await res.arrayBuffer());

      // 파일 저장 요청이 있으면 저장
      if (save_path) {
        const absPath = resolve(save_path);
        await writeFile(absPath, buffer);
        return {
          content: [
            {
              type: "text",
              text: `QR 코드 저장 완료: ${absPath} (${format.toUpperCase()}, ${buffer.length} bytes)\n인코딩 데이터: ${data}`,
            },
          ],
        };
      }

      // SVG는 텍스트로 반환
      if (format === "svg") {
        return {
          content: [
            {
              type: "text",
              text: buffer.toString("utf-8"),
            },
          ],
        };
      }

      // PNG는 base64 이미지로 반환
      return {
        content: [
          {
            type: "image",
            data: buffer.toString("base64"),
            mimeType: "image/png",
          },
          {
            type: "text",
            text: `QR 코드 생성 완료 (PNG, ${buffer.length} bytes)\n인코딩 데이터: ${data}`,
          },
        ],
      };
    } catch (err) {
      return {
        isError: true,
        content: [
          {
            type: "text",
            text: `QR 생성 오류: ${err.message}\n서버 주소: ${SERVER_URL}`,
          },
        ],
      };
    }
  }
);

// Tool: generate_qr_batch
server.tool(
  "generate_qr_batch",
  "여러 개의 QR 코드를 일괄 생성합니다",
  {
    items: z
      .array(
        z.object({
          data: z.string().describe("QR 코드에 인코딩할 텍스트 또는 URL"),
          format: z
            .enum(["png", "svg"])
            .default("png")
            .describe("출력 형식"),
          save_path: z.string().describe("저장할 파일 경로"),
        })
      )
      .describe("생성할 QR 코드 목록"),
  },
  async ({ items }) => {
    const results = [];

    for (const item of items) {
      try {
        const res = await fetch(`${SERVER_URL}/api/generate`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ data: item.data, format: item.format }),
        });

        if (!res.ok) {
          results.push(`FAIL: ${item.data} → ${res.status} 에러`);
          continue;
        }

        const buffer = Buffer.from(await res.arrayBuffer());
        const absPath = resolve(item.save_path);
        await writeFile(absPath, buffer);
        results.push(
          `OK: ${item.data} → ${absPath} (${buffer.length} bytes)`
        );
      } catch (err) {
        results.push(`FAIL: ${item.data} → ${err.message}`);
      }
    }

    return {
      content: [
        {
          type: "text",
          text: `일괄 생성 결과 (${results.length}건):\n${results.join("\n")}`,
        },
      ],
    };
  }
);

// 서버 시작
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((err) => {
  console.error("MCP 서버 시작 실패:", err);
  process.exit(1);
});
