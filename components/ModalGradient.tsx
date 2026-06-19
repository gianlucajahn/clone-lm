"use client";

import { motion } from "framer-motion";
import styles from "./CreateNotebookModal.module.css";

/**
 * The animated header wash. Three blurred blobs drift/breathe (CSS) while their
 * colours cross-fade (Framer Motion) to the current feature's gradient stops,
 * so the lava-lamp palette always matches the rolling highlight word. `intensity`
 * scales the opacity per feature (warm palettes read stronger, so they're dialed
 * down).
 */
export default function ModalGradient({
  colors,
  intensity = 1,
}: {
  colors: [string, string];
  intensity?: number;
}) {
  const [a, b] = colors;
  const colorTransition = { duration: 0.7, ease: "easeInOut" as const };

  return (
    <div className={styles.gradientLayer}>
      <motion.div
        className={`${styles.blob} ${styles.blob1}`}
        animate={{ backgroundColor: a }}
        transition={colorTransition}
        style={{
          left: "6%",
          top: "-44%",
          width: 360,
          height: 320,
          opacity: 0.28 * intensity,
        }}
      />
      <motion.div
        className={`${styles.blob} ${styles.blob2}`}
        animate={{ backgroundColor: b }}
        transition={colorTransition}
        style={{
          left: "54%",
          top: "-48%",
          width: 390,
          height: 340,
          opacity: 0.28 * intensity,
        }}
      />
      <motion.div
        className={`${styles.blob} ${styles.blob3}`}
        animate={{ backgroundColor: a }}
        transition={colorTransition}
        style={{
          left: "34%",
          top: "-26%",
          width: 300,
          height: 280,
          opacity: 0.15 * intensity,
        }}
      />
    </div>
  );
}
