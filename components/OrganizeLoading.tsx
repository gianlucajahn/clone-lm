"use client";

import { motion } from "framer-motion";
import Icon from "./Icon";

/**
 * Eye-catching loading state shown while "Neu organisieren" runs: a fluid,
 * colour-shifting gradient (green → orange → red → blue → purple) with drifting
 * blobs, and a caption that fades up from below.
 */
export default function OrganizeLoading() {
  return (
    <div style={{ flex: 1, minHeight: 0, padding: "0 16px 16px", display: "flex" }}>
      <div
        style={{
          position: "relative",
          flex: 1,
          minHeight: 300,
          borderRadius: 18,
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* animated base gradient */}
        <div className="cl-fluid-bg" style={{ position: "absolute", inset: 0 }} />

        {/* drifting colour blobs for fluid depth */}
        <div style={{ position: "absolute", inset: -30, filter: "blur(44px)", opacity: 0.7 }}>
          <div
            className="cl-blob-a"
            style={{
              position: "absolute",
              width: 180,
              height: 180,
              left: "4%",
              top: "12%",
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(76,201,140,0.75), transparent 70%)",
            }}
          />
          <div
            className="cl-blob-b"
            style={{
              position: "absolute",
              width: 200,
              height: 200,
              right: "2%",
              bottom: "8%",
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(150,116,255,0.7), transparent 70%)",
            }}
          />
          <div
            className="cl-blob-a"
            style={{
              position: "absolute",
              width: 150,
              height: 150,
              right: "22%",
              top: "6%",
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(255,142,84,0.6), transparent 70%)",
              animationDelay: "-4s",
            }}
          />
          <div
            className="cl-blob-b"
            style={{
              position: "absolute",
              width: 160,
              height: 160,
              left: "16%",
              bottom: "6%",
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(255,107,107,0.5), transparent 70%)",
              animationDelay: "-6s",
            }}
          />
        </div>

        {/* caption — fades in from below */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          style={{ position: "relative", textAlign: "center", padding: "0 34px" }}
        >
          <motion.div
            animate={{ scale: [1, 1.14, 1] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
            style={{ display: "inline-flex" }}
          >
            <Icon name="auto_awesome" size={30} color="#3d5afe" fill={1} />
          </motion.div>
          <div style={{ fontSize: 15, color: "#1f2733", fontWeight: 500, marginTop: 16, lineHeight: 1.5 }}>
            Quellen wird automatisch ein Label hinzugefügt…
          </div>
          <div style={{ fontSize: 13, color: "#39463d", marginTop: 12, lineHeight: 1.5 }}>
            Profitipp: Jede Quelle kann mehrere Labels haben.
          </div>
        </motion.div>
      </div>
    </div>
  );
}
