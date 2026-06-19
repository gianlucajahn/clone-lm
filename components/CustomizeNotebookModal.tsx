"use client";

import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import ModalShell from "./ModalShell";
import IconButton from "./IconButton";
import Icon from "./Icon";
import Toggle from "./Toggle";
import NotebookArt from "./NotebookArt";

/**
 * The "… anpassen" popup opened from the Anpassen button or the chat menu.
 * Lets you set a cover image, rename the notebook (synced live with the rest of
 * the app), and optionally write a custom summary. Uses the shared ModalShell
 * so the pop-in/out animation matches the create-notebook modal.
 */
/** Read an image file, downscale it, and return a JPEG data-URL (keeps it small). */
function fileToDataUrl(file: File, maxW = 1280, quality = 0.85): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, maxW / img.width);
        const w = Math.round(img.width * scale);
        const h = Math.round(img.height * scale);
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (!ctx) return resolve(reader.result as string);
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.onerror = reject;
      img.src = reader.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function CustomizeNotebookModal({
  open,
  onClose,
  name,
  onName,
  initialSummary = "",
  initialCover = null,
  onApply,
  onUploadCover,
}: {
  open: boolean;
  onClose: () => void;
  name: string;
  onName: (next: string) => void;
  initialSummary?: string;
  initialCover?: string | null;
  onApply: (summary: string) => void;
  onUploadCover: (dataUrl: string) => void;
}) {
  const [customSummary, setCustomSummary] = useState(false);
  const [summary, setSummary] = useState("");
  const [cover, setCover] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setSummary(initialSummary);
      setCustomSummary(!!initialSummary);
      setCover(initialCover);
    }
  }, [open, initialSummary, initialCover]);

  const apply = () => {
    onApply(customSummary ? summary.trim() : "");
    onClose();
  };

  const onPickFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploading(true);
    try {
      const dataUrl = await fileToDataUrl(file);
      setCover(dataUrl);
      onUploadCover(dataUrl);
    } catch {
      /* ignore */
    } finally {
      setUploading(false);
    }
  };

  return (
    <ModalShell open={open} onClose={onClose} width={720}>
      {/* Header */}
      <div
        style={{
          flex: "none",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "16px 16px 16px 24px",
          borderBottom: "1px solid #e8eaed",
        }}
      >
        <div style={{ fontSize: 20, fontWeight: 400, color: "#1f1f1f" }}>
          {`„${name}“ anpassen`}
        </div>
        <IconButton
          name="close"
          size={40}
          iconSize={24}
          iconColor="#444746"
          hoverBg="rgba(0,0,0,0.06)"
          onClick={onClose}
        />
      </div>

      {/* Scrollable body */}
      <div style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: 24 }}>
        {/* Cover image area */}
        <div
          style={{
            position: "relative",
            overflow: "hidden",
            height: 180,
            borderRadius: 12,
            background: "#E9EBFB",
          }}
        >
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={onPickFile}
            style={{ display: "none" }}
          />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            style={{
              position: "absolute",
              top: 16,
              right: 16,
              zIndex: 2,
              display: "flex",
              alignItems: "center",
              gap: 8,
              height: 36,
              padding: "0 16px",
              borderRadius: 18,
              background: "#5f6368",
              color: "#fff",
              border: "none",
              fontSize: 14,
              fontWeight: 500,
              fontFamily: "inherit",
              cursor: "pointer",
            }}
          >
            <Icon name={uploading ? "progress_activity" : "upload"} size={18} color="#fff" />
            {uploading ? "Wird hochgeladen…" : "Hochladen"}
          </button>
          {cover ? (
            <img
              src={cover}
              alt="Notebook-Banner"
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : (
            <div style={{ position: "absolute", right: 20, bottom: -28 }}>
              <NotebookArt size={190} color="#d2d7f4" />
            </div>
          )}
        </div>

        {/* Notebook title (outlined, floating label) */}
        <div style={{ position: "relative", marginTop: 24 }}>
          <span
            style={{
              position: "absolute",
              top: -7,
              left: 12,
              background: "#fff",
              padding: "0 4px",
              fontSize: 12,
              color: "#5f6368",
            }}
          >
            Notebook-Titel
          </span>
          <input
            value={name}
            onChange={(e) => onName(e.target.value)}
            style={{
              width: "100%",
              height: 50,
              border: "1px solid #c4c7c5",
              borderRadius: 8,
              padding: "0 14px",
              fontSize: 16,
              color: "#1f1f1f",
              outline: "none",
              fontFamily: "inherit",
              background: "transparent",
            }}
          />
        </div>

        {/* Custom summary toggle */}
        <div style={{ marginTop: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                background: "#f1f3f4",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flex: "none",
              }}
            >
              <Icon name="subject" size={22} color="#444746" />
            </div>
            <div style={{ flex: 1, fontSize: 15, fontWeight: 500, color: "#1f1f1f" }}>
              Benutzerdefinierte Notebook-Zusammenfassung festlegen
            </div>
            <Toggle on={customSummary} onChange={setCustomSummary} />
          </div>
          <div
            style={{
              fontSize: 13,
              color: "#5f6368",
              lineHeight: 1.5,
              marginTop: 10,
              marginLeft: 56,
            }}
          >
            Standardmäßig erstellt LM Clone automatisch eine Zusammenfassung, die
            jedes Mal aktualisiert wird, wenn Sie das Notebook öffnen. Sie können
            dies überschreiben, indem Sie manuell eine benutzerdefinierte
            Zusammenfassung festlegen.
          </div>

          <AnimatePresence initial={false}>
            {customSummary && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                style={{ marginLeft: 56 }}
              >
                <textarea
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder={"Geben Sie Ihre „Info“-Nachricht ein..."}
                  style={{
                    marginTop: 16,
                    width: "100%",
                    minHeight: 110,
                    border: "1px solid #c4c7c5",
                    borderRadius: 12,
                    padding: 14,
                    fontSize: 14,
                    color: "#1f1f1f",
                    fontFamily: "inherit",
                    resize: "vertical",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Footer */}
      <div
        style={{
          flex: "none",
          display: "flex",
          justifyContent: "flex-end",
          padding: "14px 24px",
          borderTop: "1px solid #e8eaed",
        }}
      >
        <motion.button
          type="button"
          onClick={apply}
          whileHover={{ backgroundColor: "#3450e0" }}
          whileTap={{ scale: 0.97 }}
          style={{
            height: 36,
            padding: "0 24px",
            borderRadius: 18,
            background: "#3d5afe",
            color: "#fff",
            border: "none",
            fontSize: 14,
            fontWeight: 500,
            fontFamily: "inherit",
            cursor: "pointer",
          }}
        >
          Fertig
        </motion.button>
      </div>
    </ModalShell>
  );
}
