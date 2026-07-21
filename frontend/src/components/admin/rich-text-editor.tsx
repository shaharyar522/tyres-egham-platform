import { useEffect, useMemo } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import { TextStyle } from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
import Highlight from "@tiptap/extension-highlight";
import Image from "@tiptap/extension-image";
import { Table } from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import Subscript from "@tiptap/extension-subscript";
import Superscript from "@tiptap/extension-superscript";
import Placeholder from "@tiptap/extension-placeholder";
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  Code,
  Code2,
  Columns3,
  Eraser,
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  Heading5,
  Heading6,
  Highlighter,
  ImageIcon,
  Italic,
  Link2,
  List,
  ListOrdered,
  Minus,
  Palette,
  Pilcrow,
  Quote,
  Redo2,
  Rows3,
  Strikethrough,
  Subscript as SubscriptIcon,
  Superscript as SuperscriptIcon,
  Table as TableIcon,
  Trash2,
  Underline as UnderlineIcon,
  Undo2,
  Unlink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { sanitizeHtml } from "@/lib/sanitize-html";
import { cn } from "@/lib/utils";

export type RichTextEditorProps = {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  className?: string;
  minHeight?: string;
  disabled?: boolean;
};

function ToolbarDivider() {
  return <span className="mx-0.5 h-6 w-px shrink-0 bg-border" aria-hidden="true" />;
}

function ToolbarButton({
  active,
  disabled,
  onClick,
  label,
  children,
}: {
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className={cn("h-8 w-8 shrink-0", active && "bg-accent text-accent-foreground")}
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
    >
      {children}
    </Button>
  );
}

function ColorInput({
  label,
  value,
  onChange,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (color: string) => void;
  disabled?: boolean;
}) {
  return (
    <label
      className={cn(
        "relative flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-md hover:bg-accent",
        disabled && "pointer-events-none opacity-50",
      )}
      title={label}
      aria-label={label}
    >
      <Palette className="h-4 w-4 pointer-events-none" />
      <input
        type="color"
        className="absolute inset-0 cursor-pointer opacity-0"
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = "Start writing…",
  className,
  minHeight = "220px",
  disabled = false,
}: RichTextEditorProps) {
  const extensions = useMemo(
    () => [
      StarterKit.configure({
        heading: { levels: [1, 2, 3, 4, 5, 6] },
        link: false,
      }),
      Underline,
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { rel: "noopener noreferrer", target: "_blank" },
      }),
      Image.configure({
        inline: false,
        allowBase64: false,
        HTMLAttributes: { class: "rounded-md max-w-full h-auto" },
      }),
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
      Subscript,
      Superscript,
      Placeholder.configure({ placeholder }),
    ],
    [placeholder],
  );

  const editor = useEditor({
    extensions,
    content: value || "",
    editable: !disabled,
    onUpdate: ({ editor: ed }) => {
      onChange(sanitizeHtml(ed.getHTML()));
    },
    editorProps: {
      attributes: {
        class: cn(
          "prose prose-sm max-w-none px-3 py-2 focus:outline-none",
          "prose-headings:font-display prose-headings:font-semibold",
          "prose-p:my-2 prose-ul:my-2 prose-ol:my-2",
          "prose-table:my-4 prose-img:my-4",
        ),
        style: `min-height: ${minHeight}`,
      },
    },
  });

  useEffect(() => {
    if (!editor) return;
    const current = editor.getHTML();
    const next = value || "<p></p>";
    if (current !== next && sanitizeHtml(current) !== sanitizeHtml(next)) {
      editor.commands.setContent(next, { emitUpdate: false });
    }
  }, [editor, value]);

  useEffect(() => {
    if (!editor) return;
    editor.setEditable(!disabled);
  }, [editor, disabled]);

  const setLink = () => {
    if (!editor) return;
    const previous = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Link URL", previous ?? "https://");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  const setImage = () => {
    if (!editor) return;
    const url = window.prompt("Image URL", "https://");
    if (!url) return;
    editor.chain().focus().setImage({ src: url, alt: "" }).run();
  };

  if (!editor) {
    return (
      <div
        className={cn("rounded-md border border-input bg-muted/30 animate-pulse", className)}
        style={{ minHeight }}
        aria-hidden="true"
      />
    );
  }

  const inTable = editor.isActive("table");

  return (
    <div className={cn("overflow-hidden rounded-md border border-input bg-background shadow-sm", className)}>
      <div className="border-b border-input bg-muted/40 p-1.5" role="toolbar" aria-label="Formatting">
        {/* History */}
        <div className="flex flex-wrap items-center gap-0.5">
          <ToolbarButton label="Undo" disabled={disabled || !editor.can().undo()} onClick={() => editor.chain().focus().undo().run()}>
            <Undo2 className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton label="Redo" disabled={disabled || !editor.can().redo()} onClick={() => editor.chain().focus().redo().run()}>
            <Redo2 className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarDivider />
          <ToolbarButton label="Bold" active={editor.isActive("bold")} disabled={disabled} onClick={() => editor.chain().focus().toggleBold().run()}>
            <Bold className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton label="Italic" active={editor.isActive("italic")} disabled={disabled} onClick={() => editor.chain().focus().toggleItalic().run()}>
            <Italic className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton label="Underline" active={editor.isActive("underline")} disabled={disabled} onClick={() => editor.chain().focus().toggleUnderline().run()}>
            <UnderlineIcon className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton label="Strikethrough" active={editor.isActive("strike")} disabled={disabled} onClick={() => editor.chain().focus().toggleStrike().run()}>
            <Strikethrough className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton label="Inline code" active={editor.isActive("code")} disabled={disabled} onClick={() => editor.chain().focus().toggleCode().run()}>
            <Code className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton label="Subscript" active={editor.isActive("subscript")} disabled={disabled} onClick={() => editor.chain().focus().toggleSubscript().run()}>
            <SubscriptIcon className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton label="Superscript" active={editor.isActive("superscript")} disabled={disabled} onClick={() => editor.chain().focus().toggleSuperscript().run()}>
            <SuperscriptIcon className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarDivider />
          <ColorInput
            label="Text colour"
            value="#000000"
            disabled={disabled}
            onChange={(color) => editor.chain().focus().setColor(color).run()}
          />
          <label
            className={cn(
              "relative flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-md hover:bg-accent",
              disabled && "pointer-events-none opacity-50",
            )}
            title="Highlight colour"
            aria-label="Highlight colour"
          >
            <Highlighter className="h-4 w-4 pointer-events-none" />
            <input
              type="color"
              className="absolute inset-0 cursor-pointer opacity-0"
              defaultValue="#ffde00"
              disabled={disabled}
              onChange={(e) => editor.chain().focus().toggleHighlight({ color: e.target.value }).run()}
            />
          </label>
          <ToolbarButton
            label="Remove highlight"
            disabled={disabled || !editor.isActive("highlight")}
            onClick={() => editor.chain().focus().unsetHighlight().run()}
          >
            <Eraser className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            label="Clear formatting"
            disabled={disabled}
            onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}
          >
            <Eraser className="h-4 w-4" />
          </ToolbarButton>
        </div>

        {/* Headings & blocks */}
        <div className="mt-1 flex flex-wrap items-center gap-0.5">
          <ToolbarButton label="Paragraph" active={editor.isActive("paragraph")} disabled={disabled} onClick={() => editor.chain().focus().setParagraph().run()}>
            <Pilcrow className="h-4 w-4" />
          </ToolbarButton>
          {([1, 2, 3, 4, 5, 6] as const).map((level) => {
            const Icon = [Heading1, Heading2, Heading3, Heading4, Heading5, Heading6][level - 1]!;
            return (
              <ToolbarButton
                key={level}
                label={`Heading ${level}`}
                active={editor.isActive("heading", { level })}
                disabled={disabled}
                onClick={() => editor.chain().focus().toggleHeading({ level }).run()}
              >
                <Icon className="h-4 w-4" />
              </ToolbarButton>
            );
          })}
          <ToolbarDivider />
          <ToolbarButton label="Bullet list" active={editor.isActive("bulletList")} disabled={disabled} onClick={() => editor.chain().focus().toggleBulletList().run()}>
            <List className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton label="Numbered list" active={editor.isActive("orderedList")} disabled={disabled} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
            <ListOrdered className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton label="Blockquote" active={editor.isActive("blockquote")} disabled={disabled} onClick={() => editor.chain().focus().toggleBlockquote().run()}>
            <Quote className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton label="Code block" active={editor.isActive("codeBlock")} disabled={disabled} onClick={() => editor.chain().focus().toggleCodeBlock().run()}>
            <Code2 className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton label="Horizontal rule" disabled={disabled} onClick={() => editor.chain().focus().setHorizontalRule().run()}>
            <Minus className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarDivider />
          <ToolbarButton label="Align left" active={editor.isActive({ textAlign: "left" })} disabled={disabled} onClick={() => editor.chain().focus().setTextAlign("left").run()}>
            <AlignLeft className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton label="Align centre" active={editor.isActive({ textAlign: "center" })} disabled={disabled} onClick={() => editor.chain().focus().setTextAlign("center").run()}>
            <AlignCenter className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton label="Align right" active={editor.isActive({ textAlign: "right" })} disabled={disabled} onClick={() => editor.chain().focus().setTextAlign("right").run()}>
            <AlignRight className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton label="Justify" active={editor.isActive({ textAlign: "justify" })} disabled={disabled} onClick={() => editor.chain().focus().setTextAlign("justify").run()}>
            <AlignJustify className="h-4 w-4" />
          </ToolbarButton>
        </div>

        {/* Media, links & tables */}
        <div className="mt-1 flex flex-wrap items-center gap-0.5">
          <ToolbarButton label="Insert link" active={editor.isActive("link")} disabled={disabled} onClick={setLink}>
            <Link2 className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton label="Remove link" disabled={disabled || !editor.isActive("link")} onClick={() => editor.chain().focus().unsetLink().run()}>
            <Unlink className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton label="Insert image" disabled={disabled} onClick={setImage}>
            <ImageIcon className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarDivider />
          <ToolbarButton
            label="Insert table"
            disabled={disabled}
            onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
          >
            <TableIcon className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton label="Add row" disabled={disabled || !inTable} onClick={() => editor.chain().focus().addRowAfter().run()}>
            <Rows3 className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton label="Add column" disabled={disabled || !inTable} onClick={() => editor.chain().focus().addColumnAfter().run()}>
            <Columns3 className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton label="Delete row" disabled={disabled || !inTable} onClick={() => editor.chain().focus().deleteRow().run()}>
            <Rows3 className="h-4 w-4 rotate-90" />
          </ToolbarButton>
          <ToolbarButton label="Delete column" disabled={disabled || !inTable} onClick={() => editor.chain().focus().deleteColumn().run()}>
            <Columns3 className="h-4 w-4 rotate-90" />
          </ToolbarButton>
          <ToolbarButton label="Delete table" disabled={disabled || !editor.can().deleteTable()} onClick={() => editor.chain().focus().deleteTable().run()}>
            <Trash2 className="h-4 w-4" />
          </ToolbarButton>
        </div>
      </div>

      <EditorContent editor={editor} className="rich-text-editor-content text-sm" />
    </div>
  );
}
