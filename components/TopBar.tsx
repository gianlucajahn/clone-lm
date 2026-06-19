"use client";

import { motion } from "framer-motion";
import { useState, type CSSProperties } from "react";
import Button from "./Button";
import Icon from "./Icon";
import EditableTitle from "./EditableTitle";
import Skeleton from "./Skeleton";
import ShareModal from "./ShareModal";
import SettingsMenu from "./SettingsMenu";
import AppsMenu from "./AppsMenu";
import Toast from "./Toast";
import { circle } from "@/lib/motion";

/** Freigeben / Einstellungen: 1px light-grey border, matched to the create button height. */
const topActionStyle: CSSProperties = {
  height: 34,
  borderRadius: 18,
  padding: "0 16px",
  border: "1px solid #dadce0",
};

/** Application top bar: notebook identity on the left, actions on the right. */
export default function TopBar({
  name,
  onName,
  onCreate,
  onLogoClick,
  loading,
  compact,
}: {
  name: string;
  onName: (next: string) => void;
  onCreate: () => void;
  /** navigate to the notebook collection */
  onLogoClick?: () => void;
  loading?: boolean;
  /** tablet/phone: collapse the secondary actions */
  compact?: boolean;
}) {
  const [shareOpen, setShareOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  return (
    <>
    <div
      style={{
        height: 60,
        flex: "none",
        display: "flex",
        alignItems: "center",
        padding: "0 18px",
        gap: 12,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 20,
          flex: 1,
          minWidth: 0,
        }}
      >
        <motion.div
          {...circle}
          onClick={onLogoClick}
          title="Zur Notebook-Übersicht"
          style={{
            position: "relative",
            top: 2,
            left: 3,
            width: 36,
            height: 36,
            borderRadius: "50%",
            background: "#1f1f1f",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flex: "none",
            cursor: onLogoClick ? "pointer" : "default",
          }}
        >
          <Icon name="graphic_eq" size={24} color="#fff" fill={1} />
        </motion.div>
        {loading ? (
          <Skeleton width={200} height={20} />
        ) : (
          <EditableTitle
            value={name}
            onChange={onName}
            fontSize={22}
            fontWeight={400}
            color="#1f1f1f"
            align="left"
            maxWidth={360}
          />
        )}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 10, flex: "none" }}>
        {compact ? (
          <Button
            variant="primary"
            icon="add"
            onClick={onCreate}
            aria-label="Notebook erstellen"
            style={{ width: 40, padding: 0, justifyContent: "center", marginRight: 4 }}
          />
        ) : (
          <>
            <Button variant="primary" icon="add" onClick={onCreate} style={{ marginRight: 10 }}>
              Notebook erstellen
            </Button>
            <Button
              variant="ghostBlue"
              icon="share"
              disableMotion
              style={topActionStyle}
              onClick={() => setShareOpen(true)}
            >
              Freigeben
            </Button>
            <SettingsMenu />
            <AppsMenu />
          </>
        )}
        <motion.div
          {...circle}
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
            cursor: "pointer",
            marginLeft: 2,
          }}
        >
          G
        </motion.div>
      </div>
    </div>

    <ShareModal
      open={shareOpen}
      onClose={() => setShareOpen(false)}
      title={name}
      onCopied={() => {
        setShareOpen(false);
        setToast("Link kopiert");
      }}
    />
    <Toast text={toast} onDone={() => setToast(null)} />
    </>
  );
}
