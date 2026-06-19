"use client";

import { useState } from "react";
import TopBar from "./TopBar";
import SourcesPanel from "./SourcesPanel";
import ChatPanel from "./ChatPanel";
import StudioPanel from "./StudioPanel";
import CreateNotebookModal from "./CreateNotebookModal";
import CustomizeNotebookModal from "./CustomizeNotebookModal";
import Toast from "./Toast";
import { ResearchProvider } from "./ResearchStore";
import { useViewport } from "@/lib/useViewport";
import Icon from "./Icon";
import type { ChatMessage, Source } from "@/lib/notebooks";
import type { ArtifactMeta } from "@/lib/studioKinds";

/** The single-notebook editor: top bar + the three panels + its modals. */
export default function NotebookView({
  notebookId,
  name,
  onName,
  createdAt,
  initialSummary,
  cover,
  onUploadCover,
  sources,
  onSourcesChange,
  messages,
  artifacts,
  onSaveNote,
  onArtifactsChanged,
  loading,
  onCreateNotebook,
  onGoToList,
  sourceModalOpen,
  onOpenSource,
  onCloseSource,
  customizeOpen,
  onOpenCustomize,
  onCloseCustomize,
}: {
  notebookId: string;
  name: string;
  onName: (next: string) => void;
  createdAt: string;
  initialSummary?: string;
  cover?: string | null;
  onUploadCover: (dataUrl: string) => void;
  sources: Source[];
  onSourcesChange: () => void;
  messages: ChatMessage[];
  artifacts: ArtifactMeta[];
  onSaveNote: (content: string) => void;
  onArtifactsChanged: () => void;
  loading?: boolean;
  onCreateNotebook: () => void;
  onGoToList: () => void;
  sourceModalOpen: boolean;
  onOpenSource: () => void;
  onCloseSource: () => void;
  customizeOpen: boolean;
  onOpenCustomize: () => void;
  onCloseCustomize: () => void;
}) {
  const [sourcesCollapsed, setSourcesCollapsed] = useState(false);
  const [studioCollapsed, setStudioCollapsed] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [tab, setTab] = useState<"sources" | "chat" | "studio">("chat");
  const compact = useViewport() < 1024;

  const applyCustomize = async (summary: string) => {
    await fetch(`/api/notebooks/${notebookId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ summary }),
    }).catch(() => {});
    setToast("Notebook wurde aktualisiert");
  };

  return (
    <ResearchProvider notebookId={notebookId} onImported={onSourcesChange} onRunStart={onCloseSource}>
    <div
      style={{
        width: "100vw",
        height: "100vh",
        background: "#EDEFFA",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        color: "#1f1f1f",
        fontFamily: "'Roboto', Arial, sans-serif",
      }}
    >
      <TopBar
        name={name}
        onName={onName}
        onCreate={onCreateNotebook}
        onLogoClick={onGoToList}
        loading={loading}
        compact={compact}
      />

      {compact && (
        <div
          style={{
            flex: "none",
            display: "flex",
            gap: 6,
            padding: "0 12px 6px",
          }}
        >
          {(
            [
              { key: "sources", label: "Quellen", icon: "description" },
              { key: "chat", label: "Chat", icon: "chat_bubble" },
              { key: "studio", label: "Studio", icon: "auto_awesome" },
            ] as const
          ).map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                height: 40,
                border: "none",
                borderRadius: 12,
                cursor: "pointer",
                fontFamily: "inherit",
                fontSize: 14,
                fontWeight: 500,
                background: tab === t.key ? "#fff" : "transparent",
                color: tab === t.key ? "#1f1f1f" : "#5f6368",
                boxShadow: tab === t.key ? "0 1px 3px rgba(0,0,0,0.12)" : "none",
              }}
            >
              <Icon name={t.icon} size={19} color={tab === t.key ? "#1a73e8" : "#5f6368"} fill={tab === t.key ? 1 : 0} />
              {t.label}
            </button>
          ))}
        </div>
      )}

      <div
        style={{
          flex: 1,
          display: "flex",
          gap: compact ? 0 : 15,
          padding: compact ? "0 10px 10px" : "3px 20px 5px 17px",
          minHeight: 0,
        }}
      >
        {(!compact || tab === "sources") && (
          <SourcesPanel
            collapsed={sourcesCollapsed}
            onToggle={() => setSourcesCollapsed((c) => !c)}
            notebookId={notebookId}
            sources={sources}
            onSourcesChange={onSourcesChange}
            onAddSource={onOpenSource}
            loading={loading}
            fullWidth={compact}
          />
        )}
        {(!compact || tab === "chat") && (
          <ChatPanel
            notebookId={notebookId}
            name={name}
            onName={onName}
            onCustomize={onOpenCustomize}
            onSaveNote={onSaveNote}
            sourceCount={sources.length}
            createdAt={createdAt}
            initialMessages={messages}
            loading={loading}
          />
        )}
        {(!compact || tab === "studio") && (
          <StudioPanel
            collapsed={studioCollapsed}
            onToggle={() => setStudioCollapsed((c) => !c)}
            notebookId={notebookId}
            artifacts={artifacts}
            sources={sources}
            sourceCount={sources.length}
            onChanged={onArtifactsChanged}
            onSourcesChange={onSourcesChange}
            fullWidth={compact}
          />
        )}
      </div>

      <div
        style={{
          flex: "none",
          textAlign: "center",
          fontSize: 12,
          color: "#80868b",
          paddingBottom: 8,
        }}
      >
        LM Clone kann Fehler machen, überprüfen Sie daher die Antworten.
      </div>

      <CreateNotebookModal
        open={sourceModalOpen}
        onClose={onCloseSource}
        notebookId={notebookId}
        onImported={onSourcesChange}
      />
      <CustomizeNotebookModal
        open={customizeOpen}
        onClose={onCloseCustomize}
        name={name}
        onName={onName}
        initialSummary={initialSummary}
        initialCover={cover}
        onApply={applyCustomize}
        onUploadCover={onUploadCover}
      />

      <Toast text={toast} onDone={() => setToast(null)} />
    </div>
    </ResearchProvider>
  );
}
