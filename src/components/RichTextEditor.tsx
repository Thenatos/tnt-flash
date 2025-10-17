import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Bold, Italic, Underline, Smile } from "lucide-react";
import EmojiPicker, { EmojiClickData } from "emoji-picker-react";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: string;
}

export const RichTextEditor = ({ 
  value, 
  onChange, 
  placeholder = "Digite sua mensagem...",
  minHeight = "100px"
}: RichTextEditorProps) => {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const insertFormatting = (prefix: string, suffix: string = prefix) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    const beforeText = value.substring(0, start);
    const afterText = value.substring(end);

    const newText = `${beforeText}${prefix}${selectedText || "texto"}${suffix}${afterText}`;
    onChange(newText);

    // Restore focus and selection
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + prefix.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos + (selectedText?.length || 5));
    }, 0);
  };

  const handleBold = () => insertFormatting("**");
  const handleItalic = () => insertFormatting("*");
  const handleUnderline = () => insertFormatting("<u>", "</u>");

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const beforeText = value.substring(0, start);
    const afterText = value.substring(start);

    const newText = `${beforeText}${emojiData.emoji}${afterText}`;
    onChange(newText);
    setShowEmojiPicker(false);

    // Restore focus
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + emojiData.emoji.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  return (
    <div className="space-y-2">
      {/* Toolbar */}
      <div className="flex items-center gap-1 p-2 bg-muted/50 rounded-t-lg border border-b-0">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleBold}
          title="Negrito (Ctrl+B)"
          className="h-8 w-8 p-0"
        >
          <Bold className="h-4 w-4" />
        </Button>
        
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleItalic}
          title="Itálico (Ctrl+I)"
          className="h-8 w-8 p-0"
        >
          <Italic className="h-4 w-4" />
        </Button>
        
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleUnderline}
          title="Sublinhado (Ctrl+U)"
          className="h-8 w-8 p-0"
        >
          <Underline className="h-4 w-4" />
        </Button>

        <div className="h-6 w-px bg-border mx-1" />

        <Popover open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              title="Adicionar emoji"
              className="h-8 w-8 p-0"
            >
              <Smile className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0 border-0" align="start">
            <EmojiPicker
              onEmojiClick={handleEmojiClick}
              width={320}
              height={400}
              searchPlaceHolder="Buscar emoji..."
              previewConfig={{ showPreview: false }}
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Textarea */}
      <Textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="rounded-t-none border-t-0"
        style={{ minHeight }}
      />

      <div className="text-xs text-muted-foreground px-2">
        Use **negrito**, *itálico* ou &lt;u&gt;sublinhado&lt;/u&gt; para formatar seu texto
      </div>
    </div>
  );
};
