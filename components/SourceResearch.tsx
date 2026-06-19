"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Icon from "./Icon";
import { useResearch } from "./ResearchStore";
import styles from "./SourceResearch.module.css";

/** The multi-colour Google Drive logo (Material Symbols has no colour version). */
function DriveLogo({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 87.3 78" xmlns="http://www.w3.org/2000/svg">
      <path d="m6.6 66.85 3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3l13.75-23.8h-27.5c0 1.55.4 3.1 1.2 4.5z" fill="#0066da" />
      <path d="m43.65 25-13.75-23.8c-1.35.8-2.5 1.9-3.3 3.3l-25.4 44c-.8 1.4-1.2 2.95-1.2 4.5h27.5z" fill="#00ac47" />
      <path d="m73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l1.6-2.75 7.65-13.25c.8-1.4 1.2-2.95 1.2-4.5h-27.502l5.852 11.5z" fill="#ea4335" />
      <path d="m43.65 25 13.75-23.8c-1.35-.8-2.9-1.2-4.5-1.2h-18.5c-1.6 0-3.15.45-4.5 1.2z" fill="#00832d" />
      <path d="m59.8 53h-32.3l-13.75 23.8c1.35.8 2.9 1.2 4.5 1.2h50.8c1.6 0 3.15-.45 4.5-1.2z" fill="#2684fc" />
      <path d="m73.4 26.5-12.7-22c-.8-1.4-1.95-2.5-3.3-3.3l-13.75 23.8 16.15 28h27.45c0-1.55-.4-3.1-1.2-4.5z" fill="#ffba00" />
    </svg>
  );
}

interface Opt {
  value: string;
  label: string;
  icon: string;
  desc: string;
  iconNode?: ReactNode;
  disabled?: boolean;
}

/** A clickable pill that opens a small dropdown menu (Web source / research mode). */
function PillDropdown({
  options,
  value,
  onChange,
}: {
  options: Opt[];
  value: string;
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const sel = options.find((o) => o.value === value) ?? options[0];

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  return (
    <div ref={ref} className={styles.ddWrap}>
      <button type="button" className={styles.pill} onClick={() => setOpen((o) => !o)}>
        <Icon name={sel.icon} size={18} color="#444746" />
        {sel.label}
        <Icon name="keyboard_arrow_down" size={18} color="#444746" />
      </button>
      {open && (
        <div className={styles.menu}>
          {options.map((o) => (
            <button
              key={o.value}
              type="button"
              className={`${styles.menuItem}${o.disabled ? ` ${styles.menuItemDisabled}` : ""}`}
              onClick={() => {
                if (o.disabled) return;
                onChange(o.value);
                setOpen(false);
              }}
            >
              <span className={styles.menuIcon}>
                {o.iconNode ?? <Icon name={o.icon} size={20} color="#444746" />}
              </span>
              <span className={styles.menuText}>
                <span className={styles.menuLabel}>{o.label}</span>
                <span className={styles.menuDesc}>{o.desc}</span>
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

const WEB_OPTS: Opt[] = [
  { value: "web", label: "Web", icon: "language", desc: "Beste Quellen aus dem Web" },
  {
    value: "drive",
    label: "Drive",
    icon: "add_to_drive",
    iconNode: <DriveLogo />,
    desc: "Ihre Inhalte auf Google Drive",
    disabled: true,
  },
];
const MODE_OPTS: Opt[] = [
  {
    value: "quick",
    label: "Schnelle Recherche",
    icon: "recenter",
    desc: "Ideal für schnelle Ergebnisse",
  },
  {
    value: "deep",
    label: "Deep Research",
    icon: "travel_explore",
    desc: "Ausführlicher Bericht und detaillierte Ergebnisse",
  },
];

/**
 * The "Im Web nach neuen Quellen suchen" flow: the user types a topic, Claude's
 * web search finds real sources, they're shown with checkboxes, and importing
 * saves the selected ones into the notebook. Reused in the sources panel and
 * the create-notebook modal.
 */
export default function SourceResearch({ autoFocus = false }: { autoFocus?: boolean }) {
  const {
    query,
    setQuery,
    phase,
    candidates,
    selected,
    importing,
    error,
    webSource,
    setWebSource,
    mode,
    setMode,
    run,
    toggle,
    reset,
    doImport,
  } = useResearch();
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-select + highlight the search box by default (used in the source modal).
  useEffect(() => {
    if (!autoFocus) return;
    const t = setTimeout(() => inputRef.current?.focus(), 60);
    return () => clearTimeout(t);
  }, [autoFocus]);

  return (
    <div className={styles.box}>
      <input
        ref={inputRef}
        className={styles.input}
        value={query}
        autoFocus={autoFocus}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") run();
        }}
        placeholder="Im Web nach neuen Quellen suchen"
      />
      <div className={styles.row}>
        <PillDropdown options={WEB_OPTS} value={webSource} onChange={setWebSource} />
        <PillDropdown options={MODE_OPTS} value={mode} onChange={setMode} />
        <button
          className={`${styles.searchBtn}${
            query.trim() ? ` ${styles.searchBtnActive}` : ""
          }`}
          onClick={run}
          aria-label="Suchen"
        >
          {query.trim() ? (
            <Icon name="arrow_forward" size={20} color="#fff" />
          ) : (
            <Icon name="search" size={21} color="#5f6368" weight={300} />
          )}
        </button>
      </div>

      <AnimatePresence mode="wait">
        {phase === "running" && (
          <motion.div
            key="running"
            className={styles.running}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <span className={styles.spin}>
              <Icon name="progress_activity" size={20} color="#3d5afe" />
            </span>
            Recherche auf Websites läuft…
          </motion.div>
        )}

        {phase === "results" && (
          <motion.div
            key="results"
            className={styles.card}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <div className={styles.cardHead}>
              <span>
                <Icon
                  name="recenter"
                  size={16}
                  color="#444746"
                  style={{ verticalAlign: "-3px", marginRight: 6 }}
                />
                Schnelle Recherche abgeschlossen
              </span>
              <span style={{ fontSize: 13, color: "#5f6368", fontWeight: 400 }}>
                {selected.size}/{candidates.length}
              </span>
            </div>
            <div className={styles.list}>
              {candidates.map((c, i) => (
                <div key={i} className={styles.item} onClick={() => toggle(i)}>
                  <Icon
                    name={selected.has(i) ? "check_box" : "check_box_outline_blank"}
                    size={20}
                    color={selected.has(i) ? "#3d5afe" : "#9aa0a6"}
                  />
                  <div style={{ minWidth: 0 }}>
                    <div className={styles.itemTitle}>{c.title}</div>
                    <div className={styles.itemSnippet}>{c.snippet}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className={styles.footer}>
              <button className={styles.del} onClick={reset}>
                Löschen
              </button>
              <button
                className={styles.importBtn}
                onClick={doImport}
                disabled={!selected.size || importing}
              >
                <Icon name="add" size={18} color="#fff" />
                {importing ? "Importieren…" : "Importieren"}
              </button>
            </div>
          </motion.div>
        )}

        {phase === "error" && (
          <motion.div
            key="error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className={styles.error}>{error}</div>
            <div className={styles.footer}>
              <button className={styles.del} onClick={reset}>
                Zurücksetzen
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
