"use client";

import { useRef, useState } from "react";
import Icon from "./Icon";
import Markdown from "./Markdown";
import MindmapView from "./MindmapView";
import type { Artifact } from "@/lib/studioKinds";
import styles from "./studio.module.css";

/* ===================== Report ===================== */

function ReportView({ artifact }: { artifact: Artifact }) {
  return (
    <div style={{ height: "100%", overflow: "auto", padding: "4px 8px 24px" }}>
      <div className={styles.report}>
        <Markdown text={artifact.data?.markdown ?? ""} />
      </div>
    </div>
  );
}

/* ===================== Flashcards ===================== */

function Flashcard({ front, back }: { front: string; back: string }) {
  const [flipped, setFlipped] = useState(false);
  return (
    <div
      className={`${styles.flip}${flipped ? ` ${styles.flipped}` : ""}`}
      onClick={() => setFlipped((f) => !f)}
    >
      <div className={styles.flipInner}>
        <div className={`${styles.flipFace} ${styles.flipFront}`}>{front}</div>
        <div className={`${styles.flipFace} ${styles.flipBack}`}>{back}</div>
      </div>
    </div>
  );
}

function FlashcardsView({ artifact }: { artifact: Artifact }) {
  const cards: { front: string; back: string }[] = artifact.data?.cards ?? [];
  return (
    <div style={{ height: "100%", overflow: "auto", padding: "4px 4px 24px" }}>
      <div style={{ fontSize: 13, color: "#5f6368", marginBottom: 12 }}>
        Tippen Sie auf eine Karte, um sie umzudrehen.
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
          gap: 14,
        }}
      >
        {cards.map((c, i) => (
          <Flashcard key={i} front={c.front} back={c.back} />
        ))}
      </div>
    </div>
  );
}

/* ===================== Quiz ===================== */

interface QQ {
  question: string;
  options: string[];
  answer: number;
  explanation?: string;
}

function QuizView({ artifact }: { artifact: Artifact }) {
  const questions: QQ[] = artifact.data?.questions ?? [];
  const [picks, setPicks] = useState<Record<number, number>>({});

  return (
    <div style={{ height: "100%", overflow: "auto", padding: "4px 4px 24px" }}>
      {questions.map((q, qi) => {
        const picked = picks[qi];
        const answered = picked !== undefined;
        return (
          <div key={qi} style={{ marginBottom: 26 }}>
            <div style={{ fontSize: 15, fontWeight: 500, color: "#1f1f1f", marginBottom: 12 }}>
              {qi + 1}. {q.question}
            </div>
            {q.options.map((opt, oi) => {
              let cls = styles.qOption;
              if (answered && oi === q.answer) cls += ` ${styles.qCorrect}`;
              else if (answered && oi === picked) cls += ` ${styles.qWrong}`;
              return (
                <button
                  key={oi}
                  className={cls}
                  onClick={() => !answered && setPicks((p) => ({ ...p, [qi]: oi }))}
                  disabled={answered}
                >
                  <Icon
                    name={
                      answered && oi === q.answer
                        ? "check_circle"
                        : answered && oi === picked
                        ? "cancel"
                        : "radio_button_unchecked"
                    }
                    size={20}
                    color={
                      answered && oi === q.answer
                        ? "#1a7a3e"
                        : answered && oi === picked
                        ? "#c5392e"
                        : "#9aa0a6"
                    }
                  />
                  {opt}
                </button>
              );
            })}
            {answered && q.explanation && (
              <div style={{ fontSize: 13.5, color: "#5f6368", lineHeight: 1.5, marginTop: 4 }}>
                {q.explanation}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ===================== Data table ===================== */

function DatatableView({ artifact }: { artifact: Artifact }) {
  const columns: string[] = artifact.data?.columns ?? [];
  const rows: string[][] = artifact.data?.rows ?? [];
  return (
    <div style={{ height: "100%", overflow: "auto", padding: "4px 4px 24px" }}>
      <table className={styles.table}>
        <thead>
          <tr>
            {columns.map((c, i) => (
              <th key={i}>{c}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, ri) => (
            <tr key={ri}>
              {r.map((cell, ci) => (
                <td key={ci}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ===================== Infographic (SVG image) ===================== */

function InfographicSections({ artifact }: { artifact: Artifact }) {
  const subtitle: string = artifact.data?.subtitle ?? "";
  const sections: { heading: string; text: string; stat?: string }[] =
    artifact.data?.sections ?? [];
  return (
    <div style={{ height: "100%", overflow: "auto", padding: "4px 4px 24px" }}>
      {subtitle && (
        <div style={{ fontSize: 15, color: "#5f6368", marginBottom: 18, lineHeight: 1.5 }}>
          {subtitle}
        </div>
      )}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 14 }}>
        {sections.map((s, i) => (
          <div key={i} style={{ background: "#f6f7fc", border: "1px solid #e6e8f4", borderRadius: 14, padding: 16 }}>
            {s.stat && (
              <div style={{ fontSize: 24, fontWeight: 700, color: "#3d5afe", marginBottom: 6 }}>{s.stat}</div>
            )}
            <div style={{ fontSize: 15, fontWeight: 600, color: "#1f1f1f", marginBottom: 6 }}>{s.heading}</div>
            <div style={{ fontSize: 13.5, color: "#3c4043", lineHeight: 1.5 }}>{s.text}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function InfographicView({ artifact }: { artifact: Artifact }) {
  const svg: string | undefined = artifact.data?.svg;
  const wrapRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);

  if (!svg) return <InfographicSections artifact={artifact} />;

  const downloadSvg = () => {
    const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${artifact.title}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadPng = () => {
    const svgEl = wrapRef.current?.querySelector("svg");
    if (!svgEl) return;
    const xml = new XMLSerializer().serializeToString(svgEl);
    const url = URL.createObjectURL(new Blob([xml], { type: "image/svg+xml;charset=utf-8" }));
    const img = new Image();
    img.onload = () => {
      const vb = (svgEl as SVGSVGElement).viewBox?.baseVal;
      const w = vb && vb.width ? vb.width : 800;
      const h = vb && vb.height ? vb.height : 1120;
      const canvas = document.createElement("canvas");
      canvas.width = w * 2;
      canvas.height = h * 2;
      const c = canvas.getContext("2d");
      if (!c) {
        URL.revokeObjectURL(url);
        return;
      }
      c.fillStyle = "#fff";
      c.fillRect(0, 0, canvas.width, canvas.height);
      c.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      canvas.toBlob((b) => {
        if (!b) return;
        const u = URL.createObjectURL(b);
        const a = document.createElement("a");
        a.href = u;
        a.download = `${artifact.title}.png`;
        a.click();
        URL.revokeObjectURL(u);
      }, "image/png");
    };
    img.src = url;
  };

  return (
    <div style={{ position: "relative", height: "100%" }}>
      <div style={{ position: "absolute", right: 4, top: 4, display: "flex", flexDirection: "column", gap: 8, zIndex: 5 }}>
        <button className={styles.ctrlBtn} onClick={() => setZoom((z) => Math.min(2, +(z + 0.15).toFixed(2)))} aria-label="Vergrößern">
          <Icon name="add" size={20} color="#444746" />
        </button>
        <button className={styles.ctrlBtn} onClick={() => setZoom((z) => Math.max(0.5, +(z - 0.15).toFixed(2)))} aria-label="Verkleinern">
          <Icon name="remove" size={20} color="#444746" />
        </button>
        <button className={styles.ctrlBtn} onClick={downloadPng} aria-label="Als PNG herunterladen">
          <Icon name="image" size={20} color="#444746" />
        </button>
        <button className={styles.ctrlBtn} onClick={downloadSvg} aria-label="Als SVG herunterladen">
          <Icon name="download" size={20} color="#444746" />
        </button>
      </div>
      <div style={{ height: "100%", overflow: "auto", display: "flex", justifyContent: "center", padding: "6px 8px 24px" }}>
        <div
          ref={wrapRef}
          className={styles.svgWrap}
          style={{ transform: `scale(${zoom})`, transformOrigin: "top center" }}
          dangerouslySetInnerHTML={{ __html: svg }}
        />
      </div>
    </div>
  );
}

/* ===================== Note ===================== */

function NoteView({ artifact }: { artifact: Artifact }) {
  return (
    <div style={{ height: "100%", overflow: "auto", padding: "4px 8px 24px" }}>
      <div style={{ fontSize: 14.5, lineHeight: 1.7, color: "#1f1f1f" }}>
        <Markdown text={artifact.data?.text ?? ""} />
      </div>
    </div>
  );
}

/* ===================== Switch ===================== */

export default function ArtifactBody({ artifact }: { artifact: Artifact }) {
  switch (artifact.kind) {
    case "mindmap":
      return <MindmapView artifact={artifact} />;
    case "report":
      return <ReportView artifact={artifact} />;
    case "flashcards":
      return <FlashcardsView artifact={artifact} />;
    case "quiz":
      return <QuizView artifact={artifact} />;
    case "datatable":
      return <DatatableView artifact={artifact} />;
    case "infographic":
      return <InfographicView artifact={artifact} />;
    default:
      return <NoteView artifact={artifact} />;
  }
}
