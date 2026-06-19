import { Fragment, type ReactNode } from "react";
import Icon from "./Icon";

/** Inline **bold** and [text](url) links. */
function inline(text: string): ReactNode[] {
  const out: ReactNode[] = [];
  const re = /(\*\*[^*]+\*\*)|(\[[^\]]+\]\([^)\s]+\))/g;
  let last = 0;
  let key = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) out.push(<Fragment key={key++}>{text.slice(last, m.index)}</Fragment>);
    const tok = m[0];
    if (tok.startsWith("**")) {
      out.push(
        <strong key={key++} style={{ fontWeight: 600 }}>
          {tok.slice(2, -2)}
        </strong>
      );
    } else {
      const lm = /^\[([^\]]+)\]\(([^)\s]+)\)$/.exec(tok);
      if (lm) {
        out.push(
          <a
            key={key++}
            href={lm[2]}
            target="_blank"
            rel="noreferrer"
            style={{ color: "#1a73e8", textDecoration: "none" }}
          >
            {lm[1]}
          </a>
        );
      } else {
        out.push(<Fragment key={key++}>{tok}</Fragment>);
      }
    }
    last = m.index + tok.length;
  }
  if (last < text.length) out.push(<Fragment key={key++}>{text.slice(last)}</Fragment>);
  return out;
}

type CalloutType = "warning" | "tip" | "success" | "error" | "info";
const CALLOUTS: Record<CalloutType, { bg: string; border: string; icon: string; color: string }> = {
  warning: { bg: "#fef7e0", border: "#f4b400", icon: "warning", color: "#9a6700" },
  tip: { bg: "#e8f0fe", border: "#4285f4", icon: "lightbulb", color: "#1a56c4" },
  success: { bg: "#e6f4ea", border: "#34a853", icon: "check_circle", color: "#1a7a3e" },
  error: { bg: "#fce8e6", border: "#ea4335", icon: "error", color: "#c5221f" },
  info: { bg: "#eef1f6", border: "#80868b", icon: "info", color: "#3c4043" },
};

function calloutType(text: string): CalloutType {
  const t = text.toLowerCase();
  if (/⚠|achtung|warn|vorsicht|wichtig/.test(t)) return "warning";
  if (/✅|erfolg|geschafft|fertig/.test(t)) return "success";
  if (/❌|🚫|❗|fehler|gefahr|kritisch/.test(t)) return "error";
  if (/💡|tipp|empfehl/.test(t)) return "tip";
  return "info";
}

function withBreaks(text: string): ReactNode[] {
  const lines = text.split("\n");
  return lines.map((l, li) => (
    <Fragment key={li}>
      {inline(l)}
      {li < lines.length - 1 && <br />}
    </Fragment>
  ));
}

/** Lightweight markdown: headings, paragraphs, bullet lists, **bold**, and ">" callout boxes. */
export default function Markdown({ text }: { text: string }) {
  const blocks = text.split(/\n\n+/);
  return (
    <>
      {blocks.map((block, bi) => {
        const lines = block.split("\n");
        const last = bi === blocks.length - 1;

        const heading = lines.length === 1 && /^(#{1,6})\s+(.*)$/.exec(lines[0]);
        if (heading) {
          const level = Math.min(heading[1].length, 3);
          const Tag = `h${level}` as "h1" | "h2" | "h3";
          return <Tag key={bi}>{inline(heading[2])}</Tag>;
        }

        // ">" blockquote → styled callout / intel box
        const isQuote = lines.some((l) => /^\s*>/.test(l)) && lines.every((l) => /^\s*>/.test(l) || !l.trim());
        if (isQuote) {
          const content = lines
            .map((l) => l.replace(/^\s*>\s?/, ""))
            .join("\n")
            .trim();
          const type = calloutType(content);
          const c = CALLOUTS[type];
          const rest = content.replace(/^\s*\p{Extended_Pictographic}️?\s*/u, "").trim() || content;
          return (
            <div
              key={bi}
              style={{
                display: "flex",
                gap: 11,
                alignItems: "flex-start",
                background: c.bg,
                borderLeft: `4px solid ${c.border}`,
                borderRadius: "0 8px 8px 0",
                padding: "12px 14px",
                margin: last ? "0 0 12px" : "0 0 22px",
              }}
            >
              <Icon name={c.icon} size={20} color={c.border} fill={1} style={{ flex: "none", marginTop: 1 }} />
              <div style={{ flex: 1, minWidth: 0, color: c.color, fontSize: 14, lineHeight: 1.55 }}>
                {withBreaks(rest)}
              </div>
            </div>
          );
        }

        const isList =
          lines.length > 0 && lines.every((l) => /^\s*[-*]\s+/.test(l));
        if (isList) {
          return (
            <ul key={bi} style={{ margin: last ? "0" : "0 0 12px", paddingLeft: 22 }}>
              {lines.map((l, li) => (
                <li key={li} style={{ marginBottom: 4 }}>
                  {inline(l.replace(/^\s*[-*]\s+/, ""))}
                </li>
              ))}
            </ul>
          );
        }
        // drop horizontal-rule lines ("---", "***", "___") entirely
        const cleaned = lines
          .filter((l) => !/^\s*(-{3,}|\*{3,}|_{3,})\s*$/.test(l))
          .join("\n");
        if (!cleaned.trim()) return null;
        return (
          <p key={bi} style={{ margin: last ? "0" : "0 0 12px" }}>
            {withBreaks(cleaned)}
          </p>
        );
      })}
    </>
  );
}
