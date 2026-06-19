import { randomUUID } from "crypto";
import Anthropic from "@anthropic-ai/sdk";
import { getAnthropic, MODELS } from "@/lib/anthropic";
import { getSupabase } from "@/lib/supabase";
import type { Label, LabelConfig } from "@/lib/labels";

function parseArr(text: string): any[] | null {
  const s = text.indexOf("[");
  const e = text.lastIndexOf("]");
  if (s === -1 || e === -1) return null;
  try {
    return JSON.parse(text.slice(s, e + 1));
  } catch {
    return null;
  }
}

/**
 * Sort every source in a notebook into the best thematic label — reusing
 * existing labels where they fit, inventing new ones where they don't — then
 * persist and return the resulting label config. Used both by the "Neu
 * organisieren" action and automatically after a web-research import.
 */
export async function organizeLabels(notebookId: string): Promise<LabelConfig> {
  const supabase = getSupabase();

  const { data: sources } = await supabase
    .from("sources")
    .select("id, title, snippet, content, created_at")
    .eq("notebook_id", notebookId)
    .order("created_at", { ascending: true });

  if (!sources || sources.length === 0) return { labels: [], assignments: {} };

  const { data: cfgRow } = await supabase
    .from("artifacts")
    .select("data")
    .eq("notebook_id", notebookId)
    .eq("kind", "labels")
    .maybeSingle();
  const existing = ((cfgRow?.data as LabelConfig | undefined)?.labels ?? []).map((l) => l.name);

  const list = sources
    .map((s, i) => {
      const ctx = (s.snippet || s.content || "").slice(0, 160).replace(/\s+/g, " ");
      return `[${i + 1}] ${s.title}${ctx ? ` — ${ctx}` : ""}`;
    })
    .join("\n");

  const prompt = `Ordne die folgenden Quellen in thematische Labels (Kategorien) auf Deutsch ein. Jede Quelle gehört zu genau einem Label. Fasse thematisch verwandte Quellen im selben Label zusammen.

Nutze die vorhandenen Labels nur dort, wo sie inhaltlich gut passen. Wenn die vorhandenen Labels die Themen der Quellen NICHT gut abbilden, erstelle passende neue Labels und verschiebe die betreffenden Quellen dorthin. Lieber ein treffendes neues Label erstellen als eine Quelle in ein unpassendes vorhandenes Label zwingen. Label-Namen sind kurz und prägnant (1–4 Wörter).

${existing.length ? `Vorhandene Labels (nur verwenden, wenn passend): ${existing.join(", ")}\n\n` : ""}Quellen:
${list}

Gib AUSSCHLIESSLICH gültiges JSON zurück (keine Erklärung, keine Code-Fences) – ein Array von Gruppen, wobei "sources" die Quellen-Nummern enthält:
[{"label": "Name des Labels", "sources": [1, 2]}]`;

  const anthropic = getAnthropic();
  const resp = await anthropic.messages.create({
    model: MODELS.structured,
    max_tokens: 2000,
    messages: [{ role: "user", content: prompt }],
  });
  const text = resp.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("");
  const groups = parseArr(text) ?? [];

  const labels: Label[] = [];
  const byName = new Map<string, string>(); // normalized name -> labelId
  const assignments: Record<string, string> = {};

  const labelFor = (rawName: string): string => {
    const name = String(rawName || "Sonstiges").trim().slice(0, 60) || "Sonstiges";
    const key = name.toLowerCase();
    let id = byName.get(key);
    if (!id) {
      id = randomUUID();
      byName.set(key, id);
      labels.push({ id, name });
    }
    return id;
  };

  for (const g of groups) {
    if (!g || !Array.isArray(g.sources)) continue;
    const labelId = labelFor(g.label);
    for (const n of g.sources) {
      const idx = Number(n) - 1;
      const src = sources[idx];
      if (src) assignments[src.id] = labelId;
    }
  }

  // Any source the model skipped → a fallback "Sonstiges" label.
  const unsorted = sources.filter((s) => !assignments[s.id]);
  if (unsorted.length) {
    const fid = labelFor("Sonstiges");
    for (const s of unsorted) assignments[s.id] = fid;
  }

  const config: LabelConfig = { labels, assignments };
  await supabase.from("artifacts").delete().eq("notebook_id", notebookId).eq("kind", "labels");
  await supabase.from("artifacts").insert({
    notebook_id: notebookId,
    kind: "labels",
    title: "labels",
    data: config,
  });
  return config;
}
