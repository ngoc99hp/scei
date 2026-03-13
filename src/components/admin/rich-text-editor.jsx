"use client"
// src/components/admin/rich-text-editor.jsx
//
// STABLE VERSION — tương thích Tiptap v3 + React 19
//
// Packages cần cài:
//   npm install @tiptap/react @tiptap/pm @tiptap/starter-kit
//              @tiptap/extension-link @tiptap/extension-placeholder
//              @tiptap/extension-underline @tiptap/extension-highlight
//              @tiptap/extension-text-align @tiptap/extension-character-count

import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import LinkExt from "@tiptap/extension-link"
import Placeholder from "@tiptap/extension-placeholder"
import UnderlineExt from "@tiptap/extension-underline"
import HighlightExt from "@tiptap/extension-highlight"
import TextAlignExt from "@tiptap/extension-text-align"
import CharacterCountExt from "@tiptap/extension-character-count"
import { useEffect, useState } from "react"
import {
  Bold, Italic, Strikethrough, Underline as UnderlineIcon,
  Heading1, Heading2, Heading3,
  List, ListOrdered, Quote, Code, Code2,
  Link as LinkIcon, Unlink, Minus,
  Undo2, Redo2, Maximize2, Minimize2,
  AlignLeft, AlignCenter, AlignRight,
  Highlighter, Search,
} from "lucide-react"

// ── Tooltip ───────────────────────────────────────────────────
function Tip({ label, children }) {
  return (
    <span className="relative group/tip">
      {children}
      <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-0.5 rounded-md bg-gray-900 text-white text-[10px] whitespace-nowrap opacity-0 group-hover/tip:opacity-100 transition-opacity z-[200] shadow-lg">
        {label}
      </span>
    </span>
  )
}

// ── Toolbar button ────────────────────────────────────────────
function Btn({ onClick, active, disabled, label, children }) {
  return (
    <Tip label={label}>
      <button
        type="button"
        onMouseDown={(e) => { e.preventDefault(); onClick?.() }}
        disabled={disabled}
        className={[
          "flex items-center justify-center w-7 h-7 rounded-md transition-all duration-100 select-none",
          active   ? "bg-gray-900 text-white shadow-sm" : "text-gray-500 hover:bg-gray-100 hover:text-gray-800",
          disabled ? "opacity-25 cursor-not-allowed" : "cursor-pointer",
        ].join(" ")}
      >
        {children}
      </button>
    </Tip>
  )
}

function Sep() {
  return <div className="w-px h-4 bg-gray-200 mx-0.5 shrink-0" />
}

// ── Find & Replace ────────────────────────────────────────────
function FindReplaceBar({ editor, onClose }) {
  const [find,    setFind]    = useState("")
  const [replace, setReplace] = useState("")
  const [count,   setCount]   = useState(0)

  useEffect(() => {
    if (!find || !editor) { setCount(0); return }
    const n = editor.getText().split(find).length - 1
    setCount(Math.max(0, n))
  }, [find, editor])

  function doReplace() {
    if (!find) return
    const escaped = find.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
    const next = editor.getHTML().replace(new RegExp(escaped, "g"), replace)
    editor.commands.setContent(next, false)
    setCount(0)
  }

  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 border-b border-amber-100">
      <Search size={13} className="text-amber-500 shrink-0" />
      <div className="flex items-center gap-1.5">
        <input
          autoFocus
          value={find}
          onChange={(e) => setFind(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && doReplace()}
          placeholder="Tìm..."
          className="border border-gray-300 rounded-md px-2 py-1 text-xs w-28 focus:outline-none focus:ring-1 focus:ring-amber-400 bg-white"
        />
        {count > 0 && <span className="text-[10px] text-amber-600 font-semibold">{count} kết quả</span>}
      </div>
      <input
        value={replace}
        onChange={(e) => setReplace(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && doReplace()}
        placeholder="Thay bằng..."
        className="border border-gray-300 rounded-md px-2 py-1 text-xs w-36 focus:outline-none focus:ring-1 focus:ring-amber-400 bg-white"
      />
      <button
        type="button"
        onClick={doReplace}
        className="px-2.5 py-1 rounded-md bg-amber-500 text-white text-xs font-medium hover:bg-amber-600 transition-colors"
      >
        Thay tất cả
      </button>
      <button type="button" onClick={onClose} className="ml-auto text-gray-400 hover:text-gray-600 text-xs px-1">✕</button>
    </div>
  )
}

// ── Link Bar ─────────────────────────────────────────────────
function LinkBar({ editor, onClose }) {
  const [url, setUrl] = useState(editor?.getAttributes("link").href || "")

  function apply() {
    if (!url) editor.chain().focus().extendMarkRange("link").unsetLink().run()
    else editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run()
    onClose()
  }

  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 border-b border-blue-100">
      <LinkIcon size={13} className="text-blue-500 shrink-0" />
      <input
        autoFocus
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter") apply(); if (e.key === "Escape") onClose() }}
        placeholder="https://..."
        className="flex-1 border border-gray-300 rounded-md px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-400 bg-white"
      />
      <button type="button" onClick={apply}
        className="px-2.5 py-1 rounded-md bg-blue-600 text-white text-xs font-medium hover:bg-blue-700 transition-colors">
        Áp dụng
      </button>
      {editor?.isActive("link") && (
        <button type="button"
          onClick={() => { editor.chain().focus().unsetLink().run(); onClose() }}
          className="px-2.5 py-1 rounded-md bg-gray-100 text-gray-600 text-xs hover:bg-gray-200 transition-colors">
          Xóa link
        </button>
      )}
      <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xs px-1">✕</button>
    </div>
  )
}

// ── Selection toolbar (nổi lên khi bôi đen) ──────────────────
function SelectionToolbar({ editor, onOpenLink }) {
  const [rect, setRect] = useState(null)

  useEffect(() => {
    if (!editor) return
    function onSelectionUpdate() {
      const { from, to } = editor.state.selection
      if (from === to) { setRect(null); return }
      const domSel = window.getSelection()
      if (!domSel || domSel.rangeCount === 0) { setRect(null); return }
      const r = domSel.getRangeAt(0).getBoundingClientRect()
      setRect({ top: r.top, left: r.left + r.width / 2 })
    }
    function onBlur() { setTimeout(() => setRect(null), 200) }
    editor.on("selectionUpdate", onSelectionUpdate)
    editor.on("blur", onBlur)
    return () => { editor.off("selectionUpdate", onSelectionUpdate); editor.off("blur", onBlur) }
  }, [editor])

  if (!rect || !editor) return null

  return (
    <div
      style={{ position: "fixed", top: rect.top - 44, left: rect.left, transform: "translateX(-50%)", zIndex: 9999 }}
      className="flex items-center gap-0.5 bg-gray-900 rounded-lg px-1.5 py-1 shadow-2xl border border-white/10"
      onMouseDown={(e) => e.preventDefault()}
    >
      {[
        { fn: () => editor.chain().focus().toggleBold().run(),      active: editor.isActive("bold"),      icon: <Bold size={12} /> },
        { fn: () => editor.chain().focus().toggleItalic().run(),    active: editor.isActive("italic"),    icon: <Italic size={12} /> },
        { fn: () => editor.chain().focus().toggleUnderline().run(), active: editor.isActive("underline"), icon: <UnderlineIcon size={12} /> },
        { fn: () => editor.chain().focus().toggleHighlight().run(), active: editor.isActive("highlight"), icon: <Highlighter size={12} /> },
        { fn: onOpenLink,                                            active: editor.isActive("link"),      icon: <LinkIcon size={12} /> },
      ].map(({ fn, active, icon }, i) => (
        <button
          key={i}
          type="button"
          onMouseDown={(e) => { e.preventDefault(); fn() }}
          className={[
            "flex items-center justify-center w-6 h-6 rounded transition-colors",
            active ? "bg-white text-gray-900" : "text-gray-300 hover:text-white hover:bg-white/10",
          ].join(" ")}
        >
          {icon}
        </button>
      ))}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// MAIN EDITOR
// ─────────────────────────────────────────────────────────────
export default function RichTextEditor({
  value,
  onChange,
  placeholder = "Bắt đầu viết nội dung...",
  minHeight   = 320,
}) {
  const [fullscreen, setFullscreen] = useState(false)
  const [showFind,   setShowFind]   = useState(false)
  const [showLink,   setShowLink]   = useState(false)

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        // Tắt link & underline trong StarterKit vì chúng ta dùng bản riêng
        // có config HTMLAttributes tùy chỉnh
        heading:        { levels: [1, 2, 3] },
        bulletList:     { HTMLAttributes: { class: "list-disc pl-5 space-y-1 my-3" } },
        orderedList:    { HTMLAttributes: { class: "list-decimal pl-5 space-y-1 my-3" } },
        blockquote:     { HTMLAttributes: { class: "border-l-[3px] border-gray-300 pl-4 text-gray-500 italic my-4" } },
        code:           { HTMLAttributes: { class: "bg-gray-100 text-rose-600 rounded px-1.5 py-0.5 text-[0.85em] font-mono" } },
        codeBlock:      { HTMLAttributes: { class: "bg-gray-950 text-gray-100 rounded-lg p-4 text-sm font-mono overflow-x-auto my-4 leading-relaxed" } },
        horizontalRule: { HTMLAttributes: { class: "my-6 border-gray-200" } },
        // Tắt để tránh duplicate với package riêng
        link:           false,
        underline:      false,
      }),
      // Dùng bản riêng có HTMLAttributes đầy đủ
      UnderlineExt,
      HighlightExt.configure({
        multicolor:     false,
        HTMLAttributes: { class: "bg-yellow-200 rounded-sm px-0.5" },
      }),
      TextAlignExt.configure({ types: ["heading", "paragraph"] }),
      LinkExt.configure({
        openOnClick:    false,
        HTMLAttributes: { class: "text-blue-600 underline underline-offset-2 hover:text-blue-800 cursor-pointer", rel: "noopener noreferrer" },
      }),
      Placeholder.configure({
        placeholder,
        emptyEditorClass: "before:content-[attr(data-placeholder)] before:text-gray-400 before:absolute before:pointer-events-none",
      }),
      CharacterCountExt,
    ],
    content: value || "",
    editorProps: {
      attributes: {
        class: "relative focus:outline-none text-gray-800 leading-[1.8] text-[15px] [&_h1]:text-[1.6rem] [&_h1]:font-bold [&_h1]:text-gray-900 [&_h1]:mt-8 [&_h1]:mb-3 [&_h1]:tracking-tight [&_h1]:leading-tight [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-gray-900 [&_h2]:mt-7 [&_h2]:mb-2.5 [&_h2]:leading-tight [&_h3]:text-[1.05rem] [&_h3]:font-semibold [&_h3]:text-gray-800 [&_h3]:mt-5 [&_h3]:mb-2 [&_p]:my-2.5 [&_p]:text-gray-700 [&_strong]:font-semibold [&_strong]:text-gray-900 [&_a]:text-blue-600 [&_a]:underline [&_a]:underline-offset-2",
      },
    },
    onUpdate({ editor }) {
      onChange?.(editor.isEmpty ? "" : editor.getHTML())
    },
  })

  // Sync value từ ngoài
  useEffect(() => {
    if (!editor || value === undefined) return
    if (value !== editor.getHTML()) {
      editor.commands.setContent(value || "", false)
    }
  }, [value, editor])

  // ESC thoát fullscreen
  useEffect(() => {
    const fn = (e) => { if (e.key === "Escape") setFullscreen(false) }
    window.addEventListener("keydown", fn)
    return () => window.removeEventListener("keydown", fn)
  }, [])

  function openLink() {
    setShowFind(false)
    setShowLink(true)
  }

  if (!editor) {
    return <div className="border border-gray-200 rounded-xl animate-pulse bg-gray-50" style={{ height: minHeight }} />
  }

  const chars = editor.storage.characterCount?.characters?.() ?? 0
  const words = editor.storage.characterCount?.words?.() ?? 0

  return (
    <div className={[
      "rte-wrapper flex flex-col border border-gray-200 rounded-xl overflow-hidden bg-white",
      "shadow-sm transition-all duration-200 focus-within:shadow-md focus-within:border-gray-300",
      fullscreen ? "fixed inset-3 z-9999 rounded-2xl shadow-2xl border-gray-300" : "",
    ].join(" ")}>

      {/* ── Toolbar ── */}
      <div className="flex flex-wrap items-center gap-0.5 px-2.5 py-1.5 bg-gray-50/90 border-b border-gray-100 sticky top-0 z-10">

        <Btn onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} label="Undo"><Undo2 size={14} /></Btn>
        <Btn onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} label="Redo"><Redo2 size={14} /></Btn>
        <Sep />

        <Btn onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} active={editor.isActive("heading", { level: 1 })} label="Heading 1"><Heading1 size={14} /></Btn>
        <Btn onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive("heading", { level: 2 })} label="Heading 2"><Heading2 size={14} /></Btn>
        <Btn onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive("heading", { level: 3 })} label="Heading 3"><Heading3 size={14} /></Btn>
        <Sep />

        <Btn onClick={() => editor.chain().focus().toggleBold().run()}      active={editor.isActive("bold")}      label="In đậm"><Bold size={14} /></Btn>
        <Btn onClick={() => editor.chain().focus().toggleItalic().run()}    active={editor.isActive("italic")}    label="In nghiêng"><Italic size={14} /></Btn>
        <Btn onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive("underline")} label="Gạch chân"><UnderlineIcon size={14} /></Btn>
        <Btn onClick={() => editor.chain().focus().toggleStrike().run()}    active={editor.isActive("strike")}    label="Gạch ngang"><Strikethrough size={14} /></Btn>
        <Btn onClick={() => editor.chain().focus().toggleHighlight().run()} active={editor.isActive("highlight")} label="Highlight"><Highlighter size={14} /></Btn>
        <Sep />

        <Btn onClick={() => editor.chain().focus().setTextAlign("left").run()}   active={editor.isActive({ textAlign: "left" })}   label="Căn trái"><AlignLeft size={14} /></Btn>
        <Btn onClick={() => editor.chain().focus().setTextAlign("center").run()} active={editor.isActive({ textAlign: "center" })} label="Căn giữa"><AlignCenter size={14} /></Btn>
        <Btn onClick={() => editor.chain().focus().setTextAlign("right").run()}  active={editor.isActive({ textAlign: "right" })}  label="Căn phải"><AlignRight size={14} /></Btn>
        <Sep />

        <Btn onClick={() => editor.chain().focus().toggleBulletList().run()}  active={editor.isActive("bulletList")}  label="Danh sách chấm"><List size={14} /></Btn>
        <Btn onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")} label="Danh sách số"><ListOrdered size={14} /></Btn>
        <Sep />

        <Btn onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive("blockquote")} label="Trích dẫn"><Quote size={14} /></Btn>
        <Btn onClick={() => editor.chain().focus().toggleCode().run()}       active={editor.isActive("code")}       label="Inline code"><Code size={14} /></Btn>
        <Btn onClick={() => editor.chain().focus().toggleCodeBlock().run()}  active={editor.isActive("codeBlock")}  label="Code block"><Code2 size={14} /></Btn>
        <Btn onClick={() => editor.chain().focus().setHorizontalRule().run()} label="Đường kẻ ngang"><Minus size={14} /></Btn>
        <Sep />

        <Btn onClick={openLink} active={editor.isActive("link")} label="Chèn / sửa link"><LinkIcon size={14} /></Btn>
        <Btn onClick={() => editor.chain().focus().unsetLink().run()} disabled={!editor.isActive("link")} label="Xóa link"><Unlink size={14} /></Btn>
        <Sep />

        <Btn onClick={() => { setShowLink(false); setShowFind((v) => !v) }} active={showFind} label="Tìm & thay thế"><Search size={14} /></Btn>
        <div className="ml-auto">
          <Btn onClick={() => setFullscreen((v) => !v)} label={fullscreen ? "Thu nhỏ (Esc)" : "Toàn màn hình"}>
            {fullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </Btn>
        </div>
      </div>

      {/* ── Context bars ── */}
      {showFind && <FindReplaceBar editor={editor} onClose={() => setShowFind(false)} />}
      {showLink && <LinkBar editor={editor} onClose={() => setShowLink(false)} />}

      {/* ── Selection toolbar ── */}
      <SelectionToolbar editor={editor} onOpenLink={openLink} />

      {/* ── Editor ── */}
      <div
        className="flex-1 overflow-y-auto px-7 py-5 cursor-text"
        style={{ minHeight }}
        onClick={() => editor.commands.focus()}
      >
        <EditorContent editor={editor} />
      </div>

      {/* ── Footer ── */}
      <div className="flex items-center justify-between px-4 py-1.5 bg-gray-50/80 border-t border-gray-100">
        <div className="flex items-center gap-1.5 text-[11px] text-gray-400">
          <span className="font-medium text-gray-600">{words}</span> từ
          <span className="mx-1 text-gray-200">·</span>
          <span className="font-medium text-gray-600">{chars}</span> ký tự
        </div>
        <span className="text-[11px] text-gray-300 hidden sm:block">Bôi đen để format nhanh</span>
      </div>
    </div>
  )
}