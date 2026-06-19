"use client";

import { useEffect, useState } from "react";
import ModalShell from "./ModalShell";
import IconButton from "./IconButton";
import Icon from "./Icon";
import { Pill, studioTitle, studioLabel } from "./studioControls";

const COUNTS = [
  { value: "weniger", label: "Weniger" },
  { value: "standard", label: "Standardeinstellung" },
  { value: "mehr", label: "Mehr" },
];
const DIFFS = [
  { value: "einfach", label: "Einfach" },
  { value: "mittel", label: "Mittel (Standardeinstellung)" },
  { value: "schwierig", label: "Schwierig" },
];

const TOPIC_PLACEHOLDER = `Vorschläge
   •  Die Lernkarten müssen auf eine bestimmte Quelle beschränkt sein (z. B. „der Artikel über Italien“)
   •  Die Lernkarten müssen sich auf ein konkretes Thema beziehen (z. B. „Newtons zweites Gesetz“)
   •  Der Text auf der Vorderseite der Karten muss kurz sein (1 bis 5 Wörter), damit er sich leicht merken lässt`;

/** Per-option "Lernkarten anpassen" popup, opened from the Karteikarten card chevron. */
export default function FlashcardsSettingsModal({
  open,
  onClose,
  onGenerate,
}: {
  open: boolean;
  onClose: () => void;
  onGenerate: (opts: { count: string; difficulty: string; topic: string }) => void;
}) {
  const [count, setCount] = useState("standard");
  const [difficulty, setDifficulty] = useState("mittel");
  const [topic, setTopic] = useState("");

  useEffect(() => {
    if (open) {
      setCount("standard");
      setDifficulty("mittel");
      setTopic("");
    }
  }, [open]);

  return (
    <ModalShell open={open} onClose={onClose} width={860}>
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
        <Icon name="style" size={24} color="#8c2e2a" fill={1} />
        <div style={{ flex: 1, ...studioTitle }}>Lernkarten anpassen</div>
        <IconButton name="close" size={40} iconSize={24} iconColor="#444746" hoverBg="rgba(0,0,0,0.06)" onClick={onClose} />
      </div>

      {/* Body */}
      <div style={{ padding: "24px" }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "22px 40px" }}>
          <div style={{ flex: 1, minWidth: 240 }}>
            <div style={{ ...studioLabel, marginBottom: 12 }}>Anzahl der Karten</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
              {COUNTS.map((c) => (
                <Pill key={c.value} selected={count === c.value} onClick={() => setCount(c.value)}>
                  {c.label}
                </Pill>
              ))}
            </div>
          </div>
          <div style={{ flex: 1, minWidth: 240 }}>
            <div style={{ ...studioLabel, marginBottom: 12 }}>Schwierigkeitsgrad</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
              {DIFFS.map((d) => (
                <Pill key={d.value} selected={difficulty === d.value} onClick={() => setDifficulty(d.value)}>
                  {d.label}
                </Pill>
              ))}
            </div>
          </div>
        </div>

        <div style={{ ...studioLabel, margin: "24px 0 10px" }}>Was soll das Thema sein?</div>
        <textarea
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder={TOPIC_PLACEHOLDER}
          style={{
            width: "100%",
            minHeight: 130,
            border: "1.5px solid #1a73e8",
            borderRadius: 10,
            padding: "12px 14px",
            fontSize: 14.5,
            lineHeight: 1.7,
            fontFamily: "inherit",
            color: "#1f1f1f",
            outline: "none",
            resize: "vertical",
            boxSizing: "border-box",
          }}
        />
      </div>

      {/* Footer */}
      <div style={{ display: "flex", justifyContent: "flex-end", padding: "0 24px 22px" }}>
        <button
          type="button"
          onClick={() => onGenerate({ count, difficulty, topic: topic.trim() })}
          onMouseEnter={(e) => (e.currentTarget.style.background = "#3450e0")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "#3d5afe")}
          style={{
            height: 44,
            padding: "0 30px",
            borderRadius: 22,
            border: "none",
            background: "#3d5afe",
            color: "#fff",
            fontFamily: "inherit",
            fontSize: 15,
            fontWeight: 500,
            cursor: "pointer",
            transition: "background-color 120ms ease",
          }}
        >
          Generieren
        </button>
      </div>
    </ModalShell>
  );
}
