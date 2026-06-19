import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { getAnthropic, MODELS } from "@/lib/anthropic";
import { getSupabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

const INSTR =
  "Fasse dieses Dokument als klaren, gut strukturierten Fließtext zusammen. Behalte die wichtigsten Fakten, Zahlen, Begriffe und Kernaussagen bei, damit der Text später als Quelle zum Nachschlagen und für KI-Antworten dienen kann. Antworte in der Sprache des Dokuments und gib NUR die Zusammenfassung aus.";

// POST { filename, mediaType, data(base64) } — read a file, summarize it, save as a source.
export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const { filename, mediaType, data } = await req.json();
    if (typeof data !== "string" || !data) {
      return NextResponse.json({ error: "Keine Datei empfangen." }, { status: 400 });
    }

    const anthropic = getAnthropic();
    let content: any[];
    if (mediaType === "application/pdf") {
      content = [
        { type: "document", source: { type: "base64", media_type: "application/pdf", data } },
        { type: "text", text: INSTR },
      ];
    } else {
      const text = Buffer.from(data, "base64").toString("utf8").slice(0, 24000);
      if (!text.trim()) {
        return NextResponse.json({ error: "Die Datei enthält keinen lesbaren Text." }, { status: 400 });
      }
      content = [{ type: "text", text: `${INSTR}\n\n---\n${text}` }];
    }

    const resp = await anthropic.messages.create({
      model: MODELS.writing,
      max_tokens: 1500,
      messages: [{ role: "user", content: content as any }],
    });
    const summary = resp.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("\n")
      .trim();
    if (!summary) throw new Error("Zusammenfassung fehlgeschlagen.");

    const title = String(filename ?? "Dokument").replace(/\.[^.]+$/, "").slice(0, 200) || "Dokument";

    const supabase = getSupabase();
    const { data: row, error } = await supabase
      .from("sources")
      .insert({
        notebook_id: params.id,
        title,
        url: null,
        snippet: summary.slice(0, 400),
        content: summary,
      })
      .select("*")
      .single();
    if (error) throw error;

    return NextResponse.json({ source: row });
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? String(e) }, { status: 500 });
  }
}
