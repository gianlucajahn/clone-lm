"use client";

import Chip, { type ChipOption } from "./Chip";
import Icon from "./Icon";
import DriveLogo from "./DriveLogo";
import styles from "./SourceSearchRow.module.css";

const sourceOptions: ChipOption[] = [
  {
    iconNode: <Icon name="language" size={20} color="#444746" />,
    label: "Web",
    description: "Beste Quellen aus dem Web",
  },
  {
    iconNode: <DriveLogo size={20} />,
    label: "Drive",
    description: "Ihre Inhalte auf Google Drive",
    disabled: true,
  },
];

const researchOptions: ChipOption[] = [
  {
    iconNode: <Icon name="recenter" size={20} color="#444746" />,
    label: "Schnelle Recherche",
    description: "Ideal für schnelle Ergebnisse",
  },
  {
    iconNode: <Icon name="travel_explore" size={20} color="#444746" />,
    label: "Deep Research",
    description: "Ausführlicher Bericht und detaillierte Ergebnisse",
  },
];

/**
 * The "Web ▾ / Schnelle Recherche ▾ / search" control row. Appears both in the
 * Sources panel and inside the create-notebook modal, so it lives here once.
 */
export default function SourceSearchRow() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <Chip options={sourceOptions} />
      <Chip options={researchOptions} />
      <div
        className={styles.searchBtn}
        style={{
          marginLeft: "auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          flex: "none",
          width: 36,
          height: 36,
          borderRadius: "50%",
          alignSelf: "center",
        }}
      >
        <Icon name="search" size={21} color="#5f6368" weight={300} />
      </div>
    </div>
  );
}
