"use client";
import { useEditor } from "@tiptap/react";

// --- Tiptap Core Extensions ---
import { Image } from "@tiptap/extension-image";
import { TaskItem, TaskList } from "@tiptap/extension-list";
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
import { BlurLockedExtension } from "@/components/BlurLockedExtension";
import { StarterKit } from "@tiptap/starter-kit";

import "@/app/public.css";
import { SimpleEditor } from "@/components/tiptap-templates/simple/simple-editor";

export default function Public({ noteId }: { noteId: string }) {
  const editor = useEditor({
    immediatelyRender: false,
    editable: false,
    extensions: [
      BlurLockedExtension.configure({
        blurClassName: "blur",
        blurMarkers: true, // set false to keep @lock/@unlock visible
      }),
      StarterKit.configure({
        horizontalRule: false,
        link: {
          openOnClick: false,
          enableClickSelection: true,
        },
      }),
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
      .rpc("get_note_content_randomized", { note_id: noteId })
      .then(({ data, error }) => {
        if (error) {
          console.error("Error fetching notes:", error);
        } else {
          editor?.commands.setContent(data);
        }
      });
  }, [editor]);

  return <SimpleEditor editor={editor} />;
}
