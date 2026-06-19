"use client";

import { useEffect, useRef, useState } from "react";
import NotebookGlyph from "./NotebookGlyph";
import NotebookMenu from "./NotebookMenu";
import Icon from "./Icon";
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
  const [loading, setLoading] = useState(false);
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

  // Swap the glyph for a spinner the moment the row is opened — the notebook
  // route can take 1–2s to load while the list stays mounted.
  const open = () => {
    if (editing || loading) return;
    setLoading(true);
    onOpen(notebook.id);
  };

  return (
    <div
      className={styles.row}
      style={{ cursor: loading ? "default" : undefined }}
      aria-busy={loading}
      onClick={open}
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
          {loading ? (
            <span className="cl-spin" style={{ display: "inline-flex" }}>
              <Icon name="progress_activity" size={20} color="#3d5afe" />
            </span>
          ) : (
            <NotebookGlyph size={22} />
          )}
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
