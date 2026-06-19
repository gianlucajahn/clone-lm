/**
 * The little pixel-art notebook glyph shown in the Chat panel. Ported verbatim
 * from the base design — same cell map and same seeded LCG so the colours land
 * exactly where they do in the original (deterministic, no hydration mismatch).
 */

const PALETTE = ["#7c4dff", "#b388ff", "#536dfe", "#9575cd", "#e040fb"];

const CELLS: [number, number][] = [
  [2, 2], [3, 2], [7, 2], [8, 2],
  [2, 3], [4, 3], [6, 3], [8, 3], [9, 3],
  [3, 4], [5, 4], [7, 4],
  [2, 5], [4, 5], [6, 5], [8, 5],
  [3, 6], [5, 6], [7, 6], [9, 6],
  [2, 7], [4, 7], [6, 7], [8, 7],
  [3, 8], [5, 8], [7, 8],
];

function buildPixels() {
  let seed = 7;
  const rand = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
  return CELLS.map(([x, y]) => ({
    x,
    y,
    c: PALETTE[Math.floor(rand() * PALETTE.length)],
  }));
}

const PIXELS = buildPixels();

export default function NotebookGlyph({ size = 54 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 12 12"
      style={{ display: "block" }}
    >
      <rect width={12} height={12} rx={2.2} fill="#2b2240" />
      {PIXELS.map((p, i) => (
        <rect key={i} x={p.x} y={p.y} width={1} height={1} fill={p.c} />
      ))}
    </svg>
  );
}
