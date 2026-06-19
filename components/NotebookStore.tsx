"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { Notebook } from "@/lib/notebooks";

interface Store {
  notebooks: Notebook[];
  loading: boolean;
  get: (id: string) => Notebook | undefined;
  /** create a new notebook, returns its id (or null on failure) */
  create: () => Promise<string | null>;
  rename: (id: string, title: string) => void;
  remove: (id: string) => void;
  /** id of the just-created notebook (so its page can auto-open "add source") */
  justCreated: string | null;
  clearJustCreated: () => void;
}

const Ctx = createContext<Store | null>(null);

/** DB-backed notebook collection (reads /api/notebooks). */
export function NotebookStoreProvider({ children }: { children: ReactNode }) {
  const [notebooks, setNotebooks] = useState<Notebook[]>([]);
  const [loading, setLoading] = useState(true);
  const [justCreated, setJustCreated] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    fetch("/api/notebooks")
      .then((r) => r.json())
      .then((d) => {
        if (alive) setNotebooks(d.notebooks ?? []);
      })
      .catch(() => {})
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, []);

  const create = async () => {
    const r = await fetch("/api/notebooks", { method: "POST" });
    if (!r.ok) return null;
    const { notebook } = await r.json();
    setNotebooks((prev) => [notebook, ...prev]);
    setJustCreated(notebook.id);
    return notebook.id as string;
  };

  const rename = (id: string, title: string) => {
    setNotebooks((prev) => prev.map((n) => (n.id === id ? { ...n, title } : n)));
    fetch(`/api/notebooks/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    }).catch(() => {});
  };

  const remove = async (id: string) => {
    // Optimistically remove, but restore the row if the server delete fails so
    // the UI never claims success when the notebook is still in the database.
    let snapshot: Notebook[] = [];
    setNotebooks((prev) => {
      snapshot = prev;
      return prev.filter((n) => n.id !== id);
    });
    try {
      const r = await fetch(`/api/notebooks/${id}`, { method: "DELETE" });
      if (!r.ok) throw new Error(`delete failed (${r.status})`);
    } catch {
      setNotebooks(snapshot);
    }
  };

  return (
    <Ctx.Provider
      value={{
        notebooks,
        loading,
        get: (id) => notebooks.find((n) => n.id === id),
        create,
        rename,
        remove,
        justCreated,
        clearJustCreated: () => setJustCreated(null),
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useNotebooks() {
  const ctx = useContext(Ctx);
  if (!ctx)
    throw new Error("useNotebooks must be used within NotebookStoreProvider");
  return ctx;
}
