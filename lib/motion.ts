import type { TargetAndTransition, Transition } from "framer-motion";

/**
 * Shared micro-interaction presets so every interactive element across the app
 * feels consistent — a snappy spring on hover/press, never over the top.
 */

export const pressSpring: Transition = {
  type: "spring",
  stiffness: 400,
  damping: 26,
  mass: 0.6,
};

interface InteractionPreset {
  whileHover: TargetAndTransition;
  whileTap: TargetAndTransition;
  transition: Transition;
}

/** Pill buttons — a small lift + grow. */
export const pill: InteractionPreset = {
  whileHover: { scale: 1.035, y: -1 },
  whileTap: { scale: 0.96 },
  transition: pressSpring,
};

/** Circular icon buttons — a confident pop. */
export const circle: InteractionPreset = {
  whileHover: { scale: 1.12 },
  whileTap: { scale: 0.9 },
  transition: pressSpring,
};

/** Dropdown chips. */
export const chip: InteractionPreset = {
  whileHover: { scale: 1.05, y: -1 },
  whileTap: { scale: 0.96 },
  transition: pressSpring,
};

/** Studio tiles — lift off the surface with a soft shadow. */
export const card: InteractionPreset = {
  whileHover: { scale: 1.03, y: -3, boxShadow: "0 8px 20px rgba(0,0,0,0.12)" },
  whileTap: { scale: 0.985 },
  transition: pressSpring,
};

/** Small standalone icons (panel header actions). */
export const iconTap: InteractionPreset = {
  whileHover: { scale: 1.18 },
  whileTap: { scale: 0.85 },
  transition: pressSpring,
};
