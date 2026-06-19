"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import type { SourceCandidate } from "@/lib/notebooks";

type Phase = "idle" | "running" | "results" | "error";

interface ResearchCtx {
  query: string;
  setQuery: (s: string) => void;
  phase: Phase;
  candidates: SourceCandidate[];
  selected: Set<number>;
  importing: boolean;
  error: string;
  webSource: string;
  setWebSource: (s: string) => void;
  mode: string;
  setMode: (s: string) => void;
  run: () => void;
  toggle: (i: number) => void;
  reset: () => void;
  doImport: () => void;
}

const Ctx = createContext<ResearchCtx | null>(null);

export function useResearch(): ResearchCtx {
  const c = useContext(Ctx);
  if (!c) throw new Error("useResearch must be used within ResearchProvider");
  return c;
}

/**
 * Shares the web-research flow across the two SourceResearch boxes (the create
 * modal and the Quellen panel). Starting research closes the modal (onRunStart)
 * so the running/results state appears live in the Quellen panel.
 */
export function ResearchProvider({
  notebookId,
  onImported,
  onRunStart,
  children,
}: {
  notebookId: string;
  onImported: () => void;
  onRunStart?: () => void;
  children: ReactNode;
}) {
  const [query, setQuery] = useState("");
  const [phase, setPhase] = useState<Phase>("idle");
  const [candidates, setCandidates] = useState<SourceCandidate[]>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState("");
  const [webSource, setWebSource] = useState("web");
  const [mode, setMode] = useState("quick");

  const run = async () => {
    const q = query.trim();
    if (!q || phase === "running") return;
    onRunStart?.();
    setPhase("running");
    setError("");
    try {
      const r = await fetch(`/api/notebooks/${notebookId}/research`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: q, source: webSource, mode }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "Recherche fehlgeschlagen");
      const cands: SourceCandidate[] = d.candidates ?? [];
      setCandidates(cands);
      setSelected(new Set(cands.map((_, i) => i)));
      setPhase(cands.length ? "results" : "error");
      if (!cands.length) setError("Keine Quellen gefunden. Versuchen Sie es erneut.");
    } catch (e: any) {
      setError(e.message || String(e));
      setPhase("error");
    }
  };

  const toggle = (i: number) =>
    setSelected((prev) => {
      const n = new Set(prev);
      n.has(i) ? n.delete(i) : n.add(i);
      return n;
    });

  const reset = () => {
    setPhase("idle");
    setCandidates([]);
    setSelected(new Set());
    setQuery("");
    setError("");
  };

  const doImport = async () => {
    const chosen = candidates.filter((_, i) => selected.has(i));
    if (!chosen.length || importing) return;
    setImporting(true);
    try {
      const r = await fetch(`/api/notebooks/${notebookId}/sources`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ candidates: chosen, label: query.trim() || undefined }),
      });
      if (!r.ok) {
        const d = await r.json();
        throw new Error(d.error || "Import fehlgeschlagen");
      }
      reset();
      onImported();
    } catch (e: any) {
      setError(e.message || String(e));
      setPhase("error");
    } finally {
      setImporting(false);
    }
  };

  return (
    <Ctx.Provider
      value={{
        query,
        setQuery,
        phase,
        candidates,
        selected,
        importing,
        error,
        webSource,
        setWebSource,
        mode,
        setMode,
        run,
        toggle,
        reset,
        doImport,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}
