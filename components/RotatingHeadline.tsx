"use client";

import { AnimatePresence, motion } from "framer-motion";
import { notebookFeatures } from "@/lib/notebookFeatures";
import styles from "./CreateNotebookModal.module.css";

/**
 * The modal headline that cycles through what you can create. The gradient
 * highlight word rolls up & fades out as the next rolls in from the bottom
 * (price-toggle style), while the black tail gracefully cross-fades to match
 * the new feature. Controlled: the parent owns `index` so the headline and the
 * header gradient switch in lockstep.
 */
export default function RotatingHeadline({ index }: { index: number }) {
  const feature = notebookFeatures[index];

  return (
    <div
      style={{
        minHeight: 76,
        maxWidth: 560,
        margin: "0 auto 32px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          textAlign: "center",
          fontSize: 28,
          fontWeight: 400,
          lineHeight: 1.3,
          color: "#1f1f1f",
        }}
      >
        {/* Rolling gradient highlight */}
        <span className={styles.rollWrapper}>
          <AnimatePresence initial={false} mode="popLayout">
            <motion.span
              key={index}
              className={styles.clipText}
              style={{ backgroundImage: feature.gradient }}
              initial={{ y: "115%", opacity: 0 }}
              animate={{ y: "0%", opacity: 1 }}
              exit={{ y: "-115%", opacity: 0 }}
              transition={{
                y: { type: "spring", stiffness: 260, damping: 24 },
                opacity: { duration: 0.25, ease: "easeOut" },
              }}
            >
              {feature.highlight}
            </motion.span>
          </AnimatePresence>
        </span>

        {/* Cross-fading black tail */}
        <AnimatePresence initial={false} mode="wait">
          <motion.span
            key={index}
            style={{ display: "inline" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.26, ease: "easeOut" }}
          >
            {feature.rest}
          </motion.span>
        </AnimatePresence>
      </div>
    </div>
  );
}
