import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { getAnthropic, MODELS } from "@/lib/anthropic";
import type { SourceCandidate } from "@/lib/notebooks";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

const PROMPT = (query: string, deep: boolean) =>
  deep
    ? `Do DEEP, thorough web research about: "${query}".

Run several searches from different angles (overview, key sub-topics, opposing views, recent developments, primary/authoritative sources). Be exhaustive.

Then return ONLY a JSON array (no prose, no markdown fences) of up to 15 objects, each:
{"title": string, "url": string, "snippet": string}

Rules:
- "url" must be a real URL taken from the search results (never invented).
- "snippet" is 2–3 sentences with substantive detail about what the source covers and why it's relevant, in the language of the query.
- Prefer diverse, authoritative, high-quality sources covering the topic from multiple perspectives. Output the JSON array and nothing else.`
    : `Quickly find web sources about: "${query}".

Be FAST: run only ONE web search, then immediately return ONLY a JSON array (no prose, no markdown fences) of up to 8 objects, each:
{"title": string, "url": string, "snippet": string}

Rules:
- "url" must be a real URL taken from the search results (never invented).
- "snippet" is 1 short sentence in the language of the query.
- Do not run extra searches or add commentary — output the JSON array and nothing else, as fast as possible.`;

function parseCandidates(text: string): SourceCandidate[] {
  const start = text.indexOf("[");
  const end = text.lastIndexOf("]");
  if (start === -1 || end === -1) return [];
  try {
    const arr = JSON.parse(text.slice(start, end + 1));
    if (!Array.isArray(arr)) return [];
    return arr
      .filter((c) => c && typeof c.url === "string" && typeof c.title === "string")
      .map((c) => ({
        title: String(c.title).slice(0, 300),
        url: String(c.url),
        snippet: String(c.snippet ?? "").slice(0, 600),
      }));
  } catch {
    return [];
  }
}

// POST /api/notebooks/[id]/research  { query } -> { candidates }
export async function POST(req: Request) {
  try {
    const { query, mode } = await req.json();
    if (!query || typeof query !== "string") {
      return NextResponse.json({ error: "query required" }, { status: 400 });
    }
    const deep = mode === "deep";

    const anthropic = getAnthropic();
    let messages: Anthropic.MessageParam[] = [
      { role: "user", content: PROMPT(query, deep) },
    ];
    let resp: Anthropic.Message | null = null;

    // Resume the server-side tool loop if it pauses — more rounds for deep research.
    for (let i = 0; i < (deep ? 6 : 3); i++) {
      resp = await anthropic.messages.create({
        // Quick research uses the fast Haiku model + a single search to stay snappy.
        model: deep ? MODELS.writing : MODELS.structured,
        max_tokens: deep ? 4000 : 1200,
        tools: [
          {
            type: "web_search_20260209",
            name: "web_search",
            max_uses: deep ? 9 : 1,
            allowed_callers: ["direct"],
          } as any,
        ],
        messages,
      });
      if (resp.stop_reason === "pause_turn") {
        messages = [...messages, { role: "assistant", content: resp.content }];
        continue;
      }
      break;
    }

    const text =
      resp?.content
        .filter((b): b is Anthropic.TextBlock => b.type === "text")
        .map((b) => b.text)
        .join("\n") ?? "";

    return NextResponse.json({ candidates: parseCandidates(text) });
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? String(e) }, { status: 500 });
  }
}
