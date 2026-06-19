"use client";

import NotebookArt from "./NotebookArt";

/**
 * Faint decorative line-art revealed inside the chat hero on hover. Sits in the
 * right side of the hero box and is clipped by it, so the box + this artwork are
 * only ever drawn on that top region of the chat (matching NotebookLM).
 */
export default function ChatWatermark({ visible }: { visible: boolean }) {
  return (
    <div
      style={{
        position: "absolute",
        right: 30,
        bottom: -52,
        opacity: visible ? 1 : 0,
        transition: "opacity 320ms ease",
        pointerEvents: "none",
        zIndex: 0,
      }}
    >
      <NotebookArt size={220} color="#cdd3f2" />
    </div>
  );
}
