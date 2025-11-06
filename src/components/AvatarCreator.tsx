import { useState } from "react";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

const HAIR_TYPES = [
  { value: "short", label: "Curto" },
  { value: "long", label: "Longo" },
  { value: "curly", label: "Cacheado" },
  { value: "bald", label: "Careca" },
];

const HAIR_COLORS = [
  { value: "0e0e0e", label: "Preto", color: "#0e0e0e" },
  { value: "4a312c", label: "Castanho Escuro", color: "#4a312c" },
  { value: "a55728", label: "Castanho", color: "#a55728" },
  { value: "e8a87c", label: "Loiro", color: "#e8a87c" },
  { value: "f59797", label: "Ruivo", color: "#f59797" },
];

const SKIN_COLORS = [
  { value: "ffdbb4", label: "Clara", color: "#ffdbb4" },
  { value: "f4c8a8", label: "Média Clara", color: "#f4c8a8" },
  { value: "d08b5b", label: "Média", color: "#d08b5b" },
  { value: "ae7242", label: "Média Escura", color: "#ae7242" },
  { value: "8d5524", label: "Escura", color: "#8d5524" },
];

const EYE_COLORS = [
  { value: "blue", label: "Azul", color: "#4a90e2" },
  { value: "green", label: "Verde", color: "#7cb342" },
  { value: "brown", label: "Castanho", color: "#8d6e63" },
  { value: "gray", label: "Cinza", color: "#9e9e9e" },
];

const GENDERS = [
  { value: "male", label: "Masculino" },
  { value: "female", label: "Feminino" },
];

const ACCESSORIES = [
  { value: "none", label: "Nenhum" },
  { value: "glasses", label: "Óculos" },
  { value: "sunglasses", label: "Óculos de Sol" },
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
    <div className="space-y-6 p-4 border rounded-lg">
      <div className="flex flex-col items-center gap-4">
        <Avatar className="h-32 w-32">
          <AvatarImage src={previewUrl} />
        </Avatar>
        <p className="text-sm text-muted-foreground">Preview do Avatar</p>
      </div>

      <div className="grid gap-6">
        <div className="space-y-3">
          <Label>Sexo</Label>
          <RadioGroup value={gender} onValueChange={setGender}>
            {GENDERS.map((g) => (
              <div key={g.value} className="flex items-center space-x-2">
                <RadioGroupItem value={g.value} id={`gender-${g.value}`} />
                <Label htmlFor={`gender-${g.value}`} className="cursor-pointer">
                  {g.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        <div className="space-y-3">
          <Label>Tipo de Cabelo</Label>
          <RadioGroup value={hairType} onValueChange={setHairType}>
            {HAIR_TYPES.map((type) => (
              <div key={type.value} className="flex items-center space-x-2">
                <RadioGroupItem value={type.value} id={`hair-${type.value}`} />
                <Label htmlFor={`hair-${type.value}`} className="cursor-pointer">
                  {type.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        <div className="space-y-3">
          <Label>Cor do Cabelo</Label>
          <div className="grid grid-cols-2 gap-2">
            {HAIR_COLORS.map((color) => (
              <div
                key={color.value}
                onClick={() => setHairColor(color.value)}
                className={`flex items-center gap-2 p-2 rounded border-2 cursor-pointer transition-all ${
                  hairColor === color.value
                    ? "border-primary bg-primary/10"
                    : "border-transparent hover:border-primary/50"
                }`}
              >
                <div
                  className="w-6 h-6 rounded-full border"
                  style={{ backgroundColor: color.color }}
                />
                <span className="text-sm">{color.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <Label>Cor da Pele</Label>
          <div className="grid grid-cols-2 gap-2">
            {SKIN_COLORS.map((color) => (
              <div
                key={color.value}
                onClick={() => setSkinColor(color.value)}
                className={`flex items-center gap-2 p-2 rounded border-2 cursor-pointer transition-all ${
                  skinColor === color.value
                    ? "border-primary bg-primary/10"
                    : "border-transparent hover:border-primary/50"
                }`}
              >
                <div
                  className="w-6 h-6 rounded-full border"
                  style={{ backgroundColor: color.color }}
                />
                <span className="text-sm">{color.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <Label>Cor dos Olhos</Label>
          <div className="grid grid-cols-2 gap-2">
            {EYE_COLORS.map((color) => (
              <div
                key={color.value}
                onClick={() => setEyeColor(color.value)}
                className={`flex items-center gap-2 p-2 rounded border-2 cursor-pointer transition-all ${
                  eyeColor === color.value
                    ? "border-primary bg-primary/10"
                    : "border-transparent hover:border-primary/50"
                }`}
              >
                <div
                  className="w-6 h-6 rounded-full border"
                  style={{ backgroundColor: color.color }}
                />
                <span className="text-sm">{color.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <Label>Acessórios de Rosto</Label>
          <RadioGroup value={accessories} onValueChange={setAccessories}>
            {ACCESSORIES.map((acc) => (
              <div key={acc.value} className="flex items-center space-x-2">
                <RadioGroupItem value={acc.value} id={`acc-${acc.value}`} />
                <Label htmlFor={`acc-${acc.value}`} className="cursor-pointer">
                  {acc.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>
      </div>

      <Button onClick={handleCreateAvatar} className="w-full">
        Usar Este Avatar
      </Button>
    </div>
  );
};
