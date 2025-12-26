import { getStoreGradientStyle } from "@/utils/storeColors";
import { Badge } from "@/components/ui/badge";

interface StoreTagProps {
  storeName: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export const StoreTag = ({ storeName, size = "md", className = "" }: StoreTagProps) => {
  const gradientStyle = getStoreGradientStyle(storeName);
  
  const sizeClasses = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-3 py-1",
    lg: "text-base px-4 py-1.5",
  };

  return (
    <Badge
      style={gradientStyle}
      className={`font-semibold shadow-md border-0 ${sizeClasses[size]} ${className}`}
    >
      {storeName}
    </Badge>
  );
};
