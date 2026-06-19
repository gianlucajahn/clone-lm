import type { CSSProperties } from "react";

export interface IconProps {
  /** Material Symbols ligature name, e.g. "graphic_eq" */
  name: string;
  size?: number;
  color?: string;
  /** 0 = outlined, 1 = filled */
  fill?: 0 | 1;
  /** optical weight (100–700) */
  weight?: number;
  style?: CSSProperties;
  className?: string;
}

/**
 * Single source of truth for every Material Symbols glyph in the app so icon
 * sizing / fill / weight stay consistent wherever they're used.
 */
export default function Icon({
  name,
  size = 24,
  color,
  fill,
  weight,
  style,
  className,
}: IconProps) {
  const settings: string[] = [];
  if (fill !== undefined) settings.push(`'FILL' ${fill}`);
  if (weight !== undefined) settings.push(`'wght' ${weight}`);

  return (
    <span
      className={
        "material-symbols-outlined" + (className ? ` ${className}` : "")
      }
      style={{
        fontSize: size,
        color,
        fontVariationSettings: settings.length ? settings.join(", ") : undefined,
        ...style,
      }}
    >
      {name}
    </span>
  );
}
