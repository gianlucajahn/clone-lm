"use client";

import { useEffect, useState } from "react";
import ModalShell from "./ModalShell";
import IconButton from "./IconButton";
import Icon from "./Icon";
import { studioTitle, studioLabel } from "./studioControls";

interface Fmt {
  title: string;
  desc: string;
  custom?: boolean;
  noPencil?: boolean;
}

const FIXED: Fmt[] = [
  {
    title: "Eigenen Bericht erstellen",
    desc: "Berichte nach eigenen Vorstellungen erstellen und Angaben zu Aufbau, Stil, Ton und mehr machen",
    custom: true,
    noPencil: true,
  },
  { title: "Überblick", desc: "Übersicht über Ihre Quellen mit wichtigen Informationen und Zitaten" },
  {
    title: "Lernplan",
    desc: "Quiz mit kurzen Antworten, vorgeschlagene Essay-Fragestellungen und Glossar mit Schlüsselbegriffen",
  },
  {
    title: "Blogpost",
    desc: "Aufschlussreiche Kernpunkte, zusammengefasst in einem leicht verständlichen Artikel",
  },
];

function FormatCard({ fmt, onClick }: { fmt: Fmt; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={(e) => (e.currentTarget.style.background = "#ece9dd")}
      onMouseLeave={(e) => (e.currentTarget.style.background = "#f4f2ea")}
      style={{
        position: "relative",
        textAlign: "left",
        background: "#f4f2ea",
        border: "none",
        borderRadius: 12,
        padding: "16px 16px 18px",
        minHeight: 124,
        cursor: "pointer",
        fontFamily: "inherit",
        transition: "background-color 120ms ease",
      }}
    >
      {!fmt.noPencil && (
        <span
          style={{
            position: "absolute",
            top: 12,
            right: 12,
            width: 30,
            height: 30,
            borderRadius: "50%",
            background: "rgba(0,0,0,0.05)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon name="edit" size={17} color="#5f6368" />
        </span>
      )}
      <div
        style={{
          fontSize: 15.5,
          fontWeight: 500,
          color: "#1f1f1f",
          lineHeight: 1.3,
          marginBottom: 10,
          paddingRight: fmt.noPencil ? 0 : 34,
        }}
      >
        {fmt.title}
      </div>
      <div
        style={{
          fontSize: 13.5,
          color: "#5f6368",
          lineHeight: 1.45,
          display: "-webkit-box",
          WebkitLineClamp: 3,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }}
      >
        {fmt.desc}
      </div>
    </button>
  );
}

function SkeletonCard() {
  return (
    <div style={{ background: "#f4f2ea", borderRadius: 12, padding: "16px 16px 18px", minHeight: 124 }}>
      <span className="cl-skeleton" style={{ display: "block", height: 14, width: "70%", borderRadius: 6, marginBottom: 14 }} />
      <span className="cl-skeleton" style={{ display: "block", height: 11, width: "100%", borderRadius: 5, marginBottom: 7 }} />
      <span className="cl-skeleton" style={{ display: "block", height: 11, width: "92%", borderRadius: 5, marginBottom: 7 }} />
      <span className="cl-skeleton" style={{ display: "block", height: 11, width: "60%", borderRadius: 5 }} />
    </div>
  );
}

/** Per-option "Bericht erstellen" popup: fixed formats + source-tailored suggestions. */
export default function ReportSettingsModal({
  open,
  onClose,
  notebookId,
  onGenerate,
}: {
  open: boolean;
  onClose: () => void;
  notebookId: string;
  onGenerate: (opts: { format?: string; formatDesc?: string; custom?: boolean }) => void;
}) {
  const [suggestions, setSuggestions] = useState<Fmt[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!open) return;
    let alive = true;
    setLoading(true);
    setSuggestions([]);
    fetch(`/api/notebooks/${notebookId}/report-formats`)
      .then((r) => r.json())
      .then((d) => {
        if (alive) setSuggestions(d.formats ?? []);
      })
      .catch(() => {})
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [open, notebookId]);

  const pick = (f: Fmt) =>
    onGenerate(f.custom ? { custom: true } : { format: f.title, formatDesc: f.desc });

  const grid: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: 14,
  };

  return (
    <ModalShell open={open} onClose={onClose} width={920}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 14,
          padding: "18px 16px 18px 24px",
          borderBottom: "1px solid #e1e3e8",
        }}
      >
        <Icon name="summarize" size={24} color="#796731" fill={1} />
        <div style={{ flex: 1, ...studioTitle }}>Bericht erstellen</div>
        <IconButton name="close" size={40} iconSize={24} iconColor="#444746" hoverBg="rgba(0,0,0,0.06)" onClick={onClose} />
      </div>

      {/* Body */}
      <div className="cl-scroll" style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: "20px 24px 24px" }}>
        <div style={{ ...studioLabel, marginBottom: 12 }}>Format</div>
        <div style={grid}>
          {FIXED.map((f) => (
            <FormatCard key={f.title} fmt={f} onClick={() => pick(f)} />
          ))}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8, margin: "24px 0 12px" }}>
          <Icon name="auto_fix_high" size={20} color="#444746" />
          <span style={studioLabel}>Formatvorschläge</span>
        </div>
        <div style={grid}>
          {loading
            ? [0, 1, 2, 3].map((i) => <SkeletonCard key={i} />)
            : suggestions.map((f, i) => <FormatCard key={i} fmt={f} onClick={() => pick(f)} />)}
        </div>
      </div>
    </ModalShell>
  );
}
