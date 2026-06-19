export interface Label {
  id: string;
  name: string;
}

export interface LabelConfig {
  labels: Label[];
  /** sourceId -> labelId */
  assignments: Record<string, string>;
}
