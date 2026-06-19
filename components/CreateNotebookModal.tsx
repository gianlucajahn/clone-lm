"use client";

import { useEffect, useRef, useState, type ChangeEvent } from "react";
import Button from "./Button";
import IconButton from "./IconButton";
import SourceResearch from "./SourceResearch";
import RotatingHeadline from "./RotatingHeadline";
import ModalGradient from "./ModalGradient";
import ModalShell from "./ModalShell";
import Toast from "./Toast";
import { notebookFeatures } from "@/lib/notebookFeatures";
import styles from "./CreateNotebookModal.module.css";

const btnStyle = {
  height: 38,
  borderRadius: 19,
  fontWeight: 400,
  fontSize: 15,
  padding: "0 14px",
  whiteSpace: "nowrap" as const,
  flex: "none" as const,
};

function toBase64(file: File): Promise<string> {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(((r.result as string) || "").split(",")[1] ?? "");
    r.onerror = () => rej(new Error("read failed"));
    r.readAsDataURL(file);
  });
}

export default function CreateNotebookModal({
  open,
  onClose,
  notebookId,
  onImported,
}: {
  open: boolean;
  onClose: () => void;
  notebookId: string;
  onImported: () => void;
}) {
  // Rotating feature index, owned here so the headline and the header gradient
  // switch together. Only cycles while the modal is open; resets on close.
  const [index, setIndex] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [pasting, setPasting] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) {
      setIndex(0);
      return;
    }
    const id = setInterval(
      () => setIndex((p) => (p + 1) % notebookFeatures.length),
      3600
    );
    return () => clearInterval(id);
  }, [open]);

  const onFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (file.size > 20 * 1024 * 1024) {
      setToast("Die Datei ist zu groß (max. 20 MB).");
      return;
    }
    setUploading(true);
    try {
      const data = await toBase64(file);
      const r = await fetch(`/api/notebooks/${notebookId}/upload`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename: file.name,
          mediaType: file.type || "text/plain",
          data,
        }),
      });
      if (!r.ok) {
        const d = await r.json().catch(() => ({}));
        throw new Error(d.error || "Upload fehlgeschlagen.");
      }
      onImported();
      onClose();
    } catch (err: any) {
      setToast(err?.message || "Datei konnte nicht verarbeitet werden.");
    } finally {
      setUploading(false);
    }
  };

  const onPaste = async () => {
    setPasting(true);
    try {
      const text = await navigator.clipboard.readText();
      if (!text || !text.trim()) {
        setToast("In der Zwischenablage befindet sich kein Text.");
        return;
      }
      const r = await fetch(`/api/notebooks/${notebookId}/paste`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      if (!r.ok) throw new Error("Einfügen fehlgeschlagen.");
      onImported();
      onClose();
    } catch {
      setToast(
        "Zwischenablage konnte nicht gelesen werden. Erlauben Sie den Zugriff oder kopieren Sie zuerst Text."
      );
    } finally {
      setPasting(false);
    }
  };

  return (
    <ModalShell open={open} onClose={onClose} width={780}>
      <ModalGradient colors={notebookFeatures[index].colors} intensity={notebookFeatures[index].intensity} />

      <IconButton
        name="close"
        size={40}
        iconSize={24}
        iconColor="#444746"
        hoverBg="rgba(0,0,0,0.06)"
        onClick={onClose}
        style={{ position: "absolute", top: 18, right: 18, zIndex: 2 }}
      />

      <input
        ref={fileRef}
        type="file"
        accept=".pdf,.txt,.md,.markdown,.text,text/plain,application/pdf"
        style={{ display: "none" }}
        onChange={onFile}
      />

      <div style={{ position: "relative", padding: "54px 56px 44px" }}>
        <RotatingHeadline index={index} />

        <SourceResearch autoFocus />

        <div
          style={{
            marginTop: 22,
            border: "1.5px dashed #c4c7c5",
            borderRadius: 16,
            padding: "40px 24px 34px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <div style={{ fontSize: 21, color: "#3c4043" }}>
            oder laden Sie Ihre Dateien hoch
          </div>
          <div style={{ fontSize: 13, color: "#5f6368", marginTop: 8 }}>
            PDF, Bilder, Dokumente, Audio{" "}
            <span className={styles.underline}>und mehr</span>
          </div>
          <div
            style={{
              display: "flex",
              gap: 10,
              marginTop: 28,
              flexWrap: "wrap",
              justifyContent: "center",
            }}
          >
            <Button
              variant="outlineBlue"
              icon={uploading ? "hourglass_top" : "upload"}
              iconColor="#444746"
              disableMotion
              onClick={() => !uploading && fileRef.current?.click()}
              style={btnStyle}
            >
              {uploading ? "Wird gelesen…" : "Dateien hochladen"}
            </Button>
            <Button variant="outlineBlue" icon="smart_display" iconColor="#ea4335" iconFill={1} muted style={btnStyle}>
              Websites
            </Button>
            <Button variant="outlineBlue" icon="cloud" iconColor="#444746" muted style={btnStyle}>
              Drive
            </Button>
            <Button
              variant="outlineBlue"
              icon={pasting ? "hourglass_top" : "content_paste"}
              iconColor="#444746"
              disableMotion
              onClick={() => !pasting && onPaste()}
              style={btnStyle}
            >
              {pasting ? "Wird eingefügt…" : "Kopierter Text"}
            </Button>
          </div>
        </div>
      </div>

      <Toast text={toast} onDone={() => setToast(null)} />
    </ModalShell>
  );
}
