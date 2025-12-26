import { getStoreGradientStyle } from "@/utils/storeColors";

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
    <span
      style={gradientStyle}
      className={`inline-flex items-center rounded-full font-semibold shadow-md ${sizeClasses[size]} ${className}`}
    >
      {storeName}
    </span>
  );
};
