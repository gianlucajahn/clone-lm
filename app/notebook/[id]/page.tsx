"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import NotebookView from "@/components/NotebookView";
import { useNotebooks } from "@/components/NotebookStore";
import type { ChatMessage, Source } from "@/lib/notebooks";
import type { ArtifactMeta } from "@/lib/studioKinds";

export default function NotebookPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const router = useRouter();
  const { create, rename, justCreated, clearJustCreated } = useNotebooks();

  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("Unbenanntes Notebook");
  const [createdAt, setCreatedAt] = useState(new Date().toISOString());
  const [summary, setSummary] = useState("");
  const [cover, setCover] = useState<string | null>(null);
  const [sources, setSources] = useState<Source[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [artifacts, setArtifacts] = useState<ArtifactMeta[]>([]);

  const [sourceOpen, setSourceOpen] = useState(false);
  const [customizeOpen, setCustomizeOpen] = useState(false);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    Promise.all([
      fetch(`/api/notebooks/${id}`).then((r) => r.json()),
      fetch(`/api/notebooks/${id}/artifacts`).then((r) => r.json()),
      fetch(`/api/notebooks/${id}/cover`).then((r) => r.json()),
    ])
      .then(([d, a, c]) => {
        if (!alive) return;
        if (d.notebook) {
          setTitle(d.notebook.title);
          setCreatedAt(d.notebook.created_at);
          setSummary(d.notebook.summary ?? "");
        }
        setSources(d.sources ?? []);
        setMessages(d.messages ?? []);
        setArtifacts(a.artifacts ?? []);
        setCover(c.cover ?? null);
      })
      .catch(() => {})
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [id]);

  // A freshly created notebook auto-opens the "add source" modal.
  useEffect(() => {
    if (justCreated === id) {
      setSourceOpen(true);
      clearJustCreated();
    }
  }, [justCreated, id, clearJustCreated]);

  const refreshSources = () =>
    fetch(`/api/notebooks/${id}/sources`)
      .then((r) => r.json())
      .then((d) => setSources(d.sources ?? []))
      .catch(() => {});

  const refreshArtifacts = () =>
    fetch(`/api/notebooks/${id}/artifacts`)
      .then((r) => r.json())
      .then((d) => setArtifacts(d.artifacts ?? []))
      .catch(() => {});

  const uploadCover = async (dataUrl: string) => {
    setCover(dataUrl);
    await fetch(`/api/notebooks/${id}/cover`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ image: dataUrl }),
    }).catch(() => {});
  };

  const saveNote = async (content: string) => {
    await fetch(`/api/notebooks/${id}/notes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    }).catch(() => {});
    refreshArtifacts();
  };

  return (
    <NotebookView
      key={id}
      notebookId={id}
      name={title}
      onName={(t) => {
        setTitle(t);
        rename(id, t);
      }}
      createdAt={createdAt}
      initialSummary={summary}
      cover={cover}
      onUploadCover={uploadCover}
      sources={sources}
      onSourcesChange={refreshSources}
      messages={messages}
      artifacts={artifacts}
      onSaveNote={saveNote}
      onArtifactsChanged={refreshArtifacts}
      loading={loading}
      onCreateNotebook={async () => {
        const newId = await create();
        if (newId) router.push(`/notebook/${newId}`);
      }}
      onGoToList={() => router.push("/list")}
      sourceModalOpen={sourceOpen}
      onOpenSource={() => setSourceOpen(true)}
      onCloseSource={() => setSourceOpen(false)}
      customizeOpen={customizeOpen}
      onOpenCustomize={() => setCustomizeOpen(true)}
      onCloseCustomize={() => setCustomizeOpen(false)}
    />
  );
}
