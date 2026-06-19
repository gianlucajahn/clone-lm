"use client";

import { useEffect, useState } from "react";
import Icon from "./Icon";
import Markdown from "./Markdown";
import type { Source } from "@/lib/notebooks";

interface Overview {
  overview: string;
  category: string;
}

/** The "Quellenübersicht" detail view for a single source (AI summary + content). */
export default function SourceDetail({
  source,
  notebookId,
  onBack,
  cache,
}: {
  source: Source;
  notebookId: string;
  onBack: () => void;
  cache: Record<string, Overview>;
}) {
  const [data, setData] = useState<Overview | null>(cache[source.id] ?? null);
  const [loading, setLoading] = useState(!cache[source.id]);
  const [open, setOpen] = useState(true);

  useEffect(() => {
    if (cache[source.id]) {
      setData(cache[source.id]);
      setLoading(false);
      return;
    }
    let alive = true;
    setLoading(true);
    fetch(`/api/notebooks/${notebookId}/sources/${source.id}/overview`)
      .then((r) => r.json())
      .then((d) => {
        if (!alive) return;
        const o = { overview: d.overview ?? "", category: d.category ?? "" };
        cache[source.id] = o;
        setData(o);
      })
      .catch(() => {})
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [source.id, notebookId, cache]);

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
      {/* header */}
      <div
        style={{
          flex: "none",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "14px 20px 12px",
          borderBottom: "1px solid #e8eaed",
        }}
      >
        <div style={{ fontSize: 16, fontWeight: 500, color: "#1f1f1f" }}>Quellen</div>
        <button
          onClick={onBack}
          aria-label="Zurück"
          onMouseEnter={(e) => (e.currentTarget.style.background = "#f1f3f4")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          style={{
            width: 34,
            height: 34,
            borderRadius: "50%",
            border: "none",
            background: "transparent",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            transition: "background-color 120ms ease",
          }}
        >
          <Icon name="close_fullscreen" size={19} color="#444746" />
        </button>
      </div>

      {/* body */}
      <div style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: "18px 20px 24px" }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
          <div style={{ flex: 1, fontSize: 20, fontWeight: 500, color: "#1f1f1f", lineHeight: 1.3 }}>
            {source.title}
          </div>
          {source.url && (
            <a
              href={source.url}
              target="_blank"
              rel="noreferrer"
              aria-label="Quelle öffnen"
              style={{ flex: "none", display: "inline-flex", marginTop: 2, color: "#444746" }}
            >
              <Icon name="open_in_new" size={20} color="#444746" />
            </a>
          )}
        </div>

        {data?.category && (
          <div
            style={{
              display: "inline-block",
              marginTop: 12,
              background: "#eef1fb",
              color: "#1a56c4",
              fontSize: 12.5,
              fontWeight: 500,
              padding: "4px 11px",
              borderRadius: 14,
            }}
          >
            {data.category}
          </div>
        )}

        {/* Quellenübersicht box */}
        <div
          style={{
            marginTop: 16,
            background: "#eef1fb",
            border: "1px solid #e1e6f7",
            borderRadius: 14,
            padding: "14px 16px",
          }}
        >
          <div
            onClick={() => setOpen((o) => !o)}
            style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}
          >
            <Icon name="auto_awesome" size={20} color="#5e6ad2" fill={1} />
            <div style={{ flex: 1, fontSize: 15, fontWeight: 500, color: "#1f1f1f" }}>
              Quellenübersicht
            </div>
            <Icon name={open ? "expand_less" : "expand_more"} size={22} color="#444746" />
          </div>
          {open && (
            <div style={{ marginTop: 10, maxHeight: 280, overflowY: "auto", paddingRight: 4 }}>
              {loading ? (
                <div style={{ display: "flex", alignItems: "center", gap: 10, color: "#5f6368", fontSize: 13.5, padding: "4px 0" }}>
                  <span className="cl-spin" style={{ display: "inline-flex" }}>
                    <Icon name="progress_activity" size={18} color="#5e6ad2" />
                  </span>
                  Quellenübersicht wird erstellt…
                </div>
              ) : (
                <div style={{ fontSize: 14, lineHeight: 1.6, color: "#3c4043" }}>
                  <Markdown text={data?.overview ?? ""} />
                </div>
              )}
            </div>
          )}
        </div>

        {/* raw source content */}
        {(source.content || source.snippet) && (
          <div style={{ marginTop: 18, fontSize: 13.5, lineHeight: 1.6, color: "#5f6368" }}>
            <Markdown text={source.content || source.snippet || ""} />
          </div>
        )}
      </div>
    </div>
  );
}
