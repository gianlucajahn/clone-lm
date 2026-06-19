/** Metadata for each generatable Studio artifact kind (icon + colour + label). */
export const KIND_META: Record<
  string,
  { label: string; icon: string; color: string }
> = {
  mindmap: { label: "Mindmap", icon: "account_tree", color: "#802272" },
  report: { label: "Bericht", icon: "summarize", color: "#796731" },
  flashcards: { label: "Karteikarten", icon: "style", color: "#8c2e2a" },
  quiz: { label: "Quiz", icon: "quiz", color: "#056A95" },
  infographic: { label: "Infografik", icon: "bar_chart", color: "#802272" },
  datatable: { label: "Datentabelle", icon: "table_chart", color: "#224484" },
  note: { label: "Notiz", icon: "description", color: "#5f6368" },
};

export interface ArtifactMeta {
  id: string;
  kind: string;
  title: string;
  created_at: string;
  sourceCount: number | null;
}

export interface Artifact extends ArtifactMeta {
  data: any;
}

/** German relative time ("Gerade eben", "Vor 5 Min.", "Vor 1 Std.", "Vor 2 Tagen"). */
export function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "Gerade eben";
  if (m < 60) return `Vor ${m} Min.`;
  const h = Math.floor(m / 60);
  if (h < 24) return `Vor ${h} Std.`;
  const d = Math.floor(h / 24);
  return d === 1 ? "Vor 1 Tag" : `Vor ${d} Tagen`;
}
