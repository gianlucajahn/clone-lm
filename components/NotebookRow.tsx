"use client";

import { useEffect, useRef, useState } from "react";
import NotebookGlyph from "./NotebookGlyph";
import NotebookMenu from "./NotebookMenu";
import { formatDate, type Notebook } from "@/lib/notebooks";
import styles from "./NotebookRow.module.css";

/** A notebook row in the list (table) view, with the same menu + inline rename. */
export default function NotebookRow({
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
      className={styles.row}
      onClick={() => {
        if (!editing) onOpen(notebook.id);
      }}
    >
      <div className={styles.titleCell}>
        <div
          style={{
            width: 24,
            height: 24,
            flex: "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <NotebookGlyph size={22} />
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
          <span className={styles.title}>{notebook.title}</span>
        )}
      </div>

      <div className={styles.cell}>{notebook.source_count ?? 0} Quellen</div>
      <div className={styles.cell}>{formatDate(notebook.created_at)}</div>
      <div className={styles.cell}>Owner</div>
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <NotebookMenu
          onDelete={() => onDelete(notebook.id)}
          onEdit={() => {
            setDraft(notebook.title);
            setEditing(true);
          }}
        />
      </div>
    </div>
  );
}
