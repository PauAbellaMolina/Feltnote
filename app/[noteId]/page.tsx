"use client";
import { useParams } from "next/navigation";
import Public from "../pages/Public";

export default function NoteIdPage() {
  const { noteId }: { noteId: string } = useParams();

  if (!noteId) {
    return <div>Note not found</div>;
  }

  return <Public noteId={noteId} />;
}
