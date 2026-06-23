import { useEditor, EditorContent, Extension } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import LinkExt from '@tiptap/extension-link'
import { TextStyle } from '@tiptap/extension-text-style'
import TextAlign from '@tiptap/extension-text-align'
import Underline from '@tiptap/extension-underline'
import { useCallback, useRef, useState, useEffect } from 'react'
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Heading3,
  Link as LinkIcon,
  Unlink,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Paintbrush,
  Type,
  Minus,
  Plus,
  ChevronDown,
} from 'lucide-react'

/* ------------------------------------------------------------------ */
/*  Custom FontSize extension – stores font-size as an inline style   */
/* ------------------------------------------------------------------ */
const FontSize = Extension.create({
  name: 'fontSize',

  addGlobalAttributes() {
    return [
      {
        types: ['textStyle'],
        attributes: {
          fontSize: {
            default: null,
            parseHTML: (el) => el.style.fontSize?.replace(/['"]+/g, '') || null,
            renderHTML: (attrs) => {
              if (!attrs.fontSize) return {}
              return { style: `font-size: ${attrs.fontSize}` }
            },
          },
        },
      },
    ]
  },
})

/* ------------------------------------------------------------------ */
/*  Custom LineHeight extension – stores line-height on block nodes   */
/* ------------------------------------------------------------------ */
const LineHeight = Extension.create({
  name: 'lineHeight',

  addGlobalAttributes() {
    return [
      {
        types: ['heading', 'paragraph'],
        attributes: {
          lineHeight: {
            default: null,
            parseHTML: (el) => el.style.lineHeight || null,
            renderHTML: (attrs) => {
              if (!attrs.lineHeight) return {}
              return { style: `line-height: ${attrs.lineHeight}` }
            },
          },
        },
      },
    ]
  },
})

/* ------------------------------------------------------------------ */
/*  Custom LetterSpacing extension                                    */
/* ------------------------------------------------------------------ */
const LetterSpacing = Extension.create({
  name: 'letterSpacing',

  addGlobalAttributes() {
    return [
      {
        types: ['heading', 'paragraph'],
        attributes: {
          letterSpacing: {
            default: null,
            parseHTML: (el) => el.style.letterSpacing || null,
            renderHTML: (attrs) => {
              if (!attrs.letterSpacing) return {}
              return { style: `letter-spacing: ${attrs.letterSpacing}` }
            },
          },
        },
      },
    ]
  },
})

/* ================================================================== */
/*  Main component                                                     */
/* ================================================================== */

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export function RichTextEditor({ value, onChange }: RichTextEditorProps) {
  const [formatPainterActive, setFormatPainterActive] = useState(false)
  const savedMarksRef = useRef<Record<string, any> | null>(null)
  const [showParaPanel, setShowParaPanel] = useState(false)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
      LinkExt.configure({
        openOnClick: false,
        HTMLAttributes: { class: 'text-gold hover:underline cursor-pointer' },
      }),
      TextStyle,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Underline,
      FontSize,
      LineHeight,
      LetterSpacing,
    ],
    content: value,
    onUpdate: ({ editor: e }) => onChange(e.getHTML()),
    editorProps: {
      attributes: {
        class:
          'prose prose-sm sm:prose-base dark:prose-invert max-w-none focus:outline-none min-h-full px-5 py-4',
      },
      handleClick: (_view, _pos, event) => {
        if (formatPainterActive && savedMarksRef.current) {
          applyPainterMarks()
          return true
        }
        return false
      },
    },
  })

  /* ---------- font size helpers ---------- */
  const getCurrentFontSize = useCallback((): number => {
    if (!editor) return 16
    const attrs = editor.getAttributes('textStyle')
    if (attrs.fontSize) {
      return parseInt(attrs.fontSize, 10)
    }
    // detect heading defaults
    if (editor.isActive('heading', { level: 1 })) return 32
    if (editor.isActive('heading', { level: 2 })) return 24
    if (editor.isActive('heading', { level: 3 })) return 20
    return 16
  }, [editor])

  const setFontSize = useCallback(
    (size: number) => {
      if (!editor) return
      const clamped = Math.max(8, Math.min(72, size))
      editor.chain().focus().setMark('textStyle', { fontSize: `${clamped}px` }).run()
    },
    [editor],
  )

  /* ---------- format painter ---------- */
  const captureFormatPainter = useCallback(() => {
    if (!editor) return
    // capture current marks on the selection
    const marks: Record<string, any> = {}
    const storedMarks = editor.state.storedMarks || editor.state.selection.$from.marks()
    storedMarks.forEach((m) => {
      marks[m.type.name] = m.attrs
    })
    savedMarksRef.current = marks
    setFormatPainterActive(true)
  }, [editor])

  const applyPainterMarks = useCallback(() => {
    if (!editor || !savedMarksRef.current) return
    const marks = savedMarksRef.current

    // first remove all existing marks on the selection
    editor.chain().focus().unsetAllMarks().run()

    // apply each stored mark
    Object.entries(marks).forEach(([name, attrs]) => {
      if (name === 'bold') editor.chain().focus().toggleBold().run()
      else if (name === 'italic') editor.chain().focus().toggleItalic().run()
      else if (name === 'underline') editor.chain().focus().toggleUnderline().run()
      else if (name === 'textStyle') {
        editor.chain().focus().setMark('textStyle', attrs).run()
      }
      else if (name === 'link') {
        editor.chain().focus().setLink(attrs).run()
      }
    })

    savedMarksRef.current = null
    setFormatPainterActive(false)
  }, [editor])

  /* ---------- paragraph panel helpers ---------- */
  const getCurrentLineHeight = (): string => {
    if (!editor) return '1.6'
    const attrs =
      editor.getAttributes('paragraph').lineHeight ||
      editor.getAttributes('heading').lineHeight
    return attrs || '1.6'
  }

  const setLineHeight = (val: string) => {
    if (!editor) return
    editor.chain().focus().updateAttributes('paragraph', { lineHeight: val }).run()
    editor.chain().focus().updateAttributes('heading', { lineHeight: val }).run()
  }

  const getCurrentLetterSpacing = (): string => {
    if (!editor) return '0'
    const attrs =
      editor.getAttributes('paragraph').letterSpacing ||
      editor.getAttributes('heading').letterSpacing
    return attrs ? parseFloat(attrs).toString() : '0'
  }

  const setLetterSpacing = (val: string) => {
    if (!editor) return
    const px = `${val}px`
    editor.chain().focus().updateAttributes('paragraph', { letterSpacing: px }).run()
    editor.chain().focus().updateAttributes('heading', { letterSpacing: px }).run()
  }

  const setLink = () => {
    if (!editor) return
    const previousUrl = editor.getAttributes('link').href
    const url = window.prompt('লিংক দিন (URL):', previousUrl)
    if (url === null) return
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
      return
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
  }

  if (!editor) return null

  const fontSize = getCurrentFontSize()

  return (
    <div
      className={`w-full rounded-lg border bg-background overflow-hidden transition-all ${
        formatPainterActive
          ? 'border-gold ring-2 ring-gold/30'
          : 'border-border focus-within:border-gold focus-within:ring-1 focus-within:ring-gold'
      }`}
    >
      {/* ========== TOOLBAR ROW 1 — Formatting ========== */}
      <div className="flex flex-wrap items-center gap-0.5 border-b border-border bg-muted/40 px-1.5 py-1">
        {/* Block type selector */}
        <div className="flex items-center gap-0.5 pr-1.5 border-r border-border/50">
          <ToolbarBtn
            active={editor.isActive('paragraph') && !editor.isActive('heading')}
            onClick={() => editor.chain().focus().setParagraph().run()}
            title="সাধারণ টেক্সট"
          >
            <Type size={14} />
          </ToolbarBtn>
          <ToolbarBtn
            active={editor.isActive('heading', { level: 1 })}
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            title="শিরোনাম ১"
          >
            <Heading1 size={14} />
          </ToolbarBtn>
          <ToolbarBtn
            active={editor.isActive('heading', { level: 2 })}
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            title="শিরোনাম ২"
          >
            <Heading2 size={14} />
          </ToolbarBtn>
          <ToolbarBtn
            active={editor.isActive('heading', { level: 3 })}
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            title="শিরোনাম ৩"
          >
            <Heading3 size={14} />
          </ToolbarBtn>
        </div>

        {/* Font size — number input with +/- */}
        <div className="flex items-center gap-0 px-1.5 border-r border-border/50">
          <button
            type="button"
            onClick={() => setFontSize(fontSize - 1)}
            className="grid h-7 w-6 place-items-center rounded-l border border-r-0 border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground transition"
            title="ছোট করুন"
          >
            <Minus size={11} />
          </button>
          <input
            type="number"
            min={8}
            max={72}
            value={fontSize}
            onChange={(e) => setFontSize(parseInt(e.target.value, 10) || 16)}
            className="h-7 w-10 border border-border bg-background text-center text-xs font-bold text-foreground outline-none focus:border-gold [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            title="ফন্ট সাইজ (px)"
          />
          <button
            type="button"
            onClick={() => setFontSize(fontSize + 1)}
            className="grid h-7 w-6 place-items-center rounded-r border border-l-0 border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground transition"
            title="বড় করুন"
          >
            <Plus size={11} />
          </button>
        </div>

        {/* Bold / Italic / Underline */}
        <div className="flex items-center gap-0.5 px-1.5 border-r border-border/50">
          <ToolbarBtn
            active={editor.isActive('bold')}
            onClick={() => editor.chain().focus().toggleBold().run()}
            title="Bold (Ctrl+B)"
          >
            <Bold size={14} />
          </ToolbarBtn>
          <ToolbarBtn
            active={editor.isActive('italic')}
            onClick={() => editor.chain().focus().toggleItalic().run()}
            title="Italic (Ctrl+I)"
          >
            <Italic size={14} />
          </ToolbarBtn>
          <ToolbarBtn
            active={editor.isActive('underline')}
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            title="Underline (Ctrl+U)"
          >
            <UnderlineIcon size={14} />
          </ToolbarBtn>
        </div>

        {/* Format Painter */}
        <div className="flex items-center gap-0.5 px-1.5 border-r border-border/50">
          <ToolbarBtn
            active={formatPainterActive}
            onClick={captureFormatPainter}
            title="ফরম্যাট পেইন্টার — প্রথমে ফরম্যাটেড টেক্সট সিলেক্ট করে ক্লিক করুন, তারপর যেখানে এপ্লাই করতে চান সেখানে সিলেক্ট করুন"
            className={formatPainterActive ? 'ring-1 ring-gold' : ''}
          >
            <Paintbrush size={14} />
          </ToolbarBtn>
        </div>

        {/* Links */}
        <div className="flex items-center gap-0.5 pl-1.5">
          <ToolbarBtn
            active={editor.isActive('link')}
            onClick={setLink}
            title="লিংক যুক্ত করুন"
          >
            <LinkIcon size={14} />
          </ToolbarBtn>
          <ToolbarBtn
            active={false}
            onClick={() => editor.chain().focus().unsetLink().run()}
            disabled={!editor.isActive('link')}
            title="লিংক সরান"
          >
            <Unlink size={14} />
          </ToolbarBtn>
        </div>
      </div>

      {/* ========== TOOLBAR ROW 2 — Paragraph / Alignment (Illustrator style) ========== */}
      <div className="flex flex-wrap items-center gap-0.5 border-b border-border bg-muted/20 px-1.5 py-1">
        {/* Text alignment */}
        <div className="flex items-center gap-0.5 pr-1.5 border-r border-border/50">
          <ToolbarBtn
            active={editor.isActive({ textAlign: 'left' })}
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            title="বাম সারিবদ্ধ"
          >
            <AlignLeft size={14} />
          </ToolbarBtn>
          <ToolbarBtn
            active={editor.isActive({ textAlign: 'center' })}
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            title="মধ্য সারিবদ্ধ"
          >
            <AlignCenter size={14} />
          </ToolbarBtn>
          <ToolbarBtn
            active={editor.isActive({ textAlign: 'right' })}
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            title="ডান সারিবদ্ধ"
          >
            <AlignRight size={14} />
          </ToolbarBtn>
          <ToolbarBtn
            active={editor.isActive({ textAlign: 'justify' })}
            onClick={() => editor.chain().focus().setTextAlign('justify').run()}
            title="সমান সারিবদ্ধ (Justify)"
          >
            <AlignJustify size={14} />
          </ToolbarBtn>
        </div>

        {/* Lists */}
        <div className="flex items-center gap-0.5 px-1.5 border-r border-border/50">
          <ToolbarBtn
            active={editor.isActive('bulletList')}
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            title="বুলেট তালিকা"
          >
            <List size={14} />
          </ToolbarBtn>
          <ToolbarBtn
            active={editor.isActive('orderedList')}
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            title="ক্রমিক তালিকা"
          >
            <ListOrdered size={14} />
          </ToolbarBtn>
        </div>

        {/* Paragraph settings toggle (Illustrator-inspired) */}
        <div className="relative pl-1.5">
          <button
            type="button"
            onClick={() => setShowParaPanel(!showParaPanel)}
            className={`inline-flex items-center gap-1 rounded px-2 py-1 text-[11px] font-semibold transition ${
              showParaPanel
                ? 'bg-gold/20 text-gold-bright'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            }`}
            title="প্যারাগ্রাফ সেটিংস (Adobe Illustrator স্টাইল)"
          >
            <span>¶</span> প্যারাগ্রাফ
            <ChevronDown size={12} className={`transition-transform ${showParaPanel ? 'rotate-180' : ''}`} />
          </button>

          {/* Paragraph settings panel (Illustrator-style) */}
          {showParaPanel && (
            <div className="absolute left-0 top-full z-50 mt-1 w-64 rounded-xl border border-border bg-card p-4 shadow-xl animate-in fade-in slide-in-from-top-2 duration-200">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5">
                <span className="text-gold text-sm">¶</span> প্যারাগ্রাফ সেটিংস
              </h4>

              {/* Line Height */}
              <div className="mb-3">
                <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1 block">
                  লাইন স্পেসিং (Line Height)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="1"
                    max="3"
                    step="0.1"
                    value={getCurrentLineHeight()}
                    onChange={(e) => setLineHeight(e.target.value)}
                    className="flex-1 h-1.5 accent-gold cursor-pointer"
                  />
                  <span className="text-xs font-mono font-bold text-foreground w-8 text-right">
                    {parseFloat(getCurrentLineHeight()).toFixed(1)}
                  </span>
                </div>
              </div>

              {/* Letter Spacing */}
              <div className="mb-3">
                <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1 block">
                  অক্ষর ব্যবধান (Letter Spacing)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="-2"
                    max="10"
                    step="0.5"
                    value={getCurrentLetterSpacing()}
                    onChange={(e) => setLetterSpacing(e.target.value)}
                    className="flex-1 h-1.5 accent-gold cursor-pointer"
                  />
                  <span className="text-xs font-mono font-bold text-foreground w-10 text-right">
                    {parseFloat(getCurrentLetterSpacing()).toFixed(1)}px
                  </span>
                </div>
              </div>

              {/* Quick presets */}
              <div>
                <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">
                  প্রিসেট
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { label: 'ঘন', lh: '1.2', ls: '0' },
                    { label: 'সাধারণ', lh: '1.6', ls: '0' },
                    { label: 'বিরল', lh: '2.0', ls: '0.5' },
                    { label: 'ঢিলা', lh: '2.4', ls: '1' },
                  ].map((p) => (
                    <button
                      key={p.label}
                      type="button"
                      onClick={() => {
                        setLineHeight(p.lh)
                        setLetterSpacing(p.ls)
                      }}
                      className="rounded-md border border-border bg-background px-2.5 py-1 text-[10px] font-semibold text-muted-foreground transition hover:border-gold/50 hover:bg-gold/5 hover:text-gold"
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Format painter indicator */}
      {formatPainterActive && (
        <div className="bg-gold/10 border-b border-gold/30 px-3 py-1.5 text-[11px] font-semibold text-gold-bright flex items-center gap-2">
          <Paintbrush size={13} />
          <span>ফরম্যাট পেইন্টার সক্রিয় — যেখানে এপ্লাই করতে চান সেখানের টেক্সট সিলেক্ট করে ক্লিক করুন</span>
          <button
            type="button"
            onClick={() => { savedMarksRef.current = null; setFormatPainterActive(false) }}
            className="ml-auto text-[10px] underline hover:text-gold"
          >
            বাতিল
          </button>
        </div>
      )}

      {/* ========== EDITOR BODY ========== */}
      <div 
        className="bg-background h-[400px] overflow-y-auto custom-scrollbar" 
        onClick={() => {
          if (formatPainterActive && savedMarksRef.current) {
            applyPainterMarks()
          }
        }}
      >
        <EditorContent editor={editor} />
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Reusable toolbar button                                            */
/* ------------------------------------------------------------------ */
function ToolbarBtn({
  onClick,
  active,
  disabled,
  children,
  title,
  className = '',
}: {
  onClick: () => void
  active: boolean
  disabled?: boolean
  children: React.ReactNode
  title?: string
  className?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`grid h-7 w-7 place-items-center rounded text-muted-foreground transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${
        active
          ? 'bg-gold/20 text-gold-bright shadow-sm'
          : 'hover:bg-muted hover:text-foreground'
      } ${className}`}
    >
      {children}
    </button>
  )
}
