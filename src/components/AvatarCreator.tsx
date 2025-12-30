import { useState } from "react";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Shuffle } from "lucide-react";

const AVATAR_STYLES = [
  { id: "adventurer", name: "Aventureiro", emoji: "🎯" },
  { id: "avataaars", name: "Moderno", emoji: "🎨" },
  { id: "big-smile", name: "Cartoon", emoji: "😊" },
  { id: "bottts", name: "Robô", emoji: "🤖" },
  { id: "lorelei", name: "Realista", emoji: "👤" },
  { id: "micah", name: "Ilustrado", emoji: "✨" },
];

interface AvatarCreatorProps {
  onAvatarCreated: (avatarUrl: string) => void;
  onSave?: () => void;
}

export const AvatarCreator = ({ onAvatarCreated, onSave }: AvatarCreatorProps) => {
  const [selectedStyle, setSelectedStyle] = useState("big-smile");
  const [seed, setSeed] = useState(Math.random().toString(36).substring(7));

  const generateAvatarUrl = (style: string, seedValue: string) => {
    return `https://api.dicebear.com/7.x/${style}/svg?seed=${seedValue}&backgroundColor=transparent`;
  };

  const currentAvatarUrl = generateAvatarUrl(selectedStyle, seed);

  const handleRandomize = () => {
    setSeed(Math.random().toString(36).substring(7));
  };

  const handleUseAvatar = () => {
    onAvatarCreated(currentAvatarUrl);
    // Salvar automaticamente se a função foi passada
    if (onSave) {
      setTimeout(() => {
        onSave();
      }, 100);
    }
  };

  return (
    <div className="space-y-6">
      {/* Preview */}
      <div className="flex flex-col items-center gap-4 p-8 bg-gradient-to-br from-primary/10 via-accent/5 to-primary/5 rounded-xl border-2 border-primary/20">
        <Avatar className="h-40 w-40 border-4 border-background shadow-2xl">
          <AvatarImage src={currentAvatarUrl} />
        </Avatar>
        <Button
          onClick={handleRandomize}
          variant="outline"
          size="sm"
          className="gap-2"
        >
          <Shuffle className="h-4 w-4" />
          Gerar Novo
        </Button>
      </div>

      {/* Seletor de Estilo */}
      <div className="space-y-3">
        <h3 className="font-semibold">Escolha o Estilo</h3>
        <div className="grid grid-cols-3 gap-3">
          {AVATAR_STYLES.map((style) => (
            <button
              key={style.id}
              onClick={() => setSelectedStyle(style.id)}
              className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all ${
                selectedStyle === style.id
                  ? "border-primary bg-primary text-primary-foreground shadow-md"
                  : "border-border hover:border-primary/50 hover:bg-accent"
              }`}
            >
              <span className="text-3xl">{style.emoji}</span>
              <span className="text-xs font-medium text-center">{style.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Botão Usar */}
      <Button
        onClick={handleUseAvatar}
        className="w-full bg-purple-600 text-white hover:bg-purple-700 focus:ring-2 focus:ring-purple-300"
        size="lg"
      >
        Usar Este Avatar
      </Button>
    </div>
  );
};
