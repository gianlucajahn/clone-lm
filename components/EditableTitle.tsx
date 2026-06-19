"use client";

import { useLayoutEffect, useRef, useState } from "react";
import styles from "./EditableTitle.module.css";

interface EditableTitleProps {
  value: string;
  onChange: (next: string) => void;
  fontSize: number;
  fontWeight?: number;
  color?: string;
  letterSpacing?: string;
  align?: "left" | "center";
  maxWidth?: number;
  placeholder?: string;
}

/**
 * An inline, auto-sizing editable title. Reads like plain text until hovered
 * (subtle highlight) or focused (outline); the width tracks its content via a
 * hidden measuring span so it never reserves more space than needed. Used for
 * the notebook name in both the top bar and the chat hero, bound to the same
 * state so a rename in one place updates the other live.
 */
export default function EditableTitle({
  value,
  onChange,
  fontSize,
  fontWeight = 400,
  color = "#1f1f1f",
  letterSpacing = "normal",
  align = "left",
  maxWidth,
  placeholder = "Unbenanntes Notebook",
}: EditableTitleProps) {
  const measureRef = useRef<HTMLSpanElement>(null);
  const [width, setWidth] = useState(0);

  useLayoutEffect(() => {
    if (measureRef.current) setWidth(measureRef.current.offsetWidth);
  }, [value, fontSize, fontWeight, letterSpacing]);

  const sharedFont = {
    fontSize,
    fontWeight,
    letterSpacing,
    fontFamily: "'Roboto', Arial, sans-serif",
  } as const;

  return (
    <span style={{ position: "relative", display: "inline-block", maxWidth }}>
      <span
        ref={measureRef}
        aria-hidden
        style={{
          ...sharedFont,
          position: "absolute",
          visibility: "hidden",
          whiteSpace: "pre",
          pointerEvents: "none",
        }}
      >
        {value || placeholder}
      </span>
      <input
        className={styles.input}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        onFocus={(e) => e.target.select()}
        spellCheck={false}
        style={{
          ...sharedFont,
          color,
          textAlign: align,
          width: Math.min(width + 16, maxWidth ?? Infinity),
          maxWidth: maxWidth ? maxWidth : undefined,
        }}
      />
    </span>
  );
}
