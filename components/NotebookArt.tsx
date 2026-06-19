/** The faint mountain + sun line-art used as the notebook decorative artwork. */
export default function NotebookArt({
  size = 220,
  color = "#cdd3f2",
}: {
  size?: number;
  color?: string;
}) {
  return (
    <svg
      viewBox="0 0 200 200"
      width={size}
      height={size}
      fill="none"
      stroke={color}
      strokeWidth={13}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ display: "block" }}
      aria-hidden
    >
      <circle cx="150" cy="52" r="20" />
      <path d="M14 178 Q66 56 104 132 Q132 188 186 64" />
    </svg>
  );
}
