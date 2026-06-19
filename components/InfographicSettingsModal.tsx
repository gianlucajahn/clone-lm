"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import ModalShell from "./ModalShell";
import IconButton from "./IconButton";
import Icon from "./Icon";
import { Segmented, studioTitle, studioLabel, FIELD_BORDER } from "./studioControls";

const LANGUAGES = [
  "Deutsch",
  "English",
  "Français",
  "Español",
  "Italiano",
  "Português",
  "Nederlands",
  "Polski",
  "Svenska",
  "Türkçe",
];

const ORIENTATIONS = [
  { value: "querformat", label: "Querformat" },
  { value: "hochformat", label: "Hochformat" },
  { value: "quadrat", label: "Quadrat" },
];

const DETAILS = [
  { value: "kurzgefasst", label: "Kurzgefasst" },
  { value: "standard", label: "Standard" },
  { value: "detailliert", label: "Detailliert", badge: "BETA" },
];

interface Style {
  value: string;
  label: string;
  grad?: string;
}
const STYLES: Style[] = [
  { value: "auto", label: "Automatische Auswahl" },
  { value: "kawaii", label: "Kawaii", grad: "linear-gradient(135deg,#ffd6ec,#c9f7e0)" },
  { value: "tonfigur", label: "Tonfigur", grad: "linear-gradient(135deg,#e8d9c5,#c4a987)" },
  { value: "sketchnote", label: "Sketchnote", grad: "linear-gradient(135deg,#fafaf8,#e4e4df)" },
  { value: "anime", label: "Anime", grad: "linear-gradient(135deg,#2b6cf6,#f6a02b)" },
  { value: "editorial", label: "Editorial", grad: "linear-gradient(135deg,#cfe3ff,#eaf2ff)" },
  { value: "aquarell", label: "Aquarell", grad: "linear-gradient(135deg,#bcd8ff,#d9c2ff)" },
  { value: "comic", label: "Comic", grad: "linear-gradient(135deg,#ffe14d,#ff6a6a)" },
  { value: "vintage", label: "Vintage", grad: "linear-gradient(135deg,#d9c7a3,#a98e6b)" },
];

function StyleCard({
  style,
  selected,
  onClick,
}: {
  style: Style;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        flex: "none",
        width: 150,
        border: "none",
        background: "transparent",
        padding: 0,
        cursor: "pointer",
        fontFamily: "inherit",
        textAlign: "center",
      }}
    >
      <div
        style={{
          position: "relative",
          height: 110,
          borderRadius: 10,
          border: `2px solid ${selected ? "#1a73e8" : "transparent"}`,
          background: style.value === "auto" ? "#eef0fe" : style.grad,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          boxShadow: selected ? "none" : "0 0 0 1px #d4d7de",
        }}
      >
        {style.value === "auto" && <Icon name="autorenew" size={28} color="#3d5afe" />}
        {selected && (
          <span style={{ position: "absolute", top: 7, right: 7 }}>
            <Icon name="check" size={18} color="#1f1f1f" />
          </span>
        )}
      </div>
      <div style={{ fontSize: 13.5, color: "#3c4043", marginTop: 8 }}>{style.label}</div>
    </button>
  );
}

/** Per-option "Infografik anpassen" popup, opened from the infographic card chevron. */
export default function InfographicSettingsModal({
  open,
  onClose,
  onGenerate,
}: {
  open: boolean;
  onClose: () => void;
  onGenerate: (opts: {
    language: string;
    orientation: string;
    visualStyle: string;
    detailLevel: string;
    description: string;
  }) => void;
}) {
  const [language, setLanguage] = useState("Deutsch");
  const [orientation, setOrientation] = useState("querformat");
  const [visualStyle, setVisualStyle] = useState("auto");
  const [detailLevel, setDetailLevel] = useState("standard");
  const [description, setDescription] = useState("");
  const [descFocus, setDescFocus] = useState(false);
  const scrollerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      setLanguage("Deutsch");
      setOrientation("querformat");
      setVisualStyle("auto");
      setDetailLevel("standard");
      setDescription("");
    }
  }, [open]);

  const label = (t: string): ReactNode => <div style={{ ...studioLabel, marginBottom: 12 }}>{t}</div>;

  return (
    <ModalShell open={open} onClose={onClose} width={960}>
      {/* Header */}
      <div
        style={{
          flex: "none",
          display: "flex",
          alignItems: "center",
          gap: 14,
          padding: "18px 16px 18px 24px",
          borderBottom: "1px solid #e1e3e8",
        }}
      >
        <Icon name="bar_chart" size={24} color="#802272" fill={1} />
        <div style={{ flex: 1, ...studioTitle }}>Infografik anpassen</div>
        <IconButton name="close" size={40} iconSize={24} iconColor="#444746" hoverBg="rgba(0,0,0,0.06)" onClick={onClose} />
      </div>

      {/* Body */}
      <div className="cl-scroll" style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: "20px 24px 24px" }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "22px 40px" }}>
          {/* language */}
          <div style={{ flex: 1, minWidth: 240 }}>
            {label("Sprache auswählen")}
            <div style={{ position: "relative" }}>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                style={{
                  width: "100%",
                  height: 48,
                  border: `1.5px solid ${FIELD_BORDER}`,
                  borderRadius: 8,
                  padding: "0 40px 0 14px",
                  fontSize: 15,
                  fontWeight: 500,
                  fontFamily: "inherit",
                  color: "#1f1f1f",
                  background: "#fff",
                  outline: "none",
                  appearance: "none",
                  WebkitAppearance: "none",
                  cursor: "pointer",
                }}
              >
                {LANGUAGES.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
              <span style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}>
                <Icon name="arrow_drop_down" size={24} color="#444746" />
              </span>
            </div>
          </div>
          {/* orientation */}
          <div style={{ flex: 1, minWidth: 240 }}>
            {label("Ausrichtung auswählen")}
            <Segmented options={ORIENTATIONS} value={orientation} onChange={setOrientation} />
          </div>
        </div>

        {/* visual style */}
        <div style={{ marginTop: 24 }}>
          {label("Visuellen Stil auswählen")}
          <div style={{ position: "relative" }}>
            <div ref={scrollerRef} className="cl-hscroll" style={{ display: "flex", gap: 14, paddingBottom: 12 }}>
              {STYLES.map((s) => (
                <StyleCard key={s.value} style={s} selected={visualStyle === s.value} onClick={() => setVisualStyle(s.value)} />
              ))}
            </div>
            <button
              type="button"
              aria-label="Mehr Stile"
              onClick={() => scrollerRef.current?.scrollBy({ left: 330, behavior: "smooth" })}
              style={{
                position: "absolute",
                right: -6,
                top: 43,
                transform: "translateY(-50%)",
                width: 36,
                height: 36,
                borderRadius: "50%",
                border: "1px solid #d4d7de",
                background: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                boxShadow: "0 1px 4px rgba(0,0,0,0.18)",
              }}
            >
              <Icon name="chevron_right" size={22} color="#444746" />
            </button>
          </div>
        </div>

        {/* detail level */}
        <div style={{ marginTop: 22 }}>
          {label("Detaillierungsgrad")}
          <Segmented options={DETAILS} value={detailLevel} onChange={setDetailLevel} />
        </div>

        {/* description */}
        <div style={{ marginTop: 24 }}>
          <div style={{ ...studioLabel, marginBottom: 10 }}>
            Beschreiben Sie die Infografik, die Sie erstellen möchten
          </div>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onFocus={() => setDescFocus(true)}
            onBlur={() => setDescFocus(false)}
            placeholder={
              'Geben Sie Anweisungen zum Stil, zur Farbe oder zum Fokus: „Verwende ein blaues Farbschema und hebe die drei wichtigsten Statistiken hervor.“'
            }
            style={{
              width: "100%",
              minHeight: 72,
              border: `1.5px solid ${descFocus ? "#1a73e8" : FIELD_BORDER}`,
              borderRadius: 10,
              padding: "12px 14px",
              fontSize: 14.5,
              lineHeight: 1.6,
              fontFamily: "inherit",
              color: "#1f1f1f",
              outline: "none",
              resize: "vertical",
              boxSizing: "border-box",
              transition: "border-color 150ms ease",
            }}
          />
        </div>
      </div>

      {/* Footer */}
      <div style={{ flex: "none", display: "flex", justifyContent: "flex-end", padding: "14px 24px 18px" }}>
        <button
          type="button"
          onClick={() => onGenerate({ language, orientation, visualStyle, detailLevel, description: description.trim() })}
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
          Erstellen
        </button>
      </div>
    </ModalShell>
  );
}
