import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { getAnthropic, MODELS } from "@/lib/anthropic";
import { getSupabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

/** A short 3–5 word title summarizing what a saved answer is about. */
async function summarizeTitle(text: string): Promise<string> {
  try {
    const anthropic = getAnthropic();
    const resp = await anthropic.messages.create({
      model: MODELS.structured,
      max_tokens: 30,
      messages: [
        {
          role: "user",
          content: `Gib einen sehr kurzen Titel (3–5 Wörter, keine Anführungszeichen, kein Punkt am Ende) zurück, der zusammenfasst, worum es im folgenden Text geht. Antworte in der Sprache des Textes und NUR mit dem Titel:\n\n${text.slice(0, 2000)}`,
        },
      ],
    });
    const t = resp.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("")
      .trim()
      .replace(/^["„»]|["“«.]$/g, "")
      .trim();
    return t.slice(0, 80) || text.slice(0, 80);
  } catch {
    return text.slice(0, 80);
  }
}

// GET /api/notebooks/[id]/notes — saved notes (artifacts of kind 'note').
export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("artifacts")
      .select("id, data, created_at")
      .eq("notebook_id", params.id)
      .eq("kind", "note")
      .order("created_at", { ascending: false });
    if (error) throw error;
    const notes = (data ?? []).map((a: any) => ({
      id: a.id,
      content: a.data?.text ?? "",
      created_at: a.created_at,
    }));
    return NextResponse.json({ notes });
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? String(e) }, { status: 500 });
  }
}

function mdToHtml(text: string): string {
  if (!text.trim()) return "";
  const esc = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  const bold = esc.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  return bold
    .split(/\n\n+/)
    .map((p) => `<p>${p.replace(/\n/g, "<br>")}</p>`)
    .join("");
}

// POST /api/notebooks/[id]/notes  { content? } — pin an answer or create a blank note.
export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = getSupabase();
    const { content } = await req.json().catch(() => ({ content: "" }));
    const text: string = content ?? "";
    const title = text.trim() ? await summarizeTitle(text) : "Neue Notiz";
    const { data, error } = await supabase
      .from("artifacts")
      .insert({
        notebook_id: params.id,
        kind: "note",
        title,
        data: { text, html: mdToHtml(text) },
      })
      .select("id, kind, title, data, created_at")
      .single();
    if (error) throw error;
    return NextResponse.json({
      note: {
        id: data.id,
        kind: data.kind,
        title: data.title,
        data: data.data,
        created_at: data.created_at,
        sourceCount: null,
      },
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? String(e) }, { status: 500 });
  }
}
