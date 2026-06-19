"use client";

import { useState } from "react";
import Icon from "./Icon";

/** A source's favicon (via Google's favicon service), falling back to a doc icon. */
export default function Favicon({ url, size = 18 }: { url: string | null; size?: number }) {
  const [fail, setFail] = useState(false);
  let host: string | null = null;
  if (url) {
    try {
      host = new URL(url).hostname.replace(/^www\./, "");
    } catch {
      host = null;
    }
  }
  if (host && !fail) {
    return (
      <img
        src={`https://www.google.com/s2/favicons?domain=${host}&sz=64`}
        alt=""
        width={size}
        height={size}
        onError={() => setFail(true)}
        style={{ borderRadius: 4, display: "block" }}
      />
    );
  }
  return <Icon name="description" size={size + 2} color="#5f6368" />;
}
