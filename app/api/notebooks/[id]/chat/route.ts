import Anthropic from "@anthropic-ai/sdk";
import { getAnthropic, MODELS } from "@/lib/anthropic";
import { getSupabase } from "@/lib/supabase";
import type { Citation, Source } from "@/lib/notebooks";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const APP_BLURB =
  "Clone LM is a NotebookLM-style research app. The user can: add web sources via the search box in the Quellen (sources) panel on the left; chat here grounded in those sources; and generate Studio outputs on the right — Mindmap, Berichte (report), Karteikarten (flashcards), Quiz, Infografik, and Datentabelle (data table).";

function systemPrompt(title: string, hasSources: boolean): string {
  const base = `You are the assistant inside Clone LM. The current notebook is titled "${title}". Reply in the user's language (default German). Be clear and concise.`;
  if (hasSources) {
    return `${base}\nAnswer grounded in the provided sources and cite them. If the sources don't cover the question, say so briefly, then answer from general knowledge and note that it isn't from the sources.`;
  }
  return `${base}\nThis notebook has no sources yet, so answer from general knowledge — but tailor everything to this app. If the user asks what they can do here / how it works, explain Clone LM concretely: ${APP_BLURB} Gently suggest adding a source for grounded, cited answers.`;
}

function extractCitations(msg: Anthropic.Message, sources: Source[]): Citation[] {
  const cited = new Map<number, Citation>();
  for (const block of msg.content) {
    if (block.type === "text" && (block as any).citations) {
      for (const c of (block as any).citations) {
        const idx = c.document_index;
        if (typeof idx === "number" && sources[idx]) {
          cited.set(idx, { title: sources[idx].title, url: sources[idx].url });
        }
      }
    }
  }
  return [...cited.values()];
}

async function suggestFollowups(
  anthropic: Anthropic,
  question: string,
  answer: string
): Promise<string[]> {
  try {
    const resp = await anthropic.messages.create({
      model: MODELS.structured,
      max_tokens: 220,
      messages: [
        {
          role: "user",
          content: `In a research notebook, the user asked:\n"${question}"\nThe assistant answered:\n"${answer.slice(0, 1500)}"\n\nReturn ONLY a JSON array of exactly 3 short follow-up questions the user might ask next, in the same language as the answer. No prose, no markdown.`,
        },
      ],
    });
    const text = resp.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("");
    const s = text.indexOf("[");
    const e = text.lastIndexOf("]");
    if (s === -1 || e === -1) return [];
    const arr = JSON.parse(text.slice(s, e + 1));
    return Array.isArray(arr) ? arr.map(String).slice(0, 3) : [];
  } catch {
    return [];
  }
}

// POST /api/notebooks/[id]/chat  { message } -> SSE stream of {type:'text'|'done'|'error'}
export async function POST(req: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  let message = "";
  try {
    ({ message } = await req.json());
  } catch {
    /* ignore */
  }
  if (!message?.trim()) {
    return new Response(JSON.stringify({ error: "message required" }), {
      status: 400,
    });
  }

  const supabase = getSupabase();
  const anthropic = getAnthropic();

  const [{ data: notebook }, { data: sourcesData }, { data: historyData }] =
    await Promise.all([
      supabase.from("notebooks").select("title").eq("id", id).single(),
      supabase.from("sources").select("*").eq("notebook_id", id).order("created_at"),
      supabase
        .from("chat_messages")
        .select("role, content")
        .eq("notebook_id", id)
        .order("created_at", { ascending: true })
        .limit(20),
    ]);

  const sources = (sourcesData ?? []) as Source[];
  const hasSources = sources.length > 0;

  // persist the user's message
  await supabase
    .from("chat_messages")
    .insert({ notebook_id: id, role: "user", content: message });

  // build the prompt
  const messages: Anthropic.MessageParam[] = [];
  if (hasSources) {
    const docs = sources.map((s, i) => ({
      type: "document" as const,
      source: {
        type: "text" as const,
        media_type: "text/plain" as const,
        data: `${s.title}\n${s.url ?? ""}\n\n${s.content ?? s.snippet ?? ""}`,
      },
      title: s.title,
      citations: { enabled: true },
      ...(i === sources.length - 1
        ? { cache_control: { type: "ephemeral" as const } }
        : {}),
    }));
    messages.push({
      role: "user",
      content: [
        ...(docs as any),
        { type: "text", text: "These are the sources for this notebook." },
      ],
    });
    messages.push({ role: "assistant", content: "Verstanden – ich nutze diese Quellen." });
  }
  for (const m of historyData ?? []) {
    messages.push({ role: m.role as "user" | "assistant", content: m.content });
  }
  messages.push({ role: "user", content: message });

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (obj: unknown) =>
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(obj)}\n\n`));
      let full = "";
      try {
        const llm = anthropic.messages.stream({
          model: MODELS.writing,
          max_tokens: 1200,
          system: systemPrompt(notebook?.title ?? "Unbenanntes Notebook", hasSources),
          messages,
        });
        for await (const event of llm) {
          if (
            event.type === "content_block_delta" &&
            event.delta.type === "text_delta"
          ) {
            full += event.delta.text;
            send({ type: "text", text: event.delta.text });
          }
        }
        const finalMsg = await llm.finalMessage();
        const citations = extractCitations(finalMsg, sources);
        await supabase
          .from("chat_messages")
          .insert({ notebook_id: id, role: "assistant", content: full, citations });
        const suggestions = await suggestFollowups(anthropic, message, full);
        send({ type: "done", citations, suggestions });
      } catch (e: any) {
        send({ type: "error", error: e?.message ?? String(e) });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
