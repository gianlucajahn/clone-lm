"use client";

import { useRouter } from "next/navigation";
import NotebookListView from "@/components/NotebookListView";
import { useNotebooks } from "@/components/NotebookStore";

export default function ListPage() {
  const router = useRouter();
  const { notebooks, create, rename, remove } = useNotebooks();

  return (
    <NotebookListView
      notebooks={notebooks}
      onOpen={(id) => router.push(`/notebook/${id}`)}
      onCreate={async () => {
        const newId = await create();
        if (newId) router.push(`/notebook/${newId}`);
      }}
      onDelete={remove}
      onRename={rename}
    />
  );
}
