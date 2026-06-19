"use client";

import { useEffect, useRef, useState } from "react";
import NotebookGlyph from "./NotebookGlyph";
import NotebookMenu from "./NotebookMenu";
import { formatDate, type Notebook } from "@/lib/notebooks";
import styles from "./NotebookCard.module.css";

const CARD_BG = "#EFF1F9";

/** A notebook tile on the collection page, with a three-dots menu and inline rename. */
export default function NotebookCard({
  notebook,
  onOpen,
  onDelete,
  onRename,
}: {
  notebook: Notebook;
  onOpen: (id: string) => void;
  onDelete: (id: string) => void;
  onRename: (id: string, title: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(notebook.title);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [editing]);

  const commit = () => {
    onRename(notebook.id, draft.trim() || "Unbenanntes Notebook");
    setEditing(false);
  };

  return (
    <div
      className={styles.card}
      style={{ background: CARD_BG }}
      onClick={() => {
        if (!editing) onOpen(notebook.id);
      }}
    >
      <div style={{ position: "absolute", top: 12, right: 12 }}>
        <NotebookMenu
          onDelete={() => onDelete(notebook.id)}
          onEdit={() => {
            setDraft(notebook.title);
            setEditing(true);
          }}
        />
      </div>

      <div
        style={{
          width: 48,
          height: 48,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <NotebookGlyph size={44} />
      </div>

      {editing ? (
        <input
          ref={inputRef}
          className={styles.titleInput}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onClick={(e) => e.stopPropagation()}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === "Enter") commit();
            if (e.key === "Escape") {
              setDraft(notebook.title);
              setEditing(false);
            }
          }}
        />
      ) : (
        <div className={styles.title}>{notebook.title}</div>
      )}

      <div className={styles.meta}>
        {formatDate(notebook.created_at)} · {notebook.source_count ?? 0} Quellen
      </div>
    </div>
  );
}
