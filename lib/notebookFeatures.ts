/**
 * The rotating headline phrases for the create-notebook modal. Each item is a
 * coloured highlight word (its own gradient) plus the black tail that completes
 * the sentence describing what you can build. `colors` are the two gradient
 * stops, reused to tint the live lava-lamp gradient at the top of the modal so
 * it always matches the current highlight word. The first entry matches the
 * base design exactly.
 */

export interface NotebookFeature {
  highlight: string;
  rest: string;
  gradient: string;
  colors: [string, string];
  /** multiplier on the header gradient opacity (warm palettes read stronger) */
  intensity?: number;
}

export const notebookFeatures: NotebookFeature[] = [
  {
    highlight: "YouTube-Videos",
    rest: "in Audio- und Video-Zusammenfassungen umwandeln lassen",
    gradient: "linear-gradient(90deg,#4285f4,#34a853)",
    colors: ["#4285f4", "#34a853"],
  },
  {
    highlight: "PDFs",
    rest: "in interaktive Mindmaps verwandeln",
    gradient: "linear-gradient(90deg,#ea4335,#fbbc04)",
    colors: ["#ea4335", "#fbbc04"],
    intensity: 0.5,
  },
  {
    highlight: "Dokumente",
    rest: "in Quizze und Karteikarten umwandeln",
    gradient: "linear-gradient(90deg,#a142f4,#f04393)",
    colors: ["#a142f4", "#f04393"],
  },
  {
    highlight: "Webseiten",
    rest: "in klare, zitierte Zusammenfassungen verwandeln",
    gradient: "linear-gradient(90deg,#1f6fc4,#34a853)",
    colors: ["#1f6fc4", "#34a853"],
  },
  {
    highlight: "Ihre Notizen",
    rest: "in einen strukturierten Bericht verwandeln",
    gradient: "linear-gradient(90deg,#f9373c,#f04393)",
    colors: ["#f9373c", "#f04393"],
  },
];
