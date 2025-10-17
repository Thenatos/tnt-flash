import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { X } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface GoogleSignInPopupProps {
  delayMs?: number;
}

export const GoogleSignInPopup = ({ delayMs = 5000 }: GoogleSignInPopupProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, signInWithGoogle } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Don't show if user is already logged in
    if (user) return;

    // Check if popup was dismissed in this session
    const dismissed = sessionStorage.getItem("googleSignInPopupDismissed");
    if (dismissed) return;

    const timer = setTimeout(() => {
      setIsOpen(true);
    }, delayMs);

    return () => clearTimeout(timer);
  }, [user, delayMs]);

  const handleSignIn = async () => {
    try {
      await signInWithGoogle();
      setIsOpen(false);
    } catch (error) {
      // Error is already handled by useAuth hook with toast
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    sessionStorage.setItem("googleSignInPopupDismissed", "true");
  };

  if (user || !isOpen) return null;

  return (
    <div className="fixed top-20 right-4 z-50 animate-in fade-in slide-in-from-top-5 duration-500">
      <div className="bg-[#1f1f1f] rounded-lg shadow-2xl border border-gray-800 w-80 sm:w-96">
        <div className="relative">
          <button
            onClick={handleClose}
            className="absolute right-3 top-3 text-gray-400 hover:text-white transition-colors z-10"
          >
            <X className="h-5 w-5" />
          </button>
          
          <div className="p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center flex-shrink-0">
                <svg viewBox="0 0 24 24" className="w-5 h-5">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
              </div>
              <div className="flex-1 pr-6">
                <p className="text-white text-sm font-medium">
                  Faça login em tntofertasonline.com.br com o Google
                </p>
              </div>
            </div>

            <div className="pt-2">
              <Button
                onClick={handleSignIn}
                className="w-full bg-[#1a73e8] hover:bg-[#1557b0] text-white h-11"
              >
                Continuar com o Google
              </Button>
            </div>

            <div className="text-center">
              <button
                onClick={() => navigate("/auth")}
                className="text-[#8ab4f8] text-xs hover:underline"
              >
                Usar outra conta
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
