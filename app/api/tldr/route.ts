import { streamText, createTextStreamResponse } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { getSystem, getComponent } from "@/lib/content";

export const maxDuration = 30;

export async function POST(req: Request) {
  const { slug, type } = await req.json() as { slug: string; type: "system" | "component" };

  let title: string;
  let content: string;

  try {
    if (type === "system") {
      const item = getSystem(slug);
      title = item.meta.title;
      content = item.content;
    } else {
      const item = getComponent(slug);
      title = item.meta.title;
      content = item.content;
    }
  } catch {
    return new Response("Not found", { status: 404 });
  }

  const result = streamText({
    model: anthropic("claude-haiku-4-5"),
    system:
      "You are a senior software engineer who writes clear, concise technical summaries. " +
      "Respond only with the bullet points — no intro, no heading, no trailing text.",
    prompt:
      `Summarize the following system design content about "${title}" in exactly 4 bullet points. ` +
      `Each bullet should be one sentence covering: (1) what it is, (2) the core mechanism, ` +
      `(3) a key trade-off, (4) when to use it.\n\n${content}`,
  });

  return createTextStreamResponse({ textStream: result.textStream });
}
