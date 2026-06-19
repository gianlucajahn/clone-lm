import type { Metadata } from "next";
import "./globals.css";
import { NotebookStoreProvider } from "@/components/NotebookStore";

export const metadata: Metadata = {
  title: "Clone LM",
  description: "An exact replica of Google NotebookLM, built with Next.js.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin=""
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
        />
      </head>
      <body>
        <NotebookStoreProvider>{children}</NotebookStoreProvider>
      </body>
    </html>
  );
}
