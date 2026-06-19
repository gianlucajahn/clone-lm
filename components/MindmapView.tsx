"use client";

import {
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import Icon from "./Icon";
import { type Artifact } from "@/lib/studioKinds";
import styles from "./studio.module.css";

interface MMNode {
  label: string;
  children?: MMNode[];
}

interface PNode {
  id: string;
  label: string;
  depth: number;
  parentId: string | null;
  hasChildren: boolean;
  collapsed: boolean;
  yc: number;
}

const ROW_GAP = 46;
const COL_GAP = 72;

function estimate(label: string) {
  return Math.min(300, Math.max(56, label.length * 7 + 28));
}

function nodeStyle(depth: number): CSSProperties {
  if (depth === 0) return { background: "#d3d9f8", color: "#1a237e" };
  if (depth === 1) return { background: "#c5d6f5", color: "#1f3a6b" };
  return { background: "#bce3cf", color: "#13502a" };
}

function arrowColor(depth: number) {
  if (depth === 0) return "#3949ab";
  if (depth === 1) return "#1f3a6b";
  return "#1a7a4a";
}

/** Lay the tree out left-to-right; leaves take sequential rows, parents centre on their children. */
function layoutTree(root: MMNode, collapsed: Set<string>) {
  const nodes: PNode[] = [];
  let slot = 0;
  let maxDepth = 0;

  function visit(node: MMNode, depth: number, parentId: string | null, id: string): number {
    maxDepth = Math.max(maxDepth, depth);
    const kids = node.children ?? [];
    const hasChildren = kids.length > 0;
    const showKids = hasChildren && !collapsed.has(id);
    let yc: number;
    if (showKids) {
      const ys = kids.map((c, i) => visit(c, depth + 1, id, `${id}.${i}`));
      yc = (ys[0] + ys[ys.length - 1]) / 2;
    } else {
      yc = slot * ROW_GAP + ROW_GAP / 2;
      slot += 1;
    }
    nodes.push({
      id,
      label: node.label,
      depth,
      parentId,
      hasChildren,
      collapsed: hasChildren && collapsed.has(id),
      yc,
    });
    return yc;
  }

  visit(root, 0, null, "r");
  return { nodes, height: Math.max(slot, 1) * ROW_GAP, maxDepth };
}

/** Pre-collapse everything below the second level (root + its children stay open). */
function initialCollapsed(root: MMNode): Set<string> {
  const set = new Set<string>();
  const walk = (node: MMNode, depth: number, id: string) => {
    const kids = node.children ?? [];
    if (depth >= 1 && kids.length) set.add(id);
    kids.forEach((c, i) => walk(c, depth + 1, `${id}.${i}`));
  };
  walk(root, 0, "r");
  return set;
}

export default function MindmapView({ artifact }: { artifact: Artifact }) {
  const root: MMNode = artifact.data?.root ?? { label: artifact.title };
  const [collapsed, setCollapsed] = useState<Set<string>>(() => initialCollapsed(root));
  const [zoom, setZoom] = useState(1);
  const [widths, setWidths] = useState<Record<string, number>>({});
  const [pan, setPan] = useState({ x: 120, y: 60 });
  const [dragging, setDragging] = useState(false);

  const refs = useRef<Record<string, HTMLDivElement | null>>({});
  const drag = useRef<{ sx: number; sy: number; px: number; py: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const centered = useRef(false);

  const { nodes, height, maxDepth } = useMemo(
    () => layoutTree(root, collapsed),
    [root, collapsed]
  );

  // Measure pill widths so columns + connectors are pixel-accurate.
  useLayoutEffect(() => {
    const next: Record<string, number> = {};
    let changed = false;
    for (const n of nodes) {
      const el = refs.current[n.id];
      if (el) {
        const w = el.offsetWidth;
        next[n.id] = w;
        if (widths[n.id] !== w) changed = true;
      }
    }
    if (changed) setWidths(next);

    // Centre the root vertically the first time we have a real layout.
    if (!centered.current && containerRef.current) {
      const rootNode = nodes.find((n) => !n.parentId);
      if (rootNode) {
        const ch = containerRef.current.clientHeight;
        setPan({ x: 96, y: Math.max(20, ch / 2 - rootNode.yc) });
        centered.current = true;
      }
    }
  });

  const widthOf = (n: PNode) => widths[n.id] ?? estimate(n.label);

  const colMax: number[] = [];
  for (const n of nodes) colMax[n.depth] = Math.max(colMax[n.depth] ?? 0, widthOf(n));
  const colX: number[] = [0];
  for (let d = 1; d <= maxDepth; d++) colX[d] = colX[d - 1] + (colMax[d - 1] ?? 120) + COL_GAP;

  const totalWidth = colX[maxDepth] + (colMax[maxDepth] ?? 120) + 80;
  const totalHeight = height + 30;
  const byId = useMemo(() => {
    const m: Record<string, PNode> = {};
    for (const n of nodes) m[n.id] = n;
    return m;
  }, [nodes]);

  const toggle = (id: string) =>
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const download = () => {
    const lines: string[] = [];
    const walk = (n: MMNode, d: number) => {
      lines.push("  ".repeat(d) + "- " + n.label);
      (n.children ?? []).forEach((c) => walk(c, d + 1));
    };
    walk(root, 0);
    const blob = new Blob([lines.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${artifact.title}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div
      ref={containerRef}
      style={{
        position: "relative",
        height: "100%",
        overflow: "hidden",
        cursor: dragging ? "grabbing" : "grab",
        userSelect: "none",
      }}
      onMouseDown={(e) => {
        drag.current = { sx: e.clientX, sy: e.clientY, px: pan.x, py: pan.y };
        setDragging(true);
      }}
      onMouseMove={(e) => {
        if (!drag.current) return;
        setPan({
          x: drag.current.px + (e.clientX - drag.current.sx),
          y: drag.current.py + (e.clientY - drag.current.sy),
        });
      }}
      onMouseUp={() => {
        drag.current = null;
        setDragging(false);
      }}
      onMouseLeave={() => {
        drag.current = null;
        setDragging(false);
      }}
    >
      {/* controls */}
      <div
        style={{
          position: "absolute",
          left: 6,
          top: 6,
          display: "flex",
          flexDirection: "column",
          gap: 8,
          zIndex: 10,
        }}
      >
        <button className={styles.ctrlBtn} onClick={() => setZoom((z) => Math.min(1.8, +(z + 0.15).toFixed(2)))} aria-label="Vergrößern">
          <Icon name="add" size={20} color="#444746" />
        </button>
        <button className={styles.ctrlBtn} onClick={() => setZoom((z) => Math.max(0.4, +(z - 0.15).toFixed(2)))} aria-label="Verkleinern">
          <Icon name="remove" size={20} color="#444746" />
        </button>
        <button className={styles.ctrlBtn} onClick={download} aria-label="Herunterladen">
          <Icon name="download" size={20} color="#444746" />
        </button>
      </div>

      {/* canvas */}
      <div
        style={{
          position: "absolute",
          left: pan.x,
          top: pan.y,
          width: totalWidth,
          height: totalHeight,
          transform: `scale(${zoom})`,
          transformOrigin: "left top",
        }}
      >
        <svg width={totalWidth} height={totalHeight} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
          {nodes.map((n) => {
            if (!n.parentId) return null;
            const p = byId[n.parentId];
            if (!p) return null;
            const sx = colX[p.depth] + widthOf(p) + (p.hasChildren ? 26 : 8);
            const sy = p.yc;
            const ex = colX[n.depth] - 6;
            const ey = n.yc;
            const mid = sx + (ex - sx) * 0.5;
            return (
              <path
                key={`c-${n.id}`}
                d={`M ${sx} ${sy} C ${mid} ${sy}, ${mid} ${ey}, ${ex} ${ey}`}
                fill="none"
                stroke="#aab4e6"
                strokeWidth={1.6}
              />
            );
          })}
        </svg>

        {nodes.map((n) => {
          const ns = nodeStyle(n.depth);
          const left = colX[n.depth];
          return (
            <div key={n.id} style={{ position: "absolute", left, top: n.yc, transform: "translateY(-50%)" }}>
              <div
                ref={(el) => {
                  refs.current[n.id] = el;
                }}
                style={{
                  ...ns,
                  display: "inline-block",
                  padding: "7px 13px",
                  borderRadius: 9,
                  fontSize: 13,
                  lineHeight: 1.25,
                  whiteSpace: "nowrap",
                  maxWidth: 300,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  boxShadow: "0 1px 2px rgba(0,0,0,0.08)",
                }}
              >
                {n.label}
              </div>
              {n.hasChildren && (
                <div
                  onMouseDown={(e) => e.stopPropagation()}
                  onClick={() => toggle(n.id)}
                  title={n.collapsed ? "Erweitern" : "Reduzieren"}
                  style={{
                    position: "absolute",
                    left: widthOf(n) + 4,
                    top: "50%",
                    transform: "translateY(-50%)",
                    width: 22,
                    height: 22,
                    borderRadius: "50%",
                    background: "#fff",
                    border: "1px solid #d0d4e4",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
                  }}
                >
                  <Icon
                    name={n.collapsed ? "chevron_right" : "chevron_left"}
                    size={16}
                    color={arrowColor(n.depth)}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
