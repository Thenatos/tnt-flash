import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Bold, Italic, Underline, Smile } from "lucide-react";
import EmojiPicker, { EmojiClickData } from "emoji-picker-react";
import { MentionAutocomplete } from "@/components/MentionAutocomplete";

interface User {
  user_id: string;
  username: string;
  full_name: string;
  avatar_url?: string;
}

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: string;
  users?: User[];
}

export const RichTextEditor = ({ 
  value, 
  onChange, 
  placeholder = "Digite sua mensagem...",
  minHeight = "100px",
  users = []
}: RichTextEditorProps) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showMentions, setShowMentions] = useState(false);
  const [mentionQuery, setMentionQuery] = useState("");
  const [mentionPosition, setMentionPosition] = useState({ top: 0, left: 0 });
  const [mentionStartPos, setMentionStartPos] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

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

  const handleTextChange = (newValue: string) => {
    onChange(newValue);
    
    const textarea = textareaRef.current;
    if (!textarea) return;

    const cursorPos = textarea.selectionStart;
    const textBeforeCursor = newValue.substring(0, cursorPos);
    
    // Verificar se há @ antes do cursor
    const lastAtIndex = textBeforeCursor.lastIndexOf("@");
    
    if (lastAtIndex !== -1) {
      const textAfterAt = textBeforeCursor.substring(lastAtIndex + 1);
      
      // Verificar se não há espaço após @
      if (!textAfterAt.includes(" ")) {
        setMentionQuery(textAfterAt);
        setMentionStartPos(lastAtIndex);
        setShowMentions(true);
        
        // Calcular posição do autocomplete
        const textareaRect = textarea.getBoundingClientRect();
        const containerRect = containerRef.current?.getBoundingClientRect();
        
        if (containerRect) {
          setMentionPosition({
            top: textareaRect.bottom - containerRect.top + 5,
            left: textareaRect.left - containerRect.left + 10,
          });
        }
      } else {
        setShowMentions(false);
      }
    } else {
      setShowMentions(false);
    }
  };

  const handleMentionSelect = (username: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const beforeMention = value.substring(0, mentionStartPos);
    const afterCursor = value.substring(textarea.selectionStart);
    
    const newText = `${beforeMention}@${username} ${afterCursor}`;
    onChange(newText);
    setShowMentions(false);
    setMentionQuery("");

    // Restaurar foco
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = mentionStartPos + username.length + 2;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowMentions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative">
      {/* Toolbar - Only visible when focused */}
      {isFocused && (
        <div className="flex items-center gap-1 p-2 bg-muted/50 rounded-t-lg border border-b-0 animate-fade-in">
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
      )}

      {/* Textarea */}
      <Textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => handleTextChange(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => {
          // Keep focused if emoji picker is open
          if (!showEmojiPicker) {
            setTimeout(() => setIsFocused(false), 200);
          }
        }}
        placeholder={placeholder}
        className={isFocused ? "rounded-t-none border-t-0" : "rounded-lg"}
        style={{ minHeight: isFocused ? minHeight : "60px" }}
      />

      {/* Mention Autocomplete */}
      {showMentions && users.length > 0 && (
        <MentionAutocomplete
          users={users}
          onSelect={handleMentionSelect}
          position={mentionPosition}
          searchQuery={mentionQuery}
        />
      )}

      {/* Helper text - Only visible when focused on desktop */}
      {isFocused && (
        <div className="hidden md:block text-xs text-muted-foreground px-2 py-1 animate-fade-in">
          Use **negrito**, *itálico* ou &lt;u&gt;sublinhado&lt;/u&gt; para formatar. Digite @ para mencionar usuários.
        </div>
      )}
    </div>
  );
};
