"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Icon from "./Icon";
import SettingsMenu from "./SettingsMenu";
import AppsMenu from "./AppsMenu";
import NotebookCard from "./NotebookCard";
import NotebookRow from "./NotebookRow";
import { pill } from "@/lib/motion";
import type { Notebook } from "@/lib/notebooks";
import styles from "./NotebookListView.module.css";

type Sort = "recent" | "title";
const SORT_LABEL: Record<Sort, string> = {
  recent: "Neueste Projekte",
  title: "Titel",
};

/** The notebook collection / home page. */
export default function NotebookListView({
  notebooks,
  onOpen,
  onCreate,
  onDelete,
  onRename,
}: {
  notebooks: Notebook[];
  onOpen: (id: string) => void;
  onCreate: () => void;
  onDelete: (id: string) => void;
  onRename: (id: string, name: string) => void;
}) {
  const [listMode, setListMode] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<Sort>("recent");
  const [sortOpen, setSortOpen] = useState(false);
  const sortRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sortOpen) return;
    const onDown = (e: MouseEvent) => {
      if (sortRef.current && !sortRef.current.contains(e.target as Node))
        setSortOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSortOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [sortOpen]);

  const q = query.trim().toLowerCase();
  let shown = q
    ? notebooks.filter((n) => n.title.toLowerCase().includes(q))
    : notebooks;
  if (sort === "title") {
    shown = [...shown].sort((a, b) => a.title.localeCompare(b.title));
  }

  return (
    <div className={styles.page}>
      {/* Full-width header */}
      <div className={styles.header}>
        <div className={styles.brand}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: "50%",
              background: "#1f1f1f",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icon name="graphic_eq" size={20} color="#fff" fill={1} />
          </div>
          <div className={styles.brandName}>Clone LM</div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <SettingsMenu />
          <AppsMenu />
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: "50%",
              background: "linear-gradient(135deg,#f04393,#f9373c)",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 15,
              fontWeight: 500,
            }}
          >
            G
          </div>
        </div>
      </div>

      <div className={styles.content}>
        {/* Toolbar */}
        <div className={styles.toolbar}>
          <div className={styles.tabs}>
            <button className={`${styles.tab} ${styles.tabDisabled}`}>Alle</button>
            <button className={`${styles.tab} ${styles.tabActive}`}>
              Meine Notebooks
            </button>
            <button className={`${styles.tab} ${styles.tabDisabled}`}>
              Empfohlene Notebooks
            </button>
          </div>

          <div className={styles.toolRight}>
            {searchOpen ? (
              <div className={styles.searchBox}>
                <Icon name="search" size={20} color="#444746" />
                <input
                  className={styles.searchInput}
                  autoFocus
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Notebooks durchsuchen"
                />
                <button
                  className={styles.searchClose}
                  onClick={() => {
                    setQuery("");
                    setSearchOpen(false);
                  }}
                  aria-label="Schließen"
                >
                  <Icon name="close" size={18} color="#444746" />
                </button>
              </div>
            ) : (
              <button
                className={styles.iconBtn}
                onClick={() => setSearchOpen(true)}
                aria-label="Suchen"
              >
                <Icon name="search" size={22} color="#444746" />
              </button>
            )}

            <div className={styles.segmented}>
              <button
                className={`${styles.seg} ${!listMode ? styles.segActive : ""}`}
                onClick={() => setListMode(false)}
                aria-label="Rasteransicht"
              >
                {!listMode && <Icon name="check" size={22} color="#1f1f1f" />}
                <Icon name="grid_view" size={20} color="#444746" />
              </button>
              <button
                className={`${styles.seg} ${listMode ? styles.segActive : ""}`}
                onClick={() => setListMode(true)}
                aria-label="Listenansicht"
              >
                {listMode && <Icon name="check" size={22} color="#1f1f1f" />}
                <Icon name="view_list" size={20} color="#444746" />
              </button>
            </div>

            <div className={styles.sortWrap} ref={sortRef}>
              <button
                className={styles.sortChip}
                onClick={() => setSortOpen((o) => !o)}
              >
                {SORT_LABEL[sort]}
                <Icon name="arrow_drop_down" size={22} color="#444746" />
              </button>
              <AnimatePresence>
                {sortOpen && (
                  <motion.div
                    className={styles.sortMenu}
                    initial={{ opacity: 0, y: -6, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6, scale: 0.98 }}
                    transition={{ duration: 0.14, ease: "easeOut" }}
                    style={{ transformOrigin: "top left" }}
                  >
                    {(["recent", "title"] as Sort[]).map((s) => (
                      <div
                        key={s}
                        className={styles.sortItem}
                        onClick={() => {
                          setSort(s);
                          setSortOpen(false);
                        }}
                      >
                        {SORT_LABEL[s]}
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <motion.button {...pill} className={styles.newBtn} onClick={onCreate}>
              <Icon name="add" size={20} color="#fff" />
              Neu erstellen
            </motion.button>
          </div>
        </div>

        <div className={styles.sectionTitle}>Meine Notebooks</div>

        {listMode ? (
          <div className={styles.table}>
            <div className={styles.tableHead}>
              <div>Titel</div>
              <div>Quellen</div>
              <div>Erstellt</div>
              <div>Rolle</div>
              <div />
            </div>
            {shown.map((nb) => (
              <NotebookRow
                key={nb.id}
                notebook={nb}
                onOpen={onOpen}
                onDelete={onDelete}
                onRename={onRename}
              />
            ))}
          </div>
        ) : (
          <div className={styles.grid}>
            <button className={styles.createCard} onClick={onCreate}>
              <div className={styles.plusCircle}>
                <Icon name="add" size={24} color="#1a73e8" />
              </div>
              <div className={styles.createText}>Neues Notebook erstellen</div>
            </button>
            {shown.map((nb) => (
              <NotebookCard
                key={nb.id}
                notebook={nb}
                onOpen={onOpen}
                onDelete={onDelete}
                onRename={onRename}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
