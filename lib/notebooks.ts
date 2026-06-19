/** Supabase row shapes + small client/server-shared helpers. */

export interface Notebook {
  id: string;
  title: string;
  summary: string | null;
  created_at: string;
  /** populated by the list endpoint via an aggregate */
  source_count?: number;
}

export interface Source {
  id: string;
  notebook_id: string;
  title: string;
  url: string | null;
  snippet: string | null;
  content: string | null;
  created_at: string;
}

/** A web-search candidate, before the user imports it. */
export interface SourceCandidate {
  title: string;
  url: string;
  snippet: string;
}

export interface ChatMessage {
  id?: string;
  notebook_id?: string;
  role: "user" | "assistant";
  content: string;
  citations?: Citation[] | null;
  created_at?: string;
}

/** A source referenced by an assistant answer (footnote). */
export interface Citation {
  title: string;
  url: string | null;
}

/** A saved note (chat answer pinned to the Studio panel). */
export interface Note {
  id: string;
  content: string;
  created_at: string;
}

/** Format an ISO timestamp as dd.MM.yyyy (matches the rest of the UI). */
export function formatDate(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()}`;
}
