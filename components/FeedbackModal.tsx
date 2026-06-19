"use client";

import { useEffect, useState } from "react";
import ModalShell from "./ModalShell";
import Icon from "./Icon";

const UP = ["Faktisch korrekt", "Einfach zu verstehen", "Informativ", "Kreativ/interessant", "Sonstiges"];
const DOWN = [
  "Anstößig/bedenklich",
  "Irrelevant",
  "Erfundene Antwort",
  "Antwort fehlgeschlagen",
  "Teilweise falsch",
  "Sonstiges",
];

/** "Wir sind an Ihrer Meinung interessiert" feedback popup (up- or down-vote). */
export default function FeedbackModal({
  open,
  type,
  onClose,
  onSend,
}: {
  open: boolean;
  type: "up" | "down";
  onClose: () => void;
  onSend: () => void;
}) {
  const options = type === "up" ? UP : DOWN;
  const [sel, setSel] = useState<Set<string>>(new Set());
  const [text, setText] = useState("");

  useEffect(() => {
    if (open) {
      setSel(new Set());
      setText("");
    }
  }, [open, type]);

  const toggle = (o: string) =>
    setSel((prev) => {
      const n = new Set(prev);
      n.has(o) ? n.delete(o) : n.add(o);
      return n;
    });

  return (
    <ModalShell open={open} onClose={onClose} width={500}>
      <div style={{ padding: "26px 30px 22px" }}>
        <div style={{ fontSize: 20, fontWeight: 400, color: "#1f1f1f", marginBottom: 20 }}>
          Wir sind an Ihrer Meinung interessiert{" "}
          <span style={{ color: "#5f6368" }}>(optional)</span>
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 18 }}>
          {options.map((o) => {
            const on = sel.has(o);
            return (
              <button
                key={o}
                onClick={() => toggle(o)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  height: 36,
                  padding: on ? "0 14px 0 10px" : "0 14px",
                  borderRadius: 18,
                  border: `1px solid ${on ? "#1a73e8" : "#dadce0"}`,
                  background: on ? "#e8f0fe" : "#fff",
                  color: on ? "#1a73e8" : "#3c4043",
                  fontSize: 14,
                  fontFamily: "inherit",
                  cursor: "pointer",
                }}
              >
                {on && <Icon name="check" size={18} color="#1a73e8" />}
                {o}
              </button>
            );
          })}
        </div>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Zusätzliches Feedback geben"
          style={{
            width: "100%",
            minHeight: 92,
            background: "#f1f3f4",
            border: "none",
            borderBottom: "1px solid #80868b",
            borderRadius: "8px 8px 0 0",
            padding: 14,
            fontSize: 14,
            fontFamily: "inherit",
            color: "#1f1f1f",
            resize: "vertical",
            outline: "none",
            boxSizing: "border-box",
          }}
        />

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 22 }}>
          <button
            onClick={onClose}
            style={{
              height: 40,
              padding: "0 22px",
              borderRadius: 20,
              border: "1px solid #dadce0",
              background: "#fff",
              fontSize: 14,
              fontWeight: 500,
              fontFamily: "inherit",
              color: "#1f1f1f",
              cursor: "pointer",
            }}
          >
            Abbrechen
          </button>
          <button
            onClick={onSend}
            style={{
              height: 40,
              padding: "0 28px",
              borderRadius: 20,
              border: "none",
              background: "#3d5afe",
              color: "#fff",
              fontSize: 14,
              fontWeight: 500,
              fontFamily: "inherit",
              cursor: "pointer",
            }}
          >
            Senden
          </button>
        </div>
      </div>
    </ModalShell>
  );
}
