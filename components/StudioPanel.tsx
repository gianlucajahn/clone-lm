"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import CollapsibleColumn from "./CollapsibleColumn";
import PanelHeader from "./PanelHeader";
import Button from "./Button";
import Icon from "./Icon";
import StudioCard from "./StudioCard";
import NotebookMenu from "./NotebookMenu";
import ArtifactViewer from "./ArtifactViewer";
import QuizSettingsModal from "./QuizSettingsModal";
import MindmapSettingsModal from "./MindmapSettingsModal";
import ReportSettingsModal from "./ReportSettingsModal";
import FlashcardsSettingsModal from "./FlashcardsSettingsModal";
import InfographicSettingsModal from "./InfographicSettingsModal";
import DatatableSettingsModal from "./DatatableSettingsModal";
import Toast from "./Toast";
import { studioItems } from "@/lib/studioItems";
import {
  KIND_META,
  relativeTime,
  type Artifact,
  type ArtifactMeta,
} from "@/lib/studioKinds";
import type { Source } from "@/lib/notebooks";

/** Studio kinds that have a settings ("anpassen") popup behind their chevron. */
const CONFIGURABLE = new Set([
  "quiz",
  "mindmap",
  "report",
  "flashcards",
  "infographic",
  "datatable",
]);

/** Right column — Studio tool grid, generated results + notes, and detail viewer. */
export default function StudioPanel({
  collapsed,
  onToggle,
  notebookId,
  artifacts,
  sources,
  sourceCount,
  onChanged,
  onSourcesChange,
  fullWidth,
}: {
  collapsed: boolean;
  onToggle: () => void;
  notebookId: string;
  artifacts: ArtifactMeta[];
  sources: Source[];
  sourceCount: number;
  onChanged: () => void;
  onSourcesChange: () => void;
  fullWidth?: boolean;
}) {
  const [generating, setGenerating] = useState<string | null>(null);
  const [detail, setDetail] = useState<Artifact | null>(null);
  const [opening, setOpening] = useState<string | null>(null);
  const [creatingNote, setCreatingNote] = useState(false);
  const [configKind, setConfigKind] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  // Studio generation needs at least one source — block it (and the popups) otherwise.
  const requireSources = () => {
    if (sourceCount === 0) {
      setToast("Fügen Sie zuerst eine Quelle hinzu, um Studio-Inhalte zu erstellen.");
      return false;
    }
    return true;
  };

  const generate = async (kind: string, options?: unknown) => {
    if (generating || !requireSources()) return;
    setGenerating(kind);
    try {
      const res = await fetch(`/api/notebooks/${notebookId}/artifacts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind, options }),
      });
      if (res.ok) onChanged();
    } catch {
      /* ignore */
    } finally {
      setGenerating(null);
    }
  };

  const open = async (id: string) => {
    setOpening(id);
    try {
      const res = await fetch(`/api/notebooks/${notebookId}/artifacts/${id}`);
      const d = await res.json();
      if (d.artifact) setDetail(d.artifact);
    } catch {
      /* ignore */
    } finally {
      setOpening(null);
    }
  };

  const createNote = async () => {
    if (creatingNote) return;
    setCreatingNote(true);
    try {
      const res = await fetch(`/api/notebooks/${notebookId}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: "" }),
      });
      const d = await res.json();
      if (d.note) {
        setDetail(d.note);
        onChanged();
      }
    } catch {
      /* ignore */
    } finally {
      setCreatingNote(false);
    }
  };

  const remove = async (id: string) => {
    if (detail?.id === id) setDetail(null);
    await fetch(`/api/notebooks/${notebookId}/artifacts/${id}`, {
      method: "DELETE",
    }).catch(() => {});
    onChanged();
  };

  if (detail) {
    return (
      <CollapsibleColumn collapsed={collapsed} onToggle={onToggle} side="right" title="Studio" fullWidth={fullWidth}>
        <motion.div
          key={detail.id}
          initial={{ opacity: 0, x: 14 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
          style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}
        >
          <ArtifactViewer
            artifact={detail}
            notebookId={notebookId}
            sources={sources}
            onBack={() => setDetail(null)}
            onDelete={() => remove(detail.id)}
            onChanged={onChanged}
            onSourcesChange={onSourcesChange}
          />
        </motion.div>
      </CollapsibleColumn>
    );
  }

  const genMeta = generating ? KIND_META[generating] : null;
  const hasResults = artifacts.length > 0 || !!generating;

  return (
    <CollapsibleColumn collapsed={collapsed} onToggle={onToggle} side="right" title="Studio" fullWidth={fullWidth}>
      <PanelHeader
        title="Studio"
        trailingIcon="right_panel_close"
        padding="14px 20px 12px"
        onTrailingClick={onToggle}
        trailingTooltip={'Bereich „Studio“ minimieren'}
        divider
      />

      <div
        style={{
          padding: "16px 16px 16px",
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: 10,
        }}
      >
        {studioItems.map((item) => (
          <StudioCard
            key={item.label}
            {...item}
            onClick={() => item.kind && generate(item.kind)}
            onConfigure={
              item.kind && CONFIGURABLE.has(item.kind)
                ? () => {
                    if (requireSources()) setConfigKind(item.kind!);
                  }
                : undefined
            }
            generating={!!item.kind && generating === item.kind}
          />
        ))}
      </div>

      <div style={{ height: 1, background: "#e8eaed", flex: "none" }} />

      {hasResults ? (
        <div style={{ flex: 1, overflowY: "auto", padding: "10px 12px 70px" }}>
          {genMeta && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                position: "relative",
                overflow: "hidden",
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "11px 10px",
                borderRadius: 12,
                background: `${genMeta.color}12`,
                marginBottom: 4,
              }}
            >
              <Icon name="autorenew" size={22} color={genMeta.color} className="cl-spin" />
              <div style={{ position: "relative", zIndex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 500, color: "#1f1f1f" }}>
                  {generating === "report" ? "Berichte" : genMeta.label}{" "}
                  {generating === "report" || generating === "flashcards" ? "werden" : "wird"} erstellt…
                </div>
                <div style={{ fontSize: 12.5, color: "#5f6368", marginTop: 1 }}>
                  basierend auf {sourceCount} Quellen
                </div>
                {generating === "infographic" && (
                  <div style={{ fontSize: 12.5, color: "#5f6368", marginTop: 1 }}>
                    Das könnte etwas länger dauern…
                  </div>
                )}
              </div>
              {/* premium left-to-right shine sweep */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  pointerEvents: "none",
                  background:
                    "linear-gradient(100deg, transparent 38%, rgba(255,255,255,0.55) 50%, transparent 62%)",
                  animation: "cl-shine 1.8s ease-in-out infinite",
                }}
              />
            </motion.div>
          )}

          {artifacts.map((a, i) => {
            const meta = KIND_META[a.kind] ?? KIND_META.note;
            const sub =
              a.sourceCount != null && a.sourceCount > 0
                ? `${a.sourceCount} Quellen · ${relativeTime(a.created_at)}`
                : relativeTime(a.created_at);
            return (
              <motion.div
                key={a.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.22, ease: "easeOut", delay: Math.min(i * 0.035, 0.3) }}
                onClick={() => open(a.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "10px 8px",
                  borderRadius: 10,
                  cursor: "pointer",
                  position: "relative",
                  opacity: opening === a.id ? 0.55 : 1,
                  transition: "background-color 120ms ease",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#f4f5fb")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <Icon name={meta.icon} size={22} color={meta.color} fill={a.kind === "note" ? 0 : 1} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 500,
                      color: "#1f1f1f",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {a.title}
                  </div>
                  <div style={{ fontSize: 12.5, color: "#5f6368", marginTop: 1 }}>{sub}</div>
                </div>
                {opening === a.id ? (
                  <span className="cl-spin" style={{ flex: "none", display: "inline-flex", marginRight: 6 }}>
                    <Icon name="progress_activity" size={20} color={meta.color} />
                  </span>
                ) : (
                  <NotebookMenu onDelete={() => remove(a.id)} />
                )}
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "24px 44px",
            textAlign: "center",
          }}
        >
          <Icon name="auto_fix_high" size={30} color="#80868b" weight={300} />
          <div style={{ fontSize: 14, color: "#80868b", fontWeight: 500, marginTop: 14 }}>
            Hier wird die Ausgabe von Studio gespeichert.
          </div>
          <div style={{ fontSize: 13, color: "#5f6368", lineHeight: 1.55, marginTop: 10 }}>
            Wählen Sie oben ein Studio-Tool, um Inhalte aus Ihren Quellen zu
            erstellen, oder speichern Sie eine Chat-Antwort als Notiz.
          </div>
        </div>
      )}

      <Button
        variant="primary"
        icon={creatingNote ? undefined : "edit_square"}
        onClick={createNote}
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 18,
          margin: "0 auto",
          width: "fit-content",
          height: 36,
          borderRadius: 18,
          padding: "0 18px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
        }}
      >
        {creatingNote && (
          <span className="cl-spin" style={{ display: "inline-flex", marginRight: 4 }}>
            <Icon name="progress_activity" size={18} color="#fff" />
          </span>
        )}
        Notiz hinzufügen
      </Button>

      <QuizSettingsModal
        open={configKind === "quiz"}
        onClose={() => setConfigKind(null)}
        onGenerate={(opts) => {
          setConfigKind(null);
          generate("quiz", opts);
        }}
      />
      <MindmapSettingsModal
        open={configKind === "mindmap"}
        onClose={() => setConfigKind(null)}
        onGenerate={(opts) => {
          setConfigKind(null);
          generate("mindmap", opts);
        }}
      />
      <ReportSettingsModal
        open={configKind === "report"}
        onClose={() => setConfigKind(null)}
        notebookId={notebookId}
        onGenerate={(opts) => {
          setConfigKind(null);
          generate("report", opts);
        }}
      />
      <FlashcardsSettingsModal
        open={configKind === "flashcards"}
        onClose={() => setConfigKind(null)}
        onGenerate={(opts) => {
          setConfigKind(null);
          generate("flashcards", opts);
        }}
      />
      <InfographicSettingsModal
        open={configKind === "infographic"}
        onClose={() => setConfigKind(null)}
        onGenerate={(opts) => {
          setConfigKind(null);
          generate("infographic", opts);
        }}
      />
      <DatatableSettingsModal
        open={configKind === "datatable"}
        onClose={() => setConfigKind(null)}
        onGenerate={(opts) => {
          setConfigKind(null);
          generate("datatable", opts);
        }}
      />

      <Toast text={toast} onDone={() => setToast(null)} />
    </CollapsibleColumn>
  );
}
