"use client";

import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import { useEffect } from "react";

function ToolbarButton({
  onClick,
  active,
  children,
  label,
}: {
  onClick: () => void;
  active?: boolean;
  children: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      aria-label={label}
      aria-pressed={active}
      className={`px-2.5 py-1.5 rounded-md text-[12px] font-bold cursor-pointer border-none ${
        active ? "bg-bd-gold text-bd-ink" : "bg-black/20 text-white/70 hover:bg-white/10"
      }`}
    >
      {children}
    </button>
  );
}

function Toolbar({ editor }: { editor: Editor }) {
  return (
    <div className="flex flex-wrap gap-1.5 p-2 bg-black/30 border-b border-white/15 rounded-t-lg">
      <ToolbarButton label="Judul 1" active={editor.isActive("heading", { level: 1 })} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}>H1</ToolbarButton>
      <ToolbarButton label="Judul 2" active={editor.isActive("heading", { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>H2</ToolbarButton>
      <ToolbarButton label="Judul 3" active={editor.isActive("heading", { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>H3</ToolbarButton>
      <ToolbarButton label="Tebal" active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()}><b>B</b></ToolbarButton>
      <ToolbarButton label="Miring" active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()}><i>I</i></ToolbarButton>
      <ToolbarButton label="Daftar poin" active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()}>• List</ToolbarButton>
      <ToolbarButton label="Daftar angka" active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()}>1. List</ToolbarButton>
      <ToolbarButton
        label="Tautan"
        active={editor.isActive("link")}
        onClick={() => {
          if (editor.isActive("link")) {
            editor.chain().focus().unsetLink().run();
            return;
          }
          const url = window.prompt("URL tautan:");
          if (url) editor.chain().focus().setLink({ href: url }).run();
        }}
      >
        Link
      </ToolbarButton>
      <ToolbarButton label="Kutipan" active={editor.isActive("blockquote")} onClick={() => editor.chain().focus().toggleBlockquote().run()}>&ldquo;&rdquo;</ToolbarButton>
      <ToolbarButton label="Urungkan" onClick={() => editor.chain().focus().undo().run()}>&#8630;</ToolbarButton>
      <ToolbarButton label="Ulangi" onClick={() => editor.chain().focus().redo().run()}>&#8631;</ToolbarButton>
    </div>
  );
}

/** Editor WYSIWYG (Tiptap) — dipakai admin buat isi konten teks hukum (Ketentuan Pengguna,
 * Kebijakan Privasi) tanpa perlu tahu HTML. `value`/`onChange` berupa string HTML. */
export function RichTextEditor({ value, onChange }: { value: string; onChange: (html: string) => void }) {
  const editor = useEditor({
    extensions: [StarterKit, Link.configure({ openOnClick: false })],
    content: value,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: "legal-content min-h-50 max-h-125 overflow-y-auto px-3.5 py-3 outline-none text-[13px]",
      },
    },
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  });

  // Sinkronkan kalau `value` berubah dari luar (mis. reset form) tanpa lewat mengetik di editor.
  useEffect(() => {
    if (!editor) return;
    if (editor.getHTML() !== value) editor.commands.setContent(value, { emitUpdate: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, editor]);

  if (!editor) return null;

  return (
    <div className="bg-black/20 border border-white/15 rounded-lg overflow-hidden">
      <Toolbar editor={editor} />
      <EditorContent editor={editor} className="bg-white text-bd-ink" />
    </div>
  );
}
