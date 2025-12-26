import { useTheme } from "next-themes";
import { Toaster as Sonner, toast } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-gradient-to-r group-[.toaster]:from-orange-500 group-[.toaster]:via-pink-500 group-[.toaster]:to-purple-600 group-[.toaster]:text-white group-[.toaster]:border-0 group-[.toaster]:shadow-2xl group-[.toaster]:font-semibold",
          description: "group-[.toast]:text-white/90",
          actionButton: "group-[.toast]:bg-white group-[.toast]:text-purple-600 group-[.toast]:font-bold",
          cancelButton: "group-[.toast]:bg-white/20 group-[.toast]:text-white group-[.toast]:backdrop-blur",
          success: "group-[.toaster]:bg-gradient-to-r group-[.toaster]:from-green-500 group-[.toaster]:via-emerald-500 group-[.toaster]:to-teal-600",
          error: "group-[.toaster]:bg-gradient-to-r group-[.toaster]:from-red-500 group-[.toaster]:via-rose-500 group-[.toaster]:to-pink-600",
          warning: "group-[.toaster]:bg-gradient-to-r group-[.toaster]:from-yellow-500 group-[.toaster]:via-orange-500 group-[.toaster]:to-red-500",
          info: "group-[.toaster]:bg-gradient-to-r group-[.toaster]:from-blue-500 group-[.toaster]:via-indigo-500 group-[.toaster]:to-purple-600",
        },
      }}
      {...props}
    />
  );
};

export { Toaster, toast };
