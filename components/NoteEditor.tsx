"use client";

import { useEffect, useRef, useState } from "react";
import Icon from "./Icon";
import { type Artifact } from "@/lib/studioKinds";
import styles from "./studio.module.css";
import Toast from "./Toast";

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

const HEADINGS: { label: string; block: string }[] = [
  { label: "Normal", block: "P" },
  { label: "Überschrift 1", block: "H1" },
  { label: "Überschrift 2", block: "H2" },
  { label: "Überschrift 3", block: "H3" },
];

/** Functional rich-text editor for a Notiz artifact. Autosaves to Supabase. */
export default function NoteEditor({
  artifact,
  notebookId,
  onDelete,
  onChanged,
  onSourcesChange,
}: {
  artifact: Artifact;
  notebookId: string;
  onDelete: () => void;
  onChanged: () => void;
  onSourcesChange: () => void;
}) {
  const editorRef = useRef<HTMLDivElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [title, setTitle] = useState(artifact.title === "Neue Notiz" ? "" : artifact.title);
  const [saved, setSaved] = useState(true);
  const [headingOpen, setHeadingOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const initialHtml =
    artifact.data?.html ||
    (artifact.data?.text
      ? artifact.data.text
          .split(/\n\n+/)
          .map((p: string) => `<p>${escapeHtml(p).replace(/\n/g, "<br>")}</p>`)
          .join("")
      : "");

  useEffect(() => {
    if (editorRef.current) editorRef.current.innerHTML = initialHtml;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  const save = async () => {
    const html = editorRef.current?.innerHTML ?? "";
    const text = editorRef.current?.innerText ?? "";
    await fetch(`/api/notebooks/${notebookId}/artifacts/${artifact.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: title.trim() || "Neue Notiz",
        data: { ...artifact.data, text, html },
      }),
    }).catch(() => {});
    setSaved(true);
    onChanged();
  };

  const scheduleSave = () => {
    setSaved(false);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(save, 800);
  };

  const exec = (cmd: string, val?: string) => {
    editorRef.current?.focus();
    document.execCommand(cmd, false, val);
    scheduleSave();
  };

  const insertCode = () => {
    editorRef.current?.focus();
    const text = window.getSelection()?.toString() ?? "";
    document.execCommand("insertHTML", false, `<code>${escapeHtml(text) || "Code"}</code>`);
    scheduleSave();
  };

  const addLink = () => {
    const url = window.prompt("Link-URL:");
    if (url) exec("createLink", url);
  };

  const setAsSource = async () => {
    const text = editorRef.current?.innerText ?? "";
    await fetch(`/api/notebooks/${notebookId}/sources`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        candidates: [{ title: title.trim() || "Notiz", url: null, snippet: text }],
      }),
    }).catch(() => {});
    onSourcesChange();
    setToast("Als Quelle festgelegt");
  };

  const Tbtn = ({ icon, onAct, title: t }: { icon: string; onAct: () => void; title: string }) => (
    <button
      className={styles.tbtn}
      title={t}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onAct}
    >
      <Icon name={icon} size={18} color="#444746" />
    </button>
  );

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
      {/* title + delete */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "4px 20px 12px" }}>
        <input
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            scheduleSave();
          }}
          placeholder="Titel"
          style={{
            flex: 1,
            border: "none",
            outline: "none",
            fontSize: 22,
            fontWeight: 500,
            color: "#1f1f1f",
            fontFamily: "inherit",
            background: "transparent",
          }}
        />
        <button className={styles.tbtn} title="Notiz löschen" onClick={onDelete} style={{ width: 36, height: 36 }}>
          <Icon name="delete" size={20} color="#444746" />
        </button>
      </div>

      {/* toolbar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 2,
          padding: "8px 16px",
          borderTop: "1px solid #e8eaed",
          borderBottom: "1px solid #e8eaed",
          flexWrap: "wrap",
        }}
      >
        <Tbtn icon="undo" onAct={() => exec("undo")} title="Rückgängig" />
        <Tbtn icon="redo" onAct={() => exec("redo")} title="Wiederholen" />
        <div style={{ width: 1, height: 22, background: "#e0e2e6", margin: "0 6px" }} />

        {/* heading dropdown */}
        <div style={{ position: "relative" }}>
          <button
            className={styles.tbtn}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => setHeadingOpen((o) => !o)}
            style={{ width: "auto", padding: "0 8px", gap: 4, fontSize: 13.5, color: "#1f1f1f", fontFamily: "inherit" }}
          >
            <Icon name="expand_more" size={18} color="#444746" />
            Normal
          </button>
          {headingOpen && (
            <div
              style={{
                position: "absolute",
                top: 36,
                left: 0,
                background: "#fff",
                border: "1px solid #e0e2e6",
                borderRadius: 8,
                boxShadow: "0 4px 16px rgba(0,0,0,0.16)",
                zIndex: 30,
                padding: "4px 0",
                minWidth: 160,
              }}
            >
              {HEADINGS.map((h) => (
                <div
                  key={h.block}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    exec("formatBlock", h.block);
                    setHeadingOpen(false);
                  }}
                  style={{ padding: "8px 14px", fontSize: 14, cursor: "pointer", color: "#1f1f1f" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#f1f3f4")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  {h.label}
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ width: 1, height: 22, background: "#e0e2e6", margin: "0 6px" }} />
        <Tbtn icon="format_bold" onAct={() => exec("bold")} title="Fett" />
        <Tbtn icon="format_italic" onAct={() => exec("italic")} title="Kursiv" />
        <Tbtn icon="link" onAct={addLink} title="Link" />
        <Tbtn icon="code" onAct={insertCode} title="Code" />
        <Tbtn icon="data_object" onAct={() => exec("formatBlock", "PRE")} title="Codeblock" />
        <div style={{ width: 1, height: 22, background: "#e0e2e6", margin: "0 6px" }} />
        <Tbtn icon="format_list_bulleted" onAct={() => exec("insertUnorderedList")} title="Aufzählung" />
        <Tbtn icon="format_list_numbered" onAct={() => exec("insertOrderedList")} title="Nummerierte Liste" />
        <Tbtn icon="format_quote" onAct={() => exec("formatBlock", "BLOCKQUOTE")} title="Zitat" />
        <Tbtn icon="horizontal_rule" onAct={() => exec("insertHorizontalRule")} title="Trennlinie" />
        <Tbtn icon="format_clear" onAct={() => exec("removeFormat")} title="Formatierung entfernen" />
      </div>

      {/* editor */}
      <div style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: "18px 20px" }}>
        <div
          ref={editorRef}
          className={styles.noteEditor}
          contentEditable
          suppressContentEditableWarning
          data-placeholder="Schreiben Sie Ihre Notiz…"
          onInput={scheduleSave}
        />
      </div>

      {/* footer */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "12px 20px",
          borderTop: "1px solid #e8eaed",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#5f6368" }}>
          <Icon name={saved ? "cloud_done" : "cloud_sync"} size={18} color="#5f6368" />
          {saved ? "Automatisch gespeichert" : "Wird gespeichert…"}
        </div>
        <button className={styles.sourcesBtn} onClick={setAsSource}>
          <Icon name="note_stack_add" size={16} color="#5f6368" />
          Als Quelle festlegen
        </button>
      </div>

      <Toast text={toast} onDone={() => setToast(null)} />
    </div>
  );
}
