"use client";
import { EditorContent, useEditor } from "@tiptap/react";

import Document from "@tiptap/extension-document";
import Paragraph from "@tiptap/extension-paragraph";
import Text from "@tiptap/extension-text";
import Heading from "@tiptap/extension-heading";
import ListItem from "@tiptap/extension-list-item";

// --- Tiptap Core Extensions ---
import { Image } from "@tiptap/extension-image";
import { BulletList, TaskItem, TaskList } from "@tiptap/extension-list";
import { TextAlign } from "@tiptap/extension-text-align";
import { Typography } from "@tiptap/extension-typography";
import { Highlight } from "@tiptap/extension-highlight";
import { Subscript } from "@tiptap/extension-subscript";
import { Superscript } from "@tiptap/extension-superscript";
import { Selection } from "@tiptap/extensions";

// --- Tiptap Node ---
import { ImageUploadNode } from "@/components/tiptap-node/image-upload-node/image-upload-node-extension";
import { HorizontalRule } from "@/components/tiptap-node/horizontal-rule-node/horizontal-rule-node-extension";

// --- Lib ---
import { handleImageUpload, MAX_FILE_SIZE } from "@/lib/tiptap-utils";

// --- Styles ---
import "@/components/tiptap-templates/simple/simple-editor.scss";

import { useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function Public({ noteId }: { noteId: string }) {
  const editor = useEditor({
    immediatelyRender: false,
    editable: false,
    extensions: [
      Document,
      Paragraph,
      Text,
      Heading,
      BulletList,
      ListItem,
      HorizontalRule,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Highlight.configure({ multicolor: true }),
      Image,
      Typography,
      Superscript,
      Subscript,
      Selection,
      ImageUploadNode.configure({
        accept: "image/*",
        maxSize: MAX_FILE_SIZE,
        limit: 3,
        upload: handleImageUpload,
        onError: (error) => console.error("Upload failed:", error),
      }),
    ],
  });

  useEffect(() => {
    if (!editor) return;
    supabase
      .from("notes")
      .select("id,content")
      .eq("id", noteId)
      .single()
      .then(({ data, error }) => {
        if (error) {
          console.error("Error fetching notes:", error);
        } else {
          editor?.commands.setContent(data.content.content);
        }
      });
  }, [editor]);

  return <EditorContent editor={editor} />;
}
