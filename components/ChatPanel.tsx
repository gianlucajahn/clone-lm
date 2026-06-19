"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useAnimationControls } from "framer-motion";
import Panel from "./Panel";
import PanelHeader from "./PanelHeader";
import Button from "./Button";
import Icon from "./Icon";
import NotebookGlyph from "./NotebookGlyph";
import EditableTitle from "./EditableTitle";
import ChatWatermark from "./ChatWatermark";
import ChatMenu from "./ChatMenu";
import Markdown from "./Markdown";
import HoverTooltip from "./HoverTooltip";
import FeedbackModal from "./FeedbackModal";
import Skeleton from "./Skeleton";
import Toast from "./Toast";
import { circle } from "@/lib/motion";
import { formatDate, type ChatMessage } from "@/lib/notebooks";
import chat from "./chat.module.css";

type Vote = "up" | "down";

export default function ChatPanel({
  notebookId,
  name,
  onName,
  onCustomize,
  onSaveNote,
  sourceCount,
  createdAt,
  initialMessages,
  loading,
}: {
  notebookId: string;
  name: string;
  onName: (next: string) => void;
  onCustomize: () => void;
  onSaveNote: (content: string) => void;
  sourceCount: number;
  createdAt: string;
  initialMessages: ChatMessage[];
  loading?: boolean;
}) {
  const [heroHover, setHeroHover] = useState(false);
  const [text, setText] = useState("");
  const [focused, setFocused] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [streaming, setStreaming] = useState(false);
  const [streamChunks, setStreamChunks] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [votes, setVotes] = useState<Record<number, Vote>>({});
  const [feedback, setFeedback] = useState<{ open: boolean; type: Vote; index: number }>({
    open: false,
    type: "up",
    index: -1,
  });
  const [toast, setToast] = useState<string | null>(null);
  const [todayLabel, setTodayLabel] = useState("Heute");
  const inputControls = useAnimationControls();
  const scrollRef = useRef<HTMLDivElement>(null);
  const hasText = text.trim().length > 0;

  useEffect(() => {
    const d = new Date();
    const p = (n: number) => String(n).padStart(2, "0");
    setTodayLabel(`Heute • ${p(d.getHours())}:${p(d.getMinutes())}`);
  }, []);

  // Adopt history once the notebook detail finishes loading (panel mounts first).
  useEffect(() => {
    if (!streaming) setMessages(initialMessages);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialMessages]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, suggestions, streamChunks]);


  const sendMessage = async (raw: string) => {
    const msg = raw.trim();
    if (!msg || streaming) return;
    setSuggestions([]);
    setMessages((prev) => [
      ...prev,
      { role: "user", content: msg },
      { role: "assistant", content: "" },
    ]);
    setStreaming(true);
    setStreamChunks([]);
    inputControls.start({ scale: [1, 1.022, 1], transition: { duration: 0.24, ease: "easeOut" } });

    try {
      const res = await fetch(`/api/notebooks/${notebookId}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msg }),
      });
      if (!res.body) throw new Error("Kein Stream");
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buf = "";
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        const parts = buf.split("\n\n");
        buf = parts.pop() ?? "";
        for (const part of parts) {
          const line = part.trim();
          if (!line.startsWith("data:")) continue;
          let evt: any;
          try {
            evt = JSON.parse(line.slice(5).trim());
          } catch {
            continue;
          }
          if (evt.type === "text") {
            setMessages((prev) => {
              const copy = [...prev];
              const last = copy[copy.length - 1];
              copy[copy.length - 1] = { ...last, content: last.content + evt.text };
              return copy;
            });
            setStreamChunks((prev) => [...prev, evt.text]);
          } else if (evt.type === "done") {
            setMessages((prev) => {
              const copy = [...prev];
              copy[copy.length - 1] = { ...copy[copy.length - 1], citations: evt.citations };
              return copy;
            });
            setSuggestions(evt.suggestions ?? []);
            setStreamChunks([]);
          } else if (evt.type === "error") {
            setMessages((prev) => {
              const copy = [...prev];
              copy[copy.length - 1] = {
                ...copy[copy.length - 1],
                content: "Es ist ein Fehler aufgetreten: " + evt.error,
              };
              return copy;
            });
          }
        }
      }
    } catch {
      setMessages((prev) => {
        const copy = [...prev];
        copy[copy.length - 1] = { ...copy[copy.length - 1], content: "Es ist ein Fehler aufgetreten." };
        return copy;
      });
    } finally {
      setStreaming(false);
    }
  };

  const submit = () => {
    if (!hasText) return;
    const t = text;
    setText("");
    sendMessage(t);
  };

  const copy = (content: string) => {
    navigator.clipboard?.writeText(content).then(
      () => setToast("In die Zwischenablage kopiert"),
      () => {}
    );
  };

  const empty = messages.length === 0;

  // The notebook "hero" (glyph, title, source count, Anpassen) lives at the very
  // top of the chat scroll area — visible when empty AND above the first message
  // once a conversation starts (scrolls away naturally; not fixed).
  const hero = (
    <div
      onMouseEnter={() => setHeroHover(true)}
      onMouseLeave={() => setHeroHover(false)}
      style={{
        position: "relative",
        overflow: "hidden",
        margin: "0 0 8px",
        padding: "14px 16px 16px",
        borderRadius: 16,
        background: heroHover ? "#F4F5FC" : "transparent",
        transition: "background 200ms ease",
      }}
    >
      <ChatWatermark visible={heroHover} />
      <div style={{ position: "absolute", top: 12, right: 12, zIndex: 2 }}>
        <Button
          variant="outlineBlue"
          icon="tune"
          iconSize={19}
          iconColor="#444746"
          disableMotion
          onClick={onCustomize}
          style={{ height: 38, padding: "0 16px", fontSize: 13 }}
        >
          Anpassen
        </Button>
      </div>
      <div style={{ position: "relative", zIndex: 1 }}>
        <div
          style={{
            width: 54,
            height: 54,
            borderRadius: 12,
            overflow: "hidden",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <NotebookGlyph size={54} />
        </div>
        <div style={{ marginTop: 18, marginLeft: -6 }}>
          <EditableTitle
            value={name}
            onChange={onName}
            fontSize={32}
            fontWeight={400}
            color="#1f1f1f"
            letterSpacing="-0.2px"
            align="left"
            maxWidth={520}
          />
        </div>
        <div style={{ fontSize: 14, color: "#5f6368", marginTop: 8 }}>
          {sourceCount} Quellen · {formatDate(createdAt)}
        </div>
      </div>
    </div>
  );

  return (
    <Panel style={{ flex: 1, minWidth: 0, position: "relative" }}>
      <PanelHeader
        title="Chat"
        padding="12px 22px 11px"
        divider
        trailing={<ChatMenu onCustomize={onCustomize} />}
      />

      <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column", width: "100%" }}>
      {loading ? (
        <div style={{ flex: 1, overflow: "hidden", padding: "20px 22px" }}>
          {[
            ["62%"],
            ["100%", "97%", "78%"],
            ["100%", "55%"],
            ["100%", "99%", "94%", "70%"],
            ["96%", "100%", "48%"],
            ["100%", "64%"],
          ].map((widths, p) => (
            <div key={p} style={{ marginBottom: 22 }}>
              {widths.map((w, i) => (
                <Skeleton key={i} height={13} width={w} style={{ marginBottom: 9 }} />
              ))}
            </div>
          ))}
        </div>
      ) : (
        <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", padding: "10px 22px 4px" }}>
          {hero}
          {!empty && (
          <>
          <div
            style={{
              textAlign: "center",
              fontSize: 12,
              color: "#80868b",
              margin: "4px 0 18px",
            }}
          >
            {todayLabel}
          </div>

          {messages.map((m, i) => {
            const isStreamingLast = streaming && i === messages.length - 1;
            const complete = m.role === "assistant" && m.content && !isStreamingLast;
            const vote = votes[i];
            return (
              <motion.div
                key={i}
                initial={
                  m.role === "user"
                    ? { opacity: 0, y: 16, scale: 0.96 }
                    : { opacity: 0, y: 8 }
                }
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={
                  m.role === "user"
                    ? { type: "spring", stiffness: 360, damping: 26, mass: 0.7 }
                    : { duration: 0.3, ease: "easeOut" }
                }
                style={{
                  display: "flex",
                  justifyContent: m.role === "user" ? "flex-end" : "flex-start",
                  marginBottom: 18,
                }}
              >
                <div style={{ maxWidth: "84%" }}>
                  {m.role === "user" ? (
                    <div
                      style={{
                        background: "#e7eefb",
                        color: "#1f1f1f",
                        padding: "10px 14px",
                        borderRadius: 16,
                        fontSize: 14.5,
                        lineHeight: 1.5,
                        whiteSpace: "pre-wrap",
                      }}
                    >
                      {m.content}
                    </div>
                  ) : (
                    <div style={{ color: "#1f1f1f", fontSize: 14.5, lineHeight: 1.6 }}>
                      {isStreamingLast ? (
                        streamChunks.length ? (
                          <span style={{ whiteSpace: "pre-wrap" }}>
                            {streamChunks.map((ch, ci) => (
                              <motion.span
                                key={ci}
                                initial={{ opacity: 0, y: 6 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, ease: "easeOut" }}
                                style={{ display: "inline-block", whiteSpace: "pre-wrap" }}
                              >
                                {ch}
                              </motion.span>
                            ))}
                          </span>
                        ) : (
                          <span style={{ color: "#80868b" }}>…</span>
                        )
                      ) : m.content ? (
                        <Markdown text={m.content} />
                      ) : null}
                    </div>
                  )}

                  {m.role === "assistant" && m.citations && m.citations.length > 0 && (
                    <div style={{ marginTop: 8, display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {m.citations.map((c, ci) => (
                        <a
                          key={ci}
                          href={c.url ?? undefined}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            fontSize: 12,
                            color: "#1a73e8",
                            background: "#eef3fe",
                            padding: "3px 9px",
                            borderRadius: 12,
                            textDecoration: "none",
                            maxWidth: 240,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {ci + 1}. {c.title}
                        </a>
                      ))}
                    </div>
                  )}

                  {complete && (
                    <div className={chat.actionBar}>
                      <button
                        className={chat.noteBtn}
                        onClick={() => {
                          onSaveNote(m.content);
                          setToast("In Notiz gespeichert");
                        }}
                      >
                        <Icon name="keep" size={18} color="#444746" />
                        In Notiz speichern
                      </button>
                      <HoverTooltip label="Kopieren">
                        <button className={chat.actionIcon} onClick={() => copy(m.content)} aria-label="Kopieren">
                          <Icon name="content_copy" size={18} color="#444746" />
                        </button>
                      </HoverTooltip>
                      <HoverTooltip label="Gute Antwort">
                        <button
                          className={chat.actionIcon}
                          onClick={() => setFeedback({ open: true, type: "up", index: i })}
                          aria-label="Gute Antwort"
                        >
                          <Icon name="thumb_up" size={18} color={vote === "up" ? "#1a73e8" : "#444746"} fill={vote === "up" ? 1 : 0} />
                        </button>
                      </HoverTooltip>
                      <HoverTooltip label="Schlechte Antwort">
                        <button
                          className={chat.actionIcon}
                          onClick={() => setFeedback({ open: true, type: "down", index: i })}
                          aria-label="Schlechte Antwort"
                        >
                          <Icon name="thumb_down" size={18} color={vote === "down" ? "#1a73e8" : "#444746"} fill={vote === "down" ? 1 : 0} />
                        </button>
                      </HoverTooltip>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}

          {!streaming &&
            suggestions.length > 0 &&
            messages[messages.length - 1]?.role === "assistant" && (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 10, marginBottom: 14 }}>
                {suggestions.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => sendMessage(s)}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "#e6e8ec")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "#f1f3f4")}
                    style={{
                      border: "none",
                      background: "#f1f3f4",
                      borderRadius: 16,
                      padding: "12px 18px",
                      fontSize: 14.5,
                      color: "#3c4043",
                      cursor: "pointer",
                      fontFamily: "inherit",
                      textAlign: "left",
                      alignSelf: "flex-start",
                      lineHeight: 1.3,
                      transition: "background-color 120ms ease",
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </>
          )}
        </div>
      )}
      </div>

      <div style={{ padding: "8px 14px 16px", width: "100%" }}>
        <motion.div
          animate={inputControls}
          style={{
            border: `1px solid ${focused ? "#1a73e8" : "#d9dce0"}`,
            boxShadow: focused ? "0 0 0 3px rgba(26,115,232,0.15)" : "0 0 0 0 rgba(26,115,232,0)",
            borderRadius: 16,
            display: "flex",
            alignItems: "center",
            padding: "13px 8px 13px 22px",
            gap: 12,
            background: "#fff",
            transition: "border-color 180ms ease, box-shadow 180ms ease",
          }}
        >
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                submit();
              }
            }}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder="Text eingeben..."
            style={{
              flex: 1,
              border: "none",
              outline: "none",
              fontSize: 15,
              fontFamily: "inherit",
              color: "#1f1f1f",
              background: "transparent",
              height: 40,
            }}
          />
          <div style={{ fontSize: 13, color: "#5f6368", whiteSpace: "nowrap" }}>
            {sourceCount} Quellen
          </div>
          <motion.div
            {...circle}
            onClick={submit}
            style={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              background: hasText ? "#3d5afe" : "#e9eaec",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              flex: "none",
              transition: "background-color 150ms ease",
            }}
          >
            <Icon name="arrow_forward" size={20} color={hasText ? "#fff" : "#9aa0a6"} />
          </motion.div>
        </motion.div>
      </div>

      <FeedbackModal
        open={feedback.open}
        type={feedback.type}
        onClose={() => setFeedback((f) => ({ ...f, open: false }))}
        onSend={() => {
          setVotes((prev) => ({ ...prev, [feedback.index]: feedback.type }));
          setFeedback((f) => ({ ...f, open: false }));
          setToast("Vielen Dank für Ihr Feedback!");
        }}
      />

      <Toast text={toast} onDone={() => setToast(null)} />
    </Panel>
  );
}
