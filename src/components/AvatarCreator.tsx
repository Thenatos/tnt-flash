import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { User, UserCog } from "lucide-react";

const HAIR_TYPES = [
  { value: "short", label: "Curto", emoji: "✂️" },
  { value: "long", label: "Longo", emoji: "💇" },
  { value: "curly", label: "Cacheado", emoji: "🌀" },
  { value: "bald", label: "Careca", emoji: "🔆" },
];

const HAIR_COLORS = [
  { value: "0e0e0e", color: "#0e0e0e" },
  { value: "4a312c", color: "#4a312c" },
  { value: "a55728", color: "#a55728" },
  { value: "e8a87c", color: "#e8a87c" },
  { value: "f59797", color: "#f59797" },
];

const SKIN_COLORS = [
  { value: "ffdbb4", color: "#ffdbb4" },
  { value: "f4c8a8", color: "#f4c8a8" },
  { value: "d08b5b", color: "#d08b5b" },
  { value: "ae7242", color: "#ae7242" },
  { value: "8d5524", color: "#8d5524" },
];

const EYE_COLORS = [
  { value: "blue", color: "#4a90e2" },
  { value: "green", color: "#7cb342" },
  { value: "brown", color: "#8d6e63" },
  { value: "gray", color: "#9e9e9e" },
];

const GENDERS = [
  { value: "male", label: "Masculino", icon: User },
  { value: "female", label: "Feminino", icon: UserCog },
];

const ACCESSORIES = [
  { value: "none", label: "Sem acessórios", emoji: "👤" },
  { value: "glasses", label: "Óculos", emoji: "👓" },
  { value: "sunglasses", label: "Óculos de Sol", emoji: "🕶️" },
];

interface AvatarCreatorProps {
  onAvatarCreated: (avatarUrl: string) => void;
}

export const AvatarCreator = ({ onAvatarCreated }: AvatarCreatorProps) => {
  const [hairType, setHairType] = useState("short");
  const [hairColor, setHairColor] = useState("0e0e0e");
  const [skinColor, setSkinColor] = useState("ffdbb4");
  const [eyeColor, setEyeColor] = useState("blue");
  const [gender, setGender] = useState("male");
  const [accessories, setAccessories] = useState("none");

  const generateAvatarUrl = () => {
    const seed = `${gender}-${Date.now()}`;
    const params = new URLSearchParams({
      seed,
      skinColor,
      hairColor,
      backgroundColor: "transparent",
    });

    if (accessories !== "none") {
      params.append("accessories", accessories);
    }

    return `https://api.dicebear.com/7.x/big-smile/svg?${params.toString()}`;
  };

  const previewUrl = generateAvatarUrl();

  const handleCreateAvatar = () => {
    onAvatarCreated(previewUrl);
  };

  return (
    <div className="space-y-6">
      {/* Preview */}
      <div className="flex flex-col items-center gap-3 p-6 bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg border">
        <Avatar className="h-32 w-32 border-4 border-background shadow-lg">
          <AvatarImage src={previewUrl} />
        </Avatar>
        <p className="text-sm font-medium">Preview</p>
      </div>

      {/* Sexo */}
      <div className="space-y-2">
        <Label className="text-base">Sexo</Label>
        <div className="grid grid-cols-2 gap-3">
          {GENDERS.map((g) => {
            const Icon = g.icon;
            return (
              <button
                key={g.value}
                onClick={() => setGender(g.value)}
                className={`flex items-center justify-center gap-2 p-4 rounded-lg border-2 transition-all ${
                  gender === g.value
                    ? "border-primary bg-primary text-primary-foreground shadow-md"
                    : "border-border hover:border-primary/50 hover:bg-accent"
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="font-medium">{g.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tipo de Cabelo */}
      <div className="space-y-2">
        <Label className="text-base">Cabelo</Label>
        <div className="grid grid-cols-4 gap-2">
          {HAIR_TYPES.map((type) => (
            <button
              key={type.value}
              onClick={() => setHairType(type.value)}
              className={`flex flex-col items-center gap-1 p-3 rounded-lg border-2 transition-all ${
                hairType === type.value
                  ? "border-primary bg-primary/10 shadow-sm"
                  : "border-border hover:border-primary/50 hover:bg-accent"
              }`}
            >
              <span className="text-2xl">{type.emoji}</span>
              <span className="text-xs font-medium">{type.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Cores */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Cor do Cabelo */}
        <div className="space-y-2">
          <Label className="text-sm">Cor do Cabelo</Label>
          <div className="flex gap-2 flex-wrap">
            {HAIR_COLORS.map((color) => (
              <button
                key={color.value}
                onClick={() => setHairColor(color.value)}
                className={`w-10 h-10 rounded-full border-2 transition-all ${
                  hairColor === color.value
                    ? "border-primary scale-110 shadow-md"
                    : "border-border hover:scale-105"
                }`}
                style={{ backgroundColor: color.color }}
                title={color.value}
              />
            ))}
          </div>
        </div>

        {/* Cor da Pele */}
        <div className="space-y-2">
          <Label className="text-sm">Cor da Pele</Label>
          <div className="flex gap-2 flex-wrap">
            {SKIN_COLORS.map((color) => (
              <button
                key={color.value}
                onClick={() => setSkinColor(color.value)}
                className={`w-10 h-10 rounded-full border-2 transition-all ${
                  skinColor === color.value
                    ? "border-primary scale-110 shadow-md"
                    : "border-border hover:scale-105"
                }`}
                style={{ backgroundColor: color.color }}
                title={color.value}
              />
            ))}
          </div>
        </div>

        {/* Cor dos Olhos */}
        <div className="space-y-2">
          <Label className="text-sm">Cor dos Olhos</Label>
          <div className="flex gap-2 flex-wrap">
            {EYE_COLORS.map((color) => (
              <button
                key={color.value}
                onClick={() => setEyeColor(color.value)}
                className={`w-10 h-10 rounded-full border-2 transition-all ${
                  eyeColor === color.value
                    ? "border-primary scale-110 shadow-md"
                    : "border-border hover:scale-105"
                }`}
                style={{ backgroundColor: color.color }}
                title={color.value}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Acessórios */}
      <div className="space-y-2">
        <Label className="text-base">Acessórios</Label>
        <div className="grid grid-cols-3 gap-2">
          {ACCESSORIES.map((acc) => (
            <button
              key={acc.value}
              onClick={() => setAccessories(acc.value)}
              className={`flex flex-col items-center gap-1 p-3 rounded-lg border-2 transition-all ${
                accessories === acc.value
                  ? "border-primary bg-primary/10 shadow-sm"
                  : "border-border hover:border-primary/50 hover:bg-accent"
              }`}
            >
              <span className="text-2xl">{acc.emoji}</span>
              <span className="text-xs text-center font-medium">{acc.label}</span>
            </button>
          ))}
        </div>
      </div>

      <Button onClick={handleCreateAvatar} className="w-full" size="lg">
        Usar Este Avatar
      </Button>
    </div>
  );
};

