import { readFileSync } from "fs";
import path from "path";

export async function GET(): Promise<Response> {
  const filePath = path.join(process.cwd(), "public/llms.txt");
  const content = readFileSync(filePath, "utf-8");
  return new Response(content, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
