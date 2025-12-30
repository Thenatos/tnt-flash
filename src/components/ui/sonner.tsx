import { useTheme } from "next-themes";
import { Toaster as Sonner, toast } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      position="bottom-right"
      expand={true}
      visibleToasts={5}
      gap={6}
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-2 group-[.toaster]:border-transparent group-[.toaster]:shadow-xl group-[.toaster]:bg-gradient-to-r group-[.toaster]:from-pink-500 group-[.toaster]:to-purple-600 group-[.toaster]:bg-clip-border group-[.toaster]:p-[2px] group-[.toaster]:relative before:group-[.toaster]:content-[''] before:group-[.toaster]:absolute before:group-[.toaster]:inset-[2px] before:group-[.toaster]:bg-background before:group-[.toaster]:rounded-[calc(0.5rem-2px)] before:group-[.toaster]:-z-10",
          description: "group-[.toast]:text-muted-foreground group-[.toast]:relative group-[.toast]:z-10",
          actionButton: "group-[.toast]:bg-gradient-to-r group-[.toast]:from-pink-500 group-[.toast]:to-purple-600 group-[.toast]:text-white group-[.toast]:border-0 group-[.toast]:relative group-[.toast]:z-10",
          cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground group-[.toast]:relative group-[.toast]:z-10",
        },
      }}
      {...props}
    />
  );
};

export { Toaster, toast };
