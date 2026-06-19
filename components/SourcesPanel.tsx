"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import CollapsibleColumn from "./CollapsibleColumn";
import OrganizeLoading from "./OrganizeLoading";
import PanelHeader from "./PanelHeader";
import Button from "./Button";
import Icon from "./Icon";
import Tooltip from "./Tooltip";
import SourceResearch from "./SourceResearch";
import SourceMenu from "./SourceMenu";
import SourceDetail from "./SourceDetail";
import LabelMenu from "./LabelMenu";
import Skeleton from "./Skeleton";
import type { Source } from "@/lib/notebooks";
import type { Label } from "@/lib/labels";

const NONE = "__none__";

function hostOf(url: string | null): string | null {
  if (!url) return null;
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}

function newId(): string {
  try {
    return crypto.randomUUID();
  } catch {
    return `lbl_${Math.abs(Date.now() ^ (performance.now() * 1000)).toString(36)}`;
  }
}

/** One saved-source row: favicon, title (inline-renameable), host, 3-dots menu. */
function SourceRow({
  source,
  onDelete,
  onRename,
  onOpen,
  draggable,
  dragging,
  bumping,
  onDragStart,
  onDragEnd,
}: {
  source: Source;
  onDelete: () => void;
  onRename: (title: string) => void;
  onOpen: () => void;
  draggable?: boolean;
  dragging?: boolean;
  bumping?: boolean;
  onDragStart?: () => void;
  onDragEnd?: () => void;
}) {
  const [hover, setHover] = useState(false);
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(source.title);
  const [imgFail, setImgFail] = useState(false);
  const host = hostOf(source.url);

  const save = () => {
    const v = value.trim();
    setEditing(false);
    if (v && v !== source.title) onRename(v);
    else setValue(source.title);
  };

  return (
    <div
      draggable={draggable && !editing}
      onDragStart={(e) => {
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData("text/plain", source.id);
        onDragStart?.();
      }}
      onDragEnd={() => onDragEnd?.()}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className={bumping ? "cl-bump" : undefined}
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 11,
        padding: "10px 5px 10px 8px",
        borderRadius: 10,
        background: hover && !dragging ? "#f1f3fb" : "transparent",
        opacity: dragging ? 0.4 : 1,
        cursor: draggable ? "grab" : "default",
        transition: "background-color 120ms ease, opacity 120ms ease",
        fontFamily: "'Roboto', Arial, sans-serif",
      }}
    >
      <span
        onClick={onOpen}
        style={{ flex: "none", width: 20, marginTop: 1, display: "inline-flex", justifyContent: "center", cursor: "pointer" }}
      >
        {host && !imgFail ? (
          <img
            src={`https://www.google.com/s2/favicons?domain=${host}&sz=64`}
            alt=""
            width={18}
            height={18}
            draggable={false}
            onError={() => setImgFail(true)}
            style={{ borderRadius: 4, display: "block" }}
          />
        ) : (
          <Icon name="description" size={20} color="#5f6368" />
        )}
      </span>

      <div
        style={{ flex: 1, minWidth: 0, cursor: editing ? "default" : "pointer" }}
        onClick={editing ? undefined : onOpen}
      >
        {editing ? (
          <input
            value={value}
            autoFocus
            draggable={false}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") save();
              if (e.key === "Escape") {
                setValue(source.title);
                setEditing(false);
              }
            }}
            onBlur={save}
            style={{
              width: "100%",
              border: "1.5px solid #1a73e8",
              borderRadius: 6,
              padding: "2px 6px",
              fontSize: 14,
              fontFamily: "inherit",
              color: "#1f1f1f",
              outline: "none",
            }}
          />
        ) : (
          <div
            style={{
              fontSize: 14,
              color: "#1f1f1f",
              lineHeight: 1.3,
              overflow: "hidden",
              textOverflow: "ellipsis",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
            }}
          >
            {source.title}
          </div>
        )}
        {host && !editing && (
          <a
            href={source.url ?? undefined}
            target="_blank"
            rel="noreferrer"
            draggable={false}
            onClick={(e) => e.stopPropagation()}
            style={{
              fontSize: 12,
              color: "#1a73e8",
              textDecoration: "none",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              display: "block",
              marginTop: 1,
            }}
          >
            {host}
          </a>
        )}
      </div>

      <span draggable={false} onDragStart={(e) => e.preventDefault()}>
        <SourceMenu
          onDelete={onDelete}
          onRename={() => {
            setValue(source.title);
            setEditing(true);
          }}
        />
      </span>
    </div>
  );
}

/** A collapsible label group that doubles as a drop target. */
function LabelGroup({
  id,
  name,
  isNone,
  expanded,
  over,
  renaming,
  renameValue,
  onToggle,
  onDrop,
  onDragEnter,
  onStartRename,
  onRenameChange,
  onRenameCommit,
  onDelete,
  count,
  children,
}: {
  id: string;
  name: string;
  isNone: boolean;
  expanded: boolean;
  over: boolean;
  renaming: boolean;
  renameValue: string;
  onToggle: () => void;
  onDrop: () => void;
  onDragEnter: () => void;
  onStartRename: () => void;
  onRenameChange: (v: string) => void;
  onRenameCommit: () => void;
  onDelete: () => void;
  count: number;
  children: React.ReactNode;
}) {
  const [hover, setHover] = useState(false);
  return (
    <div
      onDragEnter={(e) => {
        e.preventDefault();
        onDragEnter();
      }}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        onDrop();
      }}
      style={{
        borderRadius: 12,
        background: over ? "#e8f0fe" : "transparent",
        outline: over ? "2px dashed #1a73e8" : "2px dashed transparent",
        outlineOffset: -2,
        transform: over ? "scale(1.01)" : "scale(1)",
        transition: "background-color 130ms ease, transform 130ms ease",
        marginBottom: 2,
      }}
    >
      <div
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        onClick={onToggle}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 4,
          height: 40,
          padding: "0 5px 0 16px",
          borderRadius: 8,
          cursor: "pointer",
        }}
      >
        <span
          style={{
            display: "inline-flex",
            flex: "none",
            transform: expanded ? "rotate(90deg)" : "rotate(0deg)",
            transition: "transform 0.22s cubic-bezier(0.4,0,0.2,1)",
          }}
        >
          <Icon name="chevron_right" size={22} color="#444746" />
        </span>
        {renaming && !isNone ? (
          <input
            value={renameValue}
            autoFocus
            onClick={(e) => e.stopPropagation()}
            onChange={(e) => onRenameChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") onRenameCommit();
              if (e.key === "Escape") onRenameCommit();
            }}
            onBlur={onRenameCommit}
            style={{
              flex: 1,
              minWidth: 0,
              border: "1.5px solid #1a73e8",
              borderRadius: 6,
              padding: "3px 8px",
              fontSize: 14,
              fontWeight: 500,
              fontFamily: "inherit",
              color: "#1f1f1f",
              outline: "none",
            }}
          />
        ) : (
          <div
            style={{
              flex: 1,
              minWidth: 0,
              fontSize: 14.5,
              fontWeight: 500,
              color: isNone ? "#5f6368" : "#1f1f1f",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {name}
          </div>
        )}
        <AnimatePresence initial={false}>
          {!isNone && hover && !renaming && (
            <motion.div
              key="acts"
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "auto" }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.16, ease: "easeOut" }}
              style={{ display: "flex", alignItems: "center", gap: 2, overflow: "hidden", flex: "none" }}
            >
              <button
                type="button"
                aria-label="Label umbenennen"
                onClick={(e) => {
                  e.stopPropagation();
                  onStartRename();
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#e8f0fe")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                style={iconBtn}
              >
                <Icon name="edit" size={17} color="#444746" />
              </button>
              <button
                type="button"
                aria-label="Label löschen"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#fce8e6")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                style={iconBtn}
              >
                <Icon name="delete" size={17} color="#444746" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
        {!renaming && (
          <div style={{ width: 36, flex: "none", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span
              style={{
                minWidth: 22,
                height: 22,
                padding: "0 6px",
                borderRadius: 11,
                background: "#f1f3f4",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 12,
                fontWeight: 500,
                color: "#5f6368",
                boxSizing: "border-box",
              }}
            >
              {count}
            </span>
          </div>
        )}
      </div>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            key="body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
            style={{ overflow: "hidden" }}
          >
            <div style={{ paddingLeft: 14 }}>
              {count === 0 ? (
                <div style={{ fontSize: 12.5, color: "#9aa0a6", padding: "4px 8px 10px 8px" }}>
                  {isNone ? "Keine losen Quellen" : "Quellen hierher ziehen"}
                </div>
              ) : (
                children
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const iconBtn: React.CSSProperties = {
  flex: "none",
  width: 28,
  height: 28,
  borderRadius: "50%",
  border: "none",
  background: "transparent",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  transition: "background-color 120ms ease",
};

/** Left column — research box, saved sources (grouped into labels), empty state. */
export default function SourcesPanel({
  collapsed,
  onToggle,
  notebookId,
  sources,
  onSourcesChange,
  onAddSource,
  loading,
  fullWidth,
}: {
  collapsed: boolean;
  onToggle: () => void;
  notebookId: string;
  sources: Source[];
  onSourcesChange: () => void;
  onAddSource: () => void;
  loading?: boolean;
  fullWidth?: boolean;
}) {
  const router = useRouter();
  const [detailSource, setDetailSource] = useState<Source | null>(null);
  const overviewCache = useRef<Record<string, { overview: string; category: string }>>({});

  const [labels, setLabels] = useState<Label[]>([]);
  const [assignments, setAssignments] = useState<Record<string, string>>({});
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const knownLabels = useRef<Set<string>>(new Set());

  const [dragId, setDragId] = useState<string | null>(null);
  const [overGroup, setOverGroup] = useState<string | null>(null);
  const [bumpId, setBumpId] = useState<string | null>(null);
  const [organizing, setOrganizing] = useState(false);
  const [renaming, setRenaming] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");

  // Load (and reload on source add/remove, which can auto-create labels).
  const sourceKey = sources.map((s) => s.id).join(",");
  useEffect(() => {
    let alive = true;
    fetch(`/api/notebooks/${notebookId}/labels`)
      .then((r) => r.json())
      .then((d) => {
        if (!alive) return;
        const ls: Label[] = d.labels ?? [];
        setLabels(ls);
        setAssignments(d.assignments ?? {});
        setExpanded((prev) => {
          const next = new Set(prev);
          for (const l of ls) if (!knownLabels.current.has(l.id)) next.add(l.id); // new → expand
          knownLabels.current = new Set(ls.map((l) => l.id));
          return next;
        });
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notebookId, sourceKey]);

  const saveConfig = (nextLabels: Label[], nextAssign: Record<string, string>) => {
    fetch(`/api/notebooks/${notebookId}/labels`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ labels: nextLabels, assignments: nextAssign }),
    }).catch(() => {});
  };

  const del = async (sid: string) => {
    if (detailSource?.id === sid) setDetailSource(null);
    await fetch(`/api/notebooks/${notebookId}/sources/${sid}`, { method: "DELETE" }).catch(() => {});
    onSourcesChange();
  };

  const rename = async (sid: string, title: string) => {
    await fetch(`/api/notebooks/${notebookId}/sources/${sid}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    }).catch(() => {});
    onSourcesChange();
  };

  const assignSource = (sid: string, labelId: string | null) => {
    setAssignments((prev) => {
      const next = { ...prev };
      if (labelId) next[sid] = labelId;
      else delete next[sid];
      saveConfig(labels, next);
      return next;
    });
  };

  const dropOn = (groupId: string) => {
    if (!dragId) return;
    const target = groupId === NONE ? null : groupId;
    if (target) setExpanded((p) => new Set(p).add(target));
    assignSource(dragId, target);
    setBumpId(dragId);
    window.setTimeout(() => setBumpId(null), 360);
    setDragId(null);
    setOverGroup(null);
  };

  const addLabel = () => {
    const lbl: Label = { id: newId(), name: "Neues Label" };
    const next = [...labels, lbl];
    setLabels(next);
    setExpanded((p) => new Set(p).add(lbl.id));
    knownLabels.current.add(lbl.id);
    saveConfig(next, assignments);
    setRenaming(lbl.id);
    setRenameValue(lbl.name);
  };

  const commitRename = () => {
    if (!renaming) return;
    const name = renameValue.trim() || "Label";
    const next = labels.map((l) => (l.id === renaming ? { ...l, name } : l));
    setLabels(next);
    saveConfig(next, assignments);
    setRenaming(null);
  };

  const deleteLabel = (id: string) => {
    const next = labels.filter((l) => l.id !== id);
    const nextAssign = { ...assignments };
    for (const k of Object.keys(nextAssign)) if (nextAssign[k] === id) delete nextAssign[k];
    setLabels(next);
    setAssignments(nextAssign);
    saveConfig(next, nextAssign);
  };

  const organize = async () => {
    if (organizing) return;
    setOrganizing(true);
    const start = Date.now();
    try {
      const r = await fetch(`/api/notebooks/${notebookId}/labels/organize`, { method: "POST" });
      const d = await r.json();
      // Keep the loading animation on screen long enough to be enjoyed.
      const wait = Math.max(0, 2200 - (Date.now() - start));
      if (wait) await new Promise((res) => window.setTimeout(res, wait));
      if (r.ok) {
        const ls: Label[] = d.labels ?? [];
        setLabels(ls);
        setAssignments(d.assignments ?? {});
        knownLabels.current = new Set(ls.map((l) => l.id));
        setExpanded(new Set()); // reveal all labels collapsed, ready to expand
      }
    } catch {
      /* ignore */
    } finally {
      setOrganizing(false);
    }
  };

  // Build the rendered groups.
  const validLabelIds = new Set(labels.map((l) => l.id));
  const unassigned = sources.filter((s) => !assignments[s.id] || !validLabelIds.has(assignments[s.id]));
  const hasLabels = labels.length > 0;

  const renderRow = (s: Source) => (
    <SourceRow
      key={s.id}
      source={s}
      onDelete={() => del(s.id)}
      onRename={(title) => rename(s.id, title)}
      onOpen={() => setDetailSource(s)}
      draggable={hasLabels}
      dragging={dragId === s.id}
      bumping={bumpId === s.id}
      onDragStart={() => setDragId(s.id)}
      onDragEnd={() => {
        setDragId(null);
        setOverGroup(null);
      }}
    />
  );

  return (
    <CollapsibleColumn collapsed={collapsed} onToggle={onToggle} side="left" title="Quellen" fullWidth={fullWidth}>
      {detailSource ? (
        <SourceDetail
          source={detailSource}
          notebookId={notebookId}
          onBack={() => setDetailSource(null)}
          cache={overviewCache.current}
        />
      ) : (
        <>
          <PanelHeader
            title="Quellen"
            trailingIcon="left_panel_close"
            padding="14px 20px 12px"
            onTrailingClick={onToggle}
            trailingTooltip={'Bereich „Quellen“ minimieren'}
            divider
          />

          <div style={{ padding: "16px 16px 0" }}>
            <Tooltip label="Quelle hinzufügen" block>
              <Button
                variant="outlineBlue"
                icon="add"
                disableMotion
                onClick={onAddSource}
                style={{
                  width: "100%",
                  height: 36,
                  borderRadius: 18,
                  justifyContent: "center",
                  border: "1px solid #c4c7c5",
                }}
              >
                Quellen hinzufügen
              </Button>
            </Tooltip>
          </div>

          <div style={{ padding: "14px 16px 0" }}>
            <SourceResearch />
          </div>

          {!loading && !organizing && sources.length > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 16px 2px" }}>
              <LabelMenu
                onNewLabel={addLabel}
                onOrganize={organize}
                onBackToList={() => router.push("/list")}
              />
            </div>
          )}

          {organizing ? (
            <OrganizeLoading />
          ) : loading ? (
            <div style={{ flex: 1, overflowY: "hidden", padding: "16px 14px" }}>
              {[0, 1, 2, 3].map((i) => (
                <div key={i} style={{ display: "flex", gap: 10, padding: "10px 6px" }}>
                  <Skeleton width={20} height={20} radius={5} style={{ flex: "none" }} />
                  <div style={{ flex: 1 }}>
                    <Skeleton height={12} style={{ marginBottom: 7 }} />
                    <Skeleton height={11} width="60%" />
                  </div>
                </div>
              ))}
            </div>
          ) : sources.length > 0 ? (
            <div style={{ flex: 1, overflowY: "auto", padding: "6px 12px 16px" }}>
              {hasLabels ? (
                <>
                  {labels.map((l) => {
                    const srcs = sources.filter((s) => assignments[s.id] === l.id);
                    return (
                      <LabelGroup
                        key={l.id}
                        id={l.id}
                        name={l.name}
                        isNone={false}
                        expanded={expanded.has(l.id)}
                        over={!!dragId && overGroup === l.id}
                        renaming={renaming === l.id}
                        renameValue={renameValue}
                        onToggle={() => setExpanded((p) => {
                          const n = new Set(p);
                          if (n.has(l.id)) n.delete(l.id);
                          else n.add(l.id);
                          return n;
                        })}
                        onDrop={() => dropOn(l.id)}
                        onDragEnter={() => setOverGroup(l.id)}
                        onStartRename={() => {
                          setRenaming(l.id);
                          setRenameValue(l.name);
                        }}
                        onRenameChange={setRenameValue}
                        onRenameCommit={commitRename}
                        onDelete={() => deleteLabel(l.id)}
                        count={srcs.length}
                      >
                        {srcs.map(renderRow)}
                      </LabelGroup>
                    );
                  })}
                  {(unassigned.length > 0 || dragId) && (
                    <LabelGroup
                      id={NONE}
                      name="Ohne Label"
                      isNone
                      expanded={expanded.has(NONE) || !!dragId}
                      over={!!dragId && overGroup === NONE}
                      renaming={false}
                      renameValue=""
                      onToggle={() => setExpanded((p) => {
                        const n = new Set(p);
                        if (n.has(NONE)) n.delete(NONE);
                        else n.add(NONE);
                        return n;
                      })}
                      onDrop={() => dropOn(NONE)}
                      onDragEnter={() => setOverGroup(NONE)}
                      onStartRename={() => {}}
                      onRenameChange={() => {}}
                      onRenameCommit={() => {}}
                      onDelete={() => {}}
                      count={unassigned.length}
                    >
                      {unassigned.map(renderRow)}
                    </LabelGroup>
                  )}
                </>
              ) : (
                sources.map(renderRow)
              )}
            </div>
          ) : (
            <div
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "24px 40px",
                textAlign: "center",
              }}
            >
              <Icon name="description" size={34} color="#80868b" weight={300} />
              <div style={{ fontSize: 15, color: "#80868b", fontWeight: 500, marginTop: 14 }}>
                Gespeicherte Quellen werden hier angezeigt
              </div>
              <div style={{ fontSize: 13, color: "#5f6368", lineHeight: 1.55, marginTop: 10 }}>
                Suchen Sie oben im Web nach Quellen oder klicken Sie auf „Quellen
                hinzufügen“, um sie zu diesem Notebook hinzuzufügen.
              </div>
            </div>
          )}
        </>
      )}
    </CollapsibleColumn>
  );
}
