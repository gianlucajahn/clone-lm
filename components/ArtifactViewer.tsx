"use client";

import { useState } from "react";
import Icon from "./Icon";
import ArtifactBody from "./ArtifactRenderers";
import NoteEditor from "./NoteEditor";
import NotebookMenu from "./NotebookMenu";
import FeedbackModal from "./FeedbackModal";
import Favicon from "./Favicon";
import { KIND_META, type Artifact } from "@/lib/studioKinds";
import type { Source } from "@/lib/notebooks";
import styles from "./studio.module.css";
import Toast from "./Toast";

/** Full-panel detail view for a single Studio artifact. */
export default function ArtifactViewer({
  artifact,
  notebookId,
  sources,
  onBack,
  onDelete,
  onChanged,
  onSourcesChange,
}: {
  artifact: Artifact;
  notebookId: string;
  sources: Source[];
  onBack: () => void;
  onDelete: () => void;
  onChanged: () => void;
  onSourcesChange: () => void;
}) {
  const meta = KIND_META[artifact.kind] ?? KIND_META.note;
  const isNote = artifact.kind === "note";
  const [vote, setVote] = useState<"up" | "down" | null>(null);
  const [feedback, setFeedback] = useState<{ open: boolean; type: "up" | "down" }>({
    open: false,
    type: "up",
  });
  const [toast, setToast] = useState<string | null>(null);
  const [sourcesOpen, setSourcesOpen] = useState(false);


  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
      {/* breadcrumb */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "14px 20px 10px",
        }}
      >
        <div className={styles.breadcrumb}>
          <span className={styles.crumbLink} onClick={onBack}>
            Studio
          </span>
          <Icon name="chevron_right" size={18} color="#9aa0a6" />
          <span style={{ color: "#1f1f1f" }}>{isNote ? "Notiz" : "App"}</span>
        </div>
        <button
          className={styles.tbtn}
          onClick={onBack}
          aria-label="Schließen"
          style={{ width: 32, height: 32 }}
        >
          <Icon name="close_fullscreen" size={18} color="#444746" />
        </button>
      </div>

      {isNote ? (
        <>
          <div style={{ height: 1, background: "#e8eaed" }} />
          <NoteEditor
            artifact={artifact}
            notebookId={notebookId}
            onDelete={onDelete}
            onChanged={onChanged}
            onSourcesChange={onSourcesChange}
          />
        </>
      ) : (
        <>
          {/* title + menu */}
          <div style={{ padding: "2px 20px 10px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Icon name={meta.icon} size={22} color={meta.color} fill={1} />
              <div style={{ flex: 1, fontSize: 20, fontWeight: 500, color: "#1f1f1f", lineHeight: 1.3 }}>
                {artifact.title}
              </div>
              <NotebookMenu onDelete={onDelete} />
            </div>

            {/* sources dropdown */}
            {artifact.sourceCount != null && artifact.sourceCount > 0 && (
              <div style={{ marginTop: 10, position: "relative" }}>
                <button className={styles.sourcesBtn} onClick={() => setSourcesOpen((o) => !o)}>
                  <Icon name="description" size={16} color="#5f6368" />
                  {artifact.sourceCount} Quellen ansehen
                  <Icon name={sourcesOpen ? "expand_less" : "expand_more"} size={18} color="#5f6368" />
                </button>
                {sourcesOpen && (
                  <div
                    style={{
                      position: "absolute",
                      top: 40,
                      left: 0,
                      width: 320,
                      maxHeight: 280,
                      overflowY: "auto",
                      background: "#fff",
                      border: "1px solid #e0e2e6",
                      borderRadius: 12,
                      boxShadow: "0 6px 24px rgba(0,0,0,0.16)",
                      zIndex: 40,
                      padding: "6px 0",
                    }}
                  >
                    {sources.length === 0 ? (
                      <div style={{ padding: "12px 16px", fontSize: 13, color: "#5f6368" }}>
                        Keine Quellen vorhanden.
                      </div>
                    ) : (
                      sources.map((s) => (
                        <a
                          key={s.id}
                          href={s.url ?? undefined}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            display: "flex",
                            alignItems: "flex-start",
                            gap: 10,
                            padding: "9px 14px",
                            textDecoration: "none",
                            color: "#1f1f1f",
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = "#f4f5fb")}
                          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                        >
                          <span style={{ flex: "none", marginTop: 1, display: "inline-flex" }}>
                            <Favicon url={s.url} size={18} />
                          </span>
                          <div style={{ minWidth: 0 }}>
                            <div
                              style={{
                                fontSize: 13.5,
                                lineHeight: 1.3,
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                display: "-webkit-box",
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: "vertical",
                              }}
                            >
                              {s.title}
                            </div>
                            {s.url && (
                              <div style={{ fontSize: 12, color: "#1a73e8", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                {(() => {
                                  try {
                                    return new URL(s.url).hostname.replace(/^www\./, "");
                                  } catch {
                                    return s.url;
                                  }
                                })()}
                              </div>
                            )}
                          </div>
                        </a>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          <div style={{ height: 1, background: "#e8eaed" }} />

          <div style={{ flex: 1, minHeight: 0, padding: "12px 20px 0" }}>
            <ArtifactBody artifact={artifact} />
          </div>

          {/* feedback bar */}
          <div
            style={{
              display: "flex",
              gap: 12,
              padding: "12px 20px 16px",
              borderTop: "1px solid #e8eaed",
            }}
          >
            <button className={styles.feedbackBtn} onClick={() => setFeedback({ open: true, type: "up" })}>
              <Icon name="thumb_up" size={18} color={vote === "up" ? "#1a73e8" : "#444746"} fill={vote === "up" ? 1 : 0} />
              Guter Inhalt
            </button>
            <button className={styles.feedbackBtn} onClick={() => setFeedback({ open: true, type: "down" })}>
              <Icon name="thumb_down" size={18} color={vote === "down" ? "#1a73e8" : "#444746"} fill={vote === "down" ? 1 : 0} />
              Schlechter Inhalt
            </button>
          </div>

          <FeedbackModal
            open={feedback.open}
            type={feedback.type}
            onClose={() => setFeedback((f) => ({ ...f, open: false }))}
            onSend={() => {
              setVote(feedback.type);
              setFeedback((f) => ({ ...f, open: false }));
              setToast("Vielen Dank für Ihr Feedback!");
            }}
          />
        </>
      )}

      <Toast text={toast} onDone={() => setToast(null)} />
    </div>
  );
}
