/** Studio panel cards — colours aligned to Google's NotebookLM palette. */

export interface StudioItem {
  icon: string;
  label: string;
  /** card background */
  bg: string;
  /** icon + label colour */
  color: string;
  beta?: boolean;
  /** not selectable — shows a not-allowed cursor on hover */
  disabled?: boolean;
  /** artifact kind generated on click (undefined = not generatable) */
  kind?: string;
  /** full description shown in the dark hover tooltip below the card */
  tooltip: string;
}

export const studioItems: StudioItem[] = [
  {
    icon: "graphic_eq",
    label: "Audio-...",
    bg: "#edeffb",
    color: "#224484",
    disabled: true,
    tooltip: "KI-Podcast basierend auf Ihren Quellen erstellen",
  },
  {
    icon: "slideshow",
    label: "Präsentation",
    bg: "#f2f2e8",
    color: "#796731",
    beta: true,
    disabled: true,
    tooltip:
      "Präsentation mithilfe von KI und basierend auf Ihren Quellen erstellen",
  },
  {
    icon: "movie",
    label: "Videoübersicht",
    bg: "#e1f1e6",
    color: "#0F5223",
    disabled: true,
    tooltip: "Erklärvideo erstellen, das Ihnen von KI präsentiert wird",
  },
  {
    icon: "account_tree",
    label: "Mindmap",
    bg: "#f0e9f0",
    color: "#802272",
    kind: "mindmap",
    tooltip: "Mindmap mithilfe von KI erstellen, basierend auf Ihren Quellen",
  },
  {
    icon: "summarize",
    label: "Berichte",
    bg: "#f2f2e8",
    color: "#796731",
    kind: "report",
    tooltip: "Berichte auf Grundlage Ihrer Quellen erstellen",
  },
  {
    icon: "style",
    label: "Karteikarten",
    bg: "#f7edeb",
    color: "#8c2e2a",
    kind: "flashcards",
    tooltip:
      "Karteikarten mithilfe von KI basierend auf Ihren Quellen erstellen",
  },
  {
    icon: "quiz",
    label: "Quiz",
    bg: "#def1f7",
    color: "#056A95",
    kind: "quiz",
    tooltip: "Interaktives Quiz auf Grundlage Ihrer Quellen mit KI erstellen",
  },
  {
    icon: "bar_chart",
    label: "Infografik",
    bg: "#f0e9f0",
    color: "#802272",
    beta: true,
    kind: "infographic",
    tooltip: "Infografik mithilfe von KI erstellen, basierend auf Ihren Quellen",
  },
  {
    icon: "table_chart",
    label: "Datentabelle",
    bg: "#edeffb",
    color: "#224484",
    kind: "datatable",
    tooltip: "Eine Datentabelle aus Ihren Quellen erstellen",
  },
];
