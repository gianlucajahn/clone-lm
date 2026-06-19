import Icon from "@/components/Icon";

/**
 * Shown by the App Router while navigating into a notebook (route load / compile),
 * before the page mounts and renders its own skeletons. Gives instant feedback
 * when a notebook card is clicked on the list page.
 */
export default function NotebookLoading() {
  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        background: "#EDEFFA",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'Roboto', Arial, sans-serif",
      }}
    >
      <span className="cl-spin" style={{ display: "inline-flex" }}>
        <Icon name="progress_activity" size={44} color="#3d5afe" />
      </span>
    </div>
  );
}
