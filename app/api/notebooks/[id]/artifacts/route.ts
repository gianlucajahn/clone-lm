import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { getAnthropic, MODELS } from "@/lib/anthropic";
import { getSupabase } from "@/lib/supabase";
import { KIND_META } from "@/lib/studioKinds";
import type { Source } from "@/lib/notebooks";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

type Gen = { model: string; maxTokens: number; shape: string; instr: string };

const GEN: Record<string, Gen> = {
  mindmap: {
    model: MODELS.structured,
    maxTokens: 1800,
    shape: `{"title": string, "root": {"label": string, "children": [{"label": string, "children": [{"label": string}]}]}}`,
    instr:
      "Erstelle eine Mindmap als Baumstruktur (2–3 Ebenen tief, prägnante Knoten-Labels). Der Wurzelknoten ist das Hauptthema.",
  },
  report: {
    model: MODELS.writing,
    maxTokens: 2400,
    shape: `{"title": string, "markdown": string}`,
    instr:
      "Schreibe einen klar strukturierten Bericht in Markdown (Überschriften mit ##, Aufzählungen mit -, **fett** für Schlüsselbegriffe).",
  },
  flashcards: {
    model: MODELS.structured,
    maxTokens: 1800,
    shape: `{"title": string, "cards": [{"front": string, "back": string}]}`,
    instr:
      "Erstelle 10 Karteikarten zu den wichtigsten Konzepten. 'front' ist eine Frage/Begriff, 'back' die Antwort/Erklärung.",
  },
  quiz: {
    model: MODELS.structured,
    maxTokens: 2000,
    shape: `{"title": string, "questions": [{"question": string, "options": [string, string, string, string], "answer": number, "explanation": string}]}`,
    instr:
      "Erstelle 6 Multiple-Choice-Fragen mit jeweils 4 Optionen. 'answer' ist der 0-basierte Index der richtigen Option.",
  },
  infographic: {
    model: MODELS.writing,
    maxTokens: 8000,
    shape: "",
    instr: "",
  },
  datatable: {
    model: MODELS.structured,
    maxTokens: 1800,
    shape: `{"title": string, "columns": [string], "rows": [[string]]}`,
    instr:
      "Erstelle eine Datentabelle mit 3–5 Spalten und mehreren Zeilen, die die Quellen vergleicht oder zusammenfasst.",
  },
};

function sourcesContext(sources: Source[]): string {
  if (!sources.length)
    return "Es sind keine Quellen vorhanden. Nutze Allgemeinwissen zum Thema.";
  return sources
    .map((s, i) => `[${i + 1}] ${s.title}\n${s.content ?? s.snippet ?? ""}`)
    .join("\n\n")
    .slice(0, 8000);
}

function extractJson(text: string): any | null {
  const s = text.indexOf("{");
  const e = text.lastIndexOf("}");
  if (s === -1 || e === -1) return null;
  try {
    return JSON.parse(text.slice(s, e + 1));
  } catch {
    return null;
  }
}

// GET — all studio items (generated artifacts + saved notes), newest first.
export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("artifacts")
      .select("id, kind, title, data, created_at")
      .eq("notebook_id", params.id)
      .neq("kind", "cover")
      .neq("kind", "labels")
      .order("created_at", { ascending: false });
    if (error) throw error;
    const artifacts = (data ?? []).map((a: any) => ({
      id: a.id,
      kind: a.kind,
      title: a.title,
      created_at: a.created_at,
      sourceCount: a.data?.sourceCount ?? null,
    }));
    return NextResponse.json({ artifacts });
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? String(e) }, { status: 500 });
  }
}

// POST { kind } — generate a studio artifact from the notebook's sources.
export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { kind, options } = await req.json();
    const cfg = GEN[kind];
    if (!cfg) return NextResponse.json({ error: "unknown kind" }, { status: 400 });

    // Per-kind settings from the option's "anpassen" popup.
    let extra = "";
    if (options && typeof options === "object") {
      const topic =
        typeof options.topic === "string" && options.topic.trim() ? options.topic.trim() : "";
      if (kind === "quiz") {
        const n = ({ weniger: 4, standard: 6, mehr: 10 } as Record<string, number>)[options.count] ?? 6;
        const d =
          ({ einfach: "einfach", mittel: "mittel", schwierig: "schwierig" } as Record<string, string>)[
            options.difficulty
          ] ?? "mittel";
        extra = `\n\nZusätzliche Vorgaben:\n- Erstelle genau ${n} Fragen.\n- Schwierigkeitsgrad: ${d}.`;
        if (topic) extra += `\n- Thema / Fokus: ${topic}`;
      } else if (kind === "flashcards") {
        const n = ({ weniger: 6, standard: 10, mehr: 16 } as Record<string, number>)[options.count] ?? 10;
        const d =
          ({ einfach: "einfach", mittel: "mittel", schwierig: "schwierig" } as Record<string, string>)[
            options.difficulty
          ] ?? "mittel";
        extra = `\n\nZusätzliche Vorgaben:\n- Erstelle genau ${n} Karteikarten.\n- Schwierigkeitsgrad: ${d}.`;
        if (topic) extra += `\n- Thema / Fokus: ${topic}`;
      } else if (kind === "report" && typeof options.format === "string" && options.format) {
        extra = `\n\nErstelle den Bericht im folgenden Format: „${options.format}“${
          typeof options.formatDesc === "string" && options.formatDesc ? ` — ${options.formatDesc}` : ""
        }.`;
        if (topic) extra += `\n- Thema / Fokus: ${topic}`;
      } else if (kind === "datatable") {
        extra = `\n\nSprache der Tabelle: ${options.language || "Deutsch"}.`;
        if (typeof options.description === "string" && options.description.trim()) {
          extra += `\n- Anweisungen des Nutzers (Spalten, Gruppierung, Inhalt): ${options.description.trim()}`;
        }
      } else if (topic) {
        extra = `\n\nZusätzliche Vorgaben:\n- Thema / Fokus: ${topic}`;
      }
    }

    const supabase = getSupabase();
    const anthropic = getAnthropic();
    const { data: sourcesData } = await supabase
      .from("sources")
      .select("*")
      .eq("notebook_id", params.id)
      .order("created_at");
    const sources = (sourcesData ?? []) as Source[];
    // Never generate (or call the model) for an empty notebook with no sources.
    if (sources.length === 0) {
      return NextResponse.json(
        { error: "Bitte fügen Sie zuerst eine Quelle hinzu." },
        { status: 400 }
      );
    }
    const ctx = sourcesContext(sources);
    const isInfographic = kind === "infographic";

    // Infographic settings from its "anpassen" popup.
    const o = (options ?? {}) as Record<string, string>;
    const vb =
      ({ querformat: "0 0 1120 800", hochformat: "0 0 800 1120", quadrat: "0 0 900 900" } as Record<string, string>)[
        o.orientation
      ] ?? "0 0 1120 800";
    const lang = o.language || "Deutsch";
    const styleHint =
      o.visualStyle && o.visualStyle !== "auto"
        ? (
            {
              kawaii: "Visueller Stil: Kawaii — niedlich, verspielt, runde Formen, Pastellfarben.",
              tonfigur: "Visueller Stil: Knet-/Tonfiguren-Look — weiche, plastische 3D-artige Formen mit sanften Schatten.",
              sketchnote: "Visueller Stil: Sketchnote — handgezeichnete Linien, Doodles, skizzenhafte Anmutung.",
              anime: "Visueller Stil: Anime — dynamisch, kräftige Farben, klare Outlines.",
              editorial: "Visueller Stil: Editorial/Magazin — elegant, viel Weißraum, raffinierte Typografie.",
              aquarell: "Visueller Stil: Aquarell — weiche Farbverläufe, malerische Anmutung.",
              comic: "Visueller Stil: Comic — kräftige Outlines, knallige Farben.",
              vintage: "Visueller Stil: Vintage/Retro — gedeckte Farben, nostalgische Anmutung.",
            } as Record<string, string>
          )[o.visualStyle] ?? ""
        : "";
    const detailHint =
      ({
        kurzgefasst: "Detaillierungsgrad: kurzgefasst — wenige, prägnante Kernpunkte.",
        detailliert: "Detaillierungsgrad: detailliert — viele Datenpunkte, mehrere Abschnitte, tiefere Erläuterungen.",
      } as Record<string, string>)[o.detailLevel] ?? "";
    const infoDesc =
      typeof o.description === "string" && o.description.trim() ? o.description.trim() : "";

    const prompt = isInfographic
      ? `Erstelle eine ansprechende, informative Infografik als EIGENSTÄNDIGES SVG-Bild basierend auf dem Kontext.
Sprache aller Texte in der Infografik: ${lang}.${styleHint ? "\n" + styleHint : ""}${detailHint ? "\n" + detailHint : ""}${infoDesc ? "\nZusätzliche Anweisungen des Nutzers: " + infoDesc : ""}

Anforderungen:
- Beginne mit einer Zeile "TITEL: <kurzer, prägnanter Titel>".
- Danach AUSSCHLIESSLICH der SVG-Code: genau ein <svg ...>…</svg>-Element mit viewBox="${vb}".
- Nutze das gesamte Seitenverhältnis der viewBox sinnvoll aus.
- Heller Hintergrund, klare Hierarchie: großer Titel, thematische Abschnitte mit farbigen Formen/Icons, hervorgehobene Kennzahlen und mindestens ein einfaches Diagramm (Balken oder Donut) aus den Daten.
- Harmonische Farbpalette. Gut lesbare Schrift über <text>-Elemente.
- NUR gültiges, eigenständiges SVG: keine externen Bilder, kein <foreignObject>, keine <script>, keine Bitmaps.
- WICHTIG: Halte das SVG kompakt und liefere es IMMER vollständig bis zum schließenden </svg> aus (lieber etwas einfacher als unvollständig).
- Antworte mit nichts außer der TITEL-Zeile und dem vollständigen SVG-Block.

Kontext:
${ctx}`
      : `${cfg.instr}${extra}

Gib AUSSCHLIESSLICH gültiges JSON in genau dieser Form zurück (kein Markdown, keine Erklärung, keine Code-Fences):
${cfg.shape}

Quellen / Kontext:
${ctx}`;

    const resp = await anthropic.messages.create({
      model: cfg.model,
      max_tokens: cfg.maxTokens,
      messages: [{ role: "user", content: prompt }],
    });
    const text = resp.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("");

    let title: string;
    let data: Record<string, unknown>;
    if (isInfographic) {
      const start = text.indexOf("<svg");
      const end = text.lastIndexOf("</svg>");
      if (start === -1 || end === -1) throw new Error("Kein SVG erzeugt");
      const svg = text.slice(start, end + 6);
      const tMatch = /TITEL:\s*(.+)/i.exec(text);
      title = (tMatch?.[1]?.trim() || KIND_META[kind]?.label || "Infografik").slice(0, 80);
      data = { svg, sourceCount: sources.length };
    } else {
      const json = extractJson(text);
      if (!json) throw new Error("Ungültige KI-Antwort");
      title = json.title || KIND_META[kind]?.label || "Studio";
      data = { ...json, sourceCount: sources.length };
      delete (data as any).title;
    }

    const { data: row, error } = await supabase
      .from("artifacts")
      .insert({ notebook_id: params.id, kind, title, data })
      .select("id, kind, title, data, created_at")
      .single();
    if (error) throw error;

    return NextResponse.json({
      artifact: {
        id: row.id,
        kind: row.kind,
        title: row.title,
        data: row.data,
        created_at: row.created_at,
        sourceCount: row.data?.sourceCount ?? sources.length,
      },
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? String(e) }, { status: 500 });
  }
}
