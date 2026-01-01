"use client";
import { useEditor } from "@tiptap/react";

// --- Tiptap Core Extensions ---
import { StarterKit } from "@tiptap/starter-kit";
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

import { SimpleEditor } from "@/components/tiptap-templates/simple/simple-editor";
import { useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { Session } from "@supabase/supabase-js";

export default function Home({ session }: { session: Session }) {
  const editor = useEditor({
    immediatelyRender: false,
    editorProps: {
      attributes: {
        autocomplete: "off",
        autocorrect: "off",
        autocapitalize: "off",
        "aria-label": "Main content area, start typing to enter text.",
        class: "simple-editor",
      },
    },
    extensions: [
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
    // Load the editor content from LocalStorage
    const note = JSON.parse(localStorage.getItem("note") || "{}");
    if (note.id) {
      editor?.commands.setContent(note.content);
    } else {
      supabase
        .from("notes")
        .select("id,content")
        .then(({ data, error }) => {
          if (error) {
            console.error("Error fetching notes:", error);
          } else {
            if (data?.length === 0) {
              supabase
                .from("notes")
                .insert({
                  content: {},
                  user_id: session?.user.id,
                })
                .select("id,content")
                .single()
                .then(({ data, error }) => {
                  if (error) {
                    console.error("Error creating note:", error);
                  } else {
                    localStorage.setItem(
                      "note",
                      JSON.stringify({ id: data.id, content: {} })
                    );
                  }
                });
            } else {
              localStorage.setItem(
                "note",
                JSON.stringify({ id: data[0].id, content: data[0].content })
              );
              editor?.commands.setContent(data[0].content.content);
            }
          }
        });
    }
  }, [editor]);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  editor?.on("update", (event) => {
    // Save the editor content to LocalStorage
    const note = JSON.parse(localStorage.getItem("note") || "{}");
    localStorage.setItem(
      "note",
      JSON.stringify({ id: note.id, content: event.editor.getJSON() })
    );
    // Cancel previous wait and restart timer
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      supabase
        .from("notes")
        .update({
          content: note.content,
        })
        .eq("id", note.id)
        .then();
      timerRef.current = null;
    }, 2000);
  });

  return <SimpleEditor editor={editor} />;
}
