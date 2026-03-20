#!/usr/bin/env node

/**
 * fQRGen MCP Server
 *
 * Usage:
 *   node index.js [--server=<url>]
 *
 * Arguments:
 *   --server=<url> : (Optional) fQRGen REST API server URL (default: http://localhost:3014)
 *
 * Environment:
 *   FQRGEN_SERVER : fQRGen REST API server URL (lower priority than --server)
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { writeFile, access } from "node:fs/promises";
import { resolve, dirname, basename } from "node:path";
import { homedir } from "node:os";

// Determine server URL: CLI arg > env var > default
function getServerUrl() {
  const arg = process.argv.find((a) => a.startsWith("--server="));
  if (arg) return arg.split("=").slice(1).join("=");
  return process.env.FQRGEN_SERVER || "http://localhost:3014";
}

const SERVER_URL = getServerUrl();

const server = new McpServer({
  name: "fqrgen-mcp",
  version: "1.0.1",
});

// Tool: health_check
server.tool(
  "health_check",
  "Check the fQRGen server status",
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
            text: `Server response: ${res.status} ${res.statusText} (HTML UI - Node.js server)`,
          },
        ],
      };
    } catch (err) {
      return {
        isError: true,
        content: [
          {
            type: "text",
            text: `Server connection failed: ${err.message}\nServer URL: ${SERVER_URL}`,
          },
        ],
      };
    }
  }
);

// Tool: generate_qr
server.tool(
  "generate_qr",
  "Generate a QR code from text or URL. Returns PNG binary or SVG string.",
  {
    data: z
      .string()
      .default("https://example.com")
      .describe("Text or URL to encode in the QR code"),
    format: z
      .enum(["png", "svg"])
      .default("png")
      .describe("Output format: png or svg"),
    save_path: z
      .string()
      .optional()
      .describe("(Optional) File path to save the generated QR image. Falls back to ~/Downloads if the directory does not exist."),
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
              text: `QR generation failed (${res.status}): ${errBody}`,
            },
          ],
        };
      }

      const buffer = Buffer.from(await res.arrayBuffer());

      // Save to file if save_path is provided
      if (save_path) {
        let absPath = resolve(save_path);
        let fallback = false;
        try {
          await access(dirname(absPath));
        } catch {
          const fallbackDir = resolve(homedir(), "Downloads");
          absPath = resolve(fallbackDir, basename(absPath));
          fallback = true;
        }
        await writeFile(absPath, buffer);
        const msg = fallback
          ? `Warning: The specified directory does not exist. Saved to ~/Downloads instead.\nSaved to: ${absPath}`
          : `QR code saved: ${absPath}`;
        return {
          content: [
            {
              type: "text",
              text: `${msg} (${format.toUpperCase()}, ${buffer.length} bytes)\nEncoded data: ${data}`,
            },
          ],
        };
      }

      // Return SVG as text
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

      // Return PNG as base64 image
      return {
        content: [
          {
            type: "image",
            data: buffer.toString("base64"),
            mimeType: "image/png",
          },
          {
            type: "text",
            text: `QR code generated (PNG, ${buffer.length} bytes)\nEncoded data: ${data}`,
          },
        ],
      };
    } catch (err) {
      return {
        isError: true,
        content: [
          {
            type: "text",
            text: `QR generation error: ${err.message}\nServer URL: ${SERVER_URL}`,
          },
        ],
      };
    }
  }
);

// Tool: generate_qr_batch
server.tool(
  "generate_qr_batch",
  "Generate multiple QR codes at once",
  {
    items: z
      .array(
        z.object({
          data: z.string().describe("Text or URL to encode in the QR code"),
          format: z
            .enum(["png", "svg"])
            .default("png")
            .describe("Output format"),
          save_path: z.string().describe("File save path"),
        })
      )
      .describe("List of QR codes to generate"),
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
          results.push(`FAIL: ${item.data} - ${res.status} error`);
          continue;
        }

        const buffer = Buffer.from(await res.arrayBuffer());
        let absPath = resolve(item.save_path);
        let fallback = false;
        try {
          await access(dirname(absPath));
        } catch {
          const fallbackDir = resolve(homedir(), "Downloads");
          absPath = resolve(fallbackDir, basename(absPath));
          fallback = true;
        }
        await writeFile(absPath, buffer);
        const prefix = fallback ? "OK(~/Downloads)" : "OK";
        results.push(
          `${prefix}: ${item.data} -> ${absPath} (${buffer.length} bytes)`
        );
      } catch (err) {
        results.push(`FAIL: ${item.data} -> ${err.message}`);
      }
    }

    return {
      content: [
        {
          type: "text",
          text: `Batch generation result (${results.length} items):\n${results.join("\n")}`,
        },
      ],
    };
  }
);

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((err) => {
  console.error("MCP server failed to start:", err);
  process.exit(1);
});
