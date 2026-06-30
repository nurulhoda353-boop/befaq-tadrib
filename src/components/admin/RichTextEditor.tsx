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
  Undo,
  Redo,
  Type as TypeIcon, Pilcrow, Settings2, MoveUp, MoveDown, CaseSensitive, AlignStartVertical, Baseline, TypeOutline, Scissors, Palette
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
/*  Custom FontFamily extension                                       */
/* ------------------------------------------------------------------ */
const FontFamily = Extension.create({
  name: 'fontFamily',
  addGlobalAttributes() {
    return [{
      types: ['textStyle'],
      attributes: {
        fontFamily: {
          default: null,
          parseHTML: (el) => el.style.fontFamily?.replace(/['"]+/g, '') || null,
          renderHTML: (attrs) => {
            if (!attrs.fontFamily) return {}
            return { style: `font-family: ${attrs.fontFamily}` }
          },
        },
      },
    }]
  },
})

/* ------------------------------------------------------------------ */
/*  Custom FontWeight extension                                       */
/* ------------------------------------------------------------------ */
const FontWeight = Extension.create({
  name: 'fontWeight',
  addGlobalAttributes() {
    return [{
      types: ['textStyle'],
      attributes: {
        fontWeight: {
          default: null,
          parseHTML: (el) => el.style.fontWeight || null,
          renderHTML: (attrs) => {
            if (!attrs.fontWeight) return {}
            return { style: `font-weight: ${attrs.fontWeight}` }
          },
        },
      },
    }]
  },
})

/* ------------------------------------------------------------------ */
/*  Custom TextColor extension                                        */
/* ------------------------------------------------------------------ */
const TextColor = Extension.create({
  name: 'textColor',
  addGlobalAttributes() {
    return [{
      types: ['textStyle'],
      attributes: {
        color: {
          default: null,
          parseHTML: (el) => el.style.color || null,
          renderHTML: (attrs) => {
            if (!attrs.color) return {}
            return { style: `color: ${attrs.color}` }
          },
        },
      },
    }]
  },
})

/* ------------------------------------------------------------------ */
/*  Custom BaselineShift extension                                    */
/* ------------------------------------------------------------------ */
const BaselineShift = Extension.create({
  name: 'baselineShift',
  addGlobalAttributes() {
    return [{
      types: ['textStyle'],
      attributes: {
        baselineShift: {
          default: null,
          parseHTML: (el) => el.style.top || null,
          renderHTML: (attrs) => {
            if (!attrs.baselineShift) return {}
            return { style: `position: relative; top: ${attrs.baselineShift}` }
          },
        },
      },
    }]
  },
})

/* ------------------------------------------------------------------ */
/*  Custom LetterSpacing (Tracking) extension - on textStyle          */
/* ------------------------------------------------------------------ */
const LetterSpacing = Extension.create({
  name: 'letterSpacing',
  addGlobalAttributes() {
    return [
      {
        types: ['textStyle'],
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

/* ------------------------------------------------------------------ */
/*  Custom LineHeight (Leading) extension - on block nodes            */
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
/*  Custom ParagraphIndent extension                                  */
/* ------------------------------------------------------------------ */
const ParagraphIndent = Extension.create({
  name: 'paragraphIndent',
  addGlobalAttributes() {
    return [{
      types: ['heading', 'paragraph'],
      attributes: {
        marginLeft: {
          default: null,
          parseHTML: (el) => el.style.marginLeft || null,
          renderHTML: (attrs) => {
            if (!attrs.marginLeft) return {}
            return { style: `margin-left: ${attrs.marginLeft}` }
          },
        },
        marginRight: {
          default: null,
          parseHTML: (el) => el.style.marginRight || null,
          renderHTML: (attrs) => {
            if (!attrs.marginRight) return {}
            return { style: `margin-right: ${attrs.marginRight}` }
          },
        },
        textIndent: {
          default: null,
          parseHTML: (el) => el.style.textIndent || null,
          renderHTML: (attrs) => {
            if (!attrs.textIndent) return {}
            return { style: `text-indent: ${attrs.textIndent}` }
          },
        },
      },
    }]
  },
})

/* ------------------------------------------------------------------ */
/*  Custom ParagraphSpacing extension                                 */
/* ------------------------------------------------------------------ */
const ParagraphSpacing = Extension.create({
  name: 'paragraphSpacing',
  addGlobalAttributes() {
    return [{
      types: ['heading', 'paragraph'],
      attributes: {
        marginTop: {
          default: null,
          parseHTML: (el) => el.style.marginTop || null,
          renderHTML: (attrs) => {
            if (!attrs.marginTop) return {}
            // Use !important to override tailwind prose defaults if needed, 
            // but inline styles usually win anyway. 
            return { style: `margin-top: ${attrs.marginTop} !important` }
          },
        },
        marginBottom: {
          default: null,
          parseHTML: (el) => el.style.marginBottom || null,
          renderHTML: (attrs) => {
            if (!attrs.marginBottom) return {}
            return { style: `margin-bottom: ${attrs.marginBottom} !important` }
          },
        },
      },
    }]
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
      FontFamily,
      FontWeight,
      TextColor,
      BaselineShift,
      LineHeight,
      LetterSpacing,
      ParagraphIndent,
      ParagraphSpacing,
    ],
    content: value,
    onUpdate: ({ editor: e }) => onChange(e.getHTML()),
    editorProps: {
      attributes: {
        class:
          'prose prose-sm sm:prose-base dark:prose-invert max-w-none focus:outline-none min-h-full px-5 py-4 prose-p:my-1 prose-headings:mb-2 prose-headings:mt-3 prose-ul:my-1 prose-ol:my-1 prose-li:my-0.5',
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


  /* ---------- Character Panel Helpers ---------- */
  const getCurrentFontFamily = () => editor.getAttributes('textStyle').fontFamily || ''
  const setFontFamily = (val) => editor.chain().focus().setMark('textStyle', { fontFamily: val }).run()
  
  const getCurrentFontWeight = () => editor.getAttributes('textStyle').fontWeight || '400'
  const setFontWeight = (val) => editor.chain().focus().setMark('textStyle', { fontWeight: val }).run()

  const getCurrentTextColor = () => editor.getAttributes('textStyle').color || '#000000'
  const setTextColor = (val) => editor.chain().focus().setMark('textStyle', { color: val }).run()

  const getCurrentBaselineShift = () => {
    const val = editor.getAttributes('textStyle').baselineShift
    return val ? parseFloat(val) : 0
  }
  const setBaselineShift = (val) => editor.chain().focus().setMark('textStyle', { baselineShift: `${val}px` }).run()

  const getCurrentTracking = () => {
    const val = editor.getAttributes('textStyle').letterSpacing
    return val ? parseFloat(val).toString() : '0'
  }
  const setTracking = (val) => editor.chain().focus().setMark('textStyle', { letterSpacing: `${val}px` }).run()

  /* ---------- Paragraph Panel Helpers ---------- */
  const getParaAttr = (attr, defaultVal = '0') => {
    const val = editor.getAttributes('paragraph')[attr] || editor.getAttributes('heading')[attr]
    return val ? parseFloat(val).toString() : defaultVal
  }
  const setParaAttr = (attr, val, unit = 'px') => {
    editor.chain().focus().updateAttributes('paragraph', { [attr]: `${val}${unit}` }).updateAttributes('heading', { [attr]: `${val}${unit}` }).run()
  }

  const [showCharPanel, setShowCharPanel] = useState(false)
  const [showParaPanel2, setShowParaPanel2] = useState(false)

  const fontSize = getCurrentFontSize()


  return (
    <div
      className={`w-full rounded-lg border bg-background overflow-hidden transition-all ${
        formatPainterActive
          ? 'border-gold ring-2 ring-gold/30'
          : 'border-border focus-within:border-gold focus-within:ring-1 focus-within:ring-gold'
      }`}
    >
      
      {/* ========== ILLUSTRATOR STYLE TOOLBAR ========== */}
      <div className="flex flex-col border-b border-border bg-muted/20">
        
        {/* Undo/Redo & Quick Tools Row */}
        <div className="flex items-center gap-1 border-b border-border/50 px-2 py-1 bg-muted/40">
          <ToolbarBtn active={false} disabled={!editor.can().undo()} onClick={() => editor.chain().focus().undo().run()} title="Undo (Ctrl+Z)"><Undo size={14} /></ToolbarBtn>
          <ToolbarBtn active={false} disabled={!editor.can().redo()} onClick={() => editor.chain().focus().redo().run()} title="Redo (Ctrl+Y)"><Redo size={14} /></ToolbarBtn>
          <div className="w-[1px] h-4 bg-border/50 mx-1"></div>
          <ToolbarBtn active={editor.isActive('link')} onClick={setLink} title="Add Link"><LinkIcon size={14} /></ToolbarBtn>
          <ToolbarBtn active={false} onClick={() => editor.chain().focus().unsetLink().run()} disabled={!editor.isActive('link')} title="Remove Link"><Unlink size={14} /></ToolbarBtn>
          <div className="w-[1px] h-4 bg-border/50 mx-1"></div>
          <ToolbarBtn active={formatPainterActive} onClick={captureFormatPainter} title="Format Painter" className={formatPainterActive ? 'ring-1 ring-gold' : ''}><Paintbrush size={14} /></ToolbarBtn>
          
          <div className="ml-auto flex items-center gap-2">
            <button type="button" onClick={() => { setShowCharPanel(!showCharPanel); setShowParaPanel2(false); }} className={`text-[11px] font-bold px-2 py-1 rounded transition ${showCharPanel ? 'bg-gold/20 text-gold-bright' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}>
              Character (A)
            </button>
            <button type="button" onClick={() => { setShowParaPanel2(!showParaPanel2); setShowCharPanel(false); }} className={`text-[11px] font-bold px-2 py-1 rounded transition ${showParaPanel2 ? 'bg-gold/20 text-gold-bright' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}>
              Paragraph (¶)
            </button>
          </div>
        </div>

        {/* Character Panel (Expanded) */}
        {showCharPanel && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-3 bg-card border-b border-border/50 shadow-inner animate-in fade-in slide-in-from-top-1">
            <div className="col-span-2 flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <label className="text-[10px] font-semibold text-muted-foreground uppercase w-20">Font Family:</label>
                <select value={getCurrentFontFamily()} onChange={(e) => setFontFamily(e.target.value)} className="flex-1 h-7 border border-border bg-background text-xs px-2 rounded focus:border-gold outline-none">
                  <option value="">Default</option>
                  <option value="SolaimanLipi">SolaimanLipi</option>
                  <option value="Arial">Arial</option>
                  <option value="Times New Roman">Times New Roman</option>
                  <option value="Courier New">Courier New</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-[10px] font-semibold text-muted-foreground uppercase w-20">Font Style:</label>
                <select value={getCurrentFontWeight()} onChange={(e) => setFontWeight(e.target.value)} className="flex-1 h-7 border border-border bg-background text-xs px-2 rounded focus:border-gold outline-none">
                  <option value="100">Thin (100)</option>
                  <option value="300">Light (300)</option>
                  <option value="400">Regular (400)</option>
                  <option value="500">Medium (500)</option>
                  <option value="600">SemiBold (600)</option>
                  <option value="700">Bold (700)</option>
                  <option value="900">Black (900)</option>
                </select>
                <div className="flex items-center border border-border rounded">
                  <ToolbarBtn active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()} title="Italic"><Italic size={14} /></ToolbarBtn>
                  <ToolbarBtn active={editor.isActive('underline')} onClick={() => editor.chain().focus().toggleUnderline().run()} title="Underline"><UnderlineIcon size={14} /></ToolbarBtn>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2" title="Font Size">
                <span className="text-xs text-muted-foreground font-mono w-4">T</span>
                <input type="number" value={fontSize} onChange={(e) => setFontSize(parseInt(e.target.value) || 16)} className="w-16 h-7 border border-border bg-background text-xs px-2 rounded focus:border-gold outline-none" /> px
              </div>
              <div className="flex items-center gap-2" title="Tracking / Letter Spacing">
                <span className="text-xs text-muted-foreground font-mono w-4">VA</span>
                <input type="number" step="0.5" value={getCurrentTracking()} onChange={(e) => setTracking(e.target.value)} className="w-16 h-7 border border-border bg-background text-xs px-2 rounded focus:border-gold outline-none" /> px
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2" title="Leading / Line Height">
                <AlignStartVertical size={14} className="text-muted-foreground w-4" />
                <input type="number" step="0.1" value={getCurrentLineHeight()} onChange={(e) => setLineHeight(e.target.value)} className="w-16 h-7 border border-border bg-background text-xs px-2 rounded focus:border-gold outline-none" />
              </div>
              <div className="flex items-center gap-2" title="Baseline Shift">
                <Baseline size={14} className="text-muted-foreground w-4" />
                <input type="number" step="1" value={getCurrentBaselineShift()} onChange={(e) => setBaselineShift(parseInt(e.target.value) || 0)} className="w-16 h-7 border border-border bg-background text-xs px-2 rounded focus:border-gold outline-none" /> px
              </div>
            </div>

            <div className="col-span-2 flex items-center gap-2">
              <label className="text-[10px] font-semibold text-muted-foreground uppercase w-20">Text Color:</label>
              <input type="color" value={getCurrentTextColor()} onChange={(e) => setTextColor(e.target.value)} className="w-8 h-8 rounded border-none cursor-pointer p-0" />
            </div>
          </div>
        )}

        {/* Paragraph Panel (Expanded) */}
        {showParaPanel2 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-3 bg-card border-b border-border/50 shadow-inner animate-in fade-in slide-in-from-top-1">
             <div className="col-span-2 flex flex-col gap-2">
              <div className="flex items-center gap-1 bg-background border border-border p-0.5 rounded w-fit">
                <ToolbarBtn active={editor.isActive('paragraph') && !editor.isActive('heading')} onClick={() => editor.chain().focus().setParagraph().run()} title="Paragraph"><Pilcrow size={14} /></ToolbarBtn>
                <ToolbarBtn active={editor.isActive('heading', { level: 1 })} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} title="H1"><Heading1 size={14} /></ToolbarBtn>
                <ToolbarBtn active={editor.isActive('heading', { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} title="H2"><Heading2 size={14} /></ToolbarBtn>
                <ToolbarBtn active={editor.isActive('heading', { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} title="H3"><Heading3 size={14} /></ToolbarBtn>
              </div>
              <div className="flex items-center gap-1 bg-background border border-border p-0.5 rounded w-fit">
                <ToolbarBtn active={editor.isActive({ textAlign: 'left' })} onClick={() => editor.chain().focus().setTextAlign('left').run()} title="Align Left"><AlignLeft size={14} /></ToolbarBtn>
                <ToolbarBtn active={editor.isActive({ textAlign: 'center' })} onClick={() => editor.chain().focus().setTextAlign('center').run()} title="Align Center"><AlignCenter size={14} /></ToolbarBtn>
                <ToolbarBtn active={editor.isActive({ textAlign: 'right' })} onClick={() => editor.chain().focus().setTextAlign('right').run()} title="Align Right"><AlignRight size={14} /></ToolbarBtn>
                <ToolbarBtn active={editor.isActive({ textAlign: 'justify' })} onClick={() => editor.chain().focus().setTextAlign('justify').run()} title="Justify"><AlignJustify size={14} /></ToolbarBtn>
              </div>
              <div className="flex items-center gap-1 bg-background border border-border p-0.5 rounded w-fit">
                <ToolbarBtn active={editor.isActive('bulletList')} onClick={() => editor.chain().focus().toggleBulletList().run()} title="Bullet List"><List size={14} /></ToolbarBtn>
                <ToolbarBtn active={editor.isActive('orderedList')} onClick={() => editor.chain().focus().toggleOrderedList().run()} title="Numbered List"><ListOrdered size={14} /></ToolbarBtn>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2" title="Left Indent">
                <span className="text-[10px] text-muted-foreground w-16">Left Indent</span>
                <input type="number" step="5" value={getParaAttr('marginLeft')} onChange={(e) => setParaAttr('marginLeft', e.target.value)} className="w-16 h-7 border border-border bg-background text-xs px-2 rounded focus:border-gold outline-none" /> px
              </div>
              <div className="flex items-center gap-2" title="Right Indent">
                <span className="text-[10px] text-muted-foreground w-16">Right Indent</span>
                <input type="number" step="5" value={getParaAttr('marginRight')} onChange={(e) => setParaAttr('marginRight', e.target.value)} className="w-16 h-7 border border-border bg-background text-xs px-2 rounded focus:border-gold outline-none" /> px
              </div>
              <div className="flex items-center gap-2" title="First Line Indent">
                <span className="text-[10px] text-muted-foreground w-16">1st Line</span>
                <input type="number" step="5" value={getParaAttr('textIndent')} onChange={(e) => setParaAttr('textIndent', e.target.value)} className="w-16 h-7 border border-border bg-background text-xs px-2 rounded focus:border-gold outline-none" /> px
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2" title="Space Before Paragraph">
                <span className="text-[10px] text-muted-foreground w-16">Space Before</span>
                <input type="number" step="5" value={getParaAttr('marginTop')} onChange={(e) => setParaAttr('marginTop', e.target.value)} className="w-16 h-7 border border-border bg-background text-xs px-2 rounded focus:border-gold outline-none" /> px
              </div>
              <div className="flex items-center gap-2" title="Space After Paragraph">
                <span className="text-[10px] text-muted-foreground w-16">Space After</span>
                <input type="number" step="5" value={getParaAttr('marginBottom')} onChange={(e) => setParaAttr('marginBottom', e.target.value)} className="w-16 h-7 border border-border bg-background text-xs px-2 rounded focus:border-gold outline-none" /> px
              </div>
            </div>
          </div>
        )}
      </div>

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
