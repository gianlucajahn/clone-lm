"use client";

import { useEffect, useState } from "react";
import ModalShell from "./ModalShell";
import IconButton from "./IconButton";
import Icon from "./Icon";
import { studioTitle, studioLabel, FIELD_BORDER } from "./studioControls";

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

const PLACEHOLDER = `Vorschläge
   •  Erstelle eine Tabelle mit den wichtigsten Ergebnissen dieser Forschungsarbeiten; verwende dazu die Spalten „Titel“, „Autor“ und „Wichtigstes Ergebnis“
   •  Extrahiere die wichtigsten Zitate aus meinen Texten und gruppiere sie nach Thema und Autor
   •  Liste Urlaubsorte in Italien mit Stadt, bester Reisezeit, Sehenswürdigkeiten und Kosten auf`;

/** Per-option "Datentabelle anpassen" popup, opened from the Datentabelle card chevron. */
export default function DatatableSettingsModal({
  open,
  onClose,
  onGenerate,
}: {
  open: boolean;
  onClose: () => void;
  onGenerate: (opts: { language: string; description: string }) => void;
}) {
  const [language, setLanguage] = useState("Deutsch");
  const [description, setDescription] = useState("");
  const [descFocus, setDescFocus] = useState(false);

  useEffect(() => {
    if (open) {
      setLanguage("Deutsch");
      setDescription("");
    }
  }, [open]);

  return (
    <ModalShell open={open} onClose={onClose} width={880}>
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
        <Icon name="table_chart" size={24} color="#224484" fill={1} />
        <div style={{ flex: 1, ...studioTitle }}>Datentabelle anpassen</div>
        <IconButton name="close" size={40} iconSize={24} iconColor="#444746" hoverBg="rgba(0,0,0,0.06)" onClick={onClose} />
      </div>

      {/* Body */}
      <div style={{ padding: "20px 24px 24px" }}>
        <div style={{ ...studioLabel, marginBottom: 12 }}>Sprache auswählen</div>
        <div style={{ position: "relative", width: 300 }}>
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

        <div style={{ ...studioLabel, margin: "24px 0 10px" }}>
          Datentabelle beschreiben, die erstellt werden soll
        </div>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          onFocus={() => setDescFocus(true)}
          onBlur={() => setDescFocus(false)}
          placeholder={PLACEHOLDER}
          style={{
            width: "100%",
            minHeight: 130,
            border: `1.5px solid ${descFocus ? "#1a73e8" : FIELD_BORDER}`,
            borderRadius: 10,
            padding: "12px 14px",
            fontSize: 14.5,
            lineHeight: 1.7,
            fontFamily: "inherit",
            color: "#1f1f1f",
            outline: "none",
            resize: "vertical",
            boxSizing: "border-box",
            transition: "border-color 150ms ease",
          }}
        />
      </div>

      {/* Footer */}
      <div style={{ display: "flex", justifyContent: "flex-end", padding: "0 24px 18px" }}>
        <button
          type="button"
          onClick={() => onGenerate({ language, description: description.trim() })}
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
