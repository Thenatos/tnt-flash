import { useState, useEffect, createContext, useContext, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: any }>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: any }>;
  updatePassword: (newPassword: string) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log("Auth state changed:", event, !!session);
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // THEN check for existing session and handle recovery tokens from URL
    const initAuth = async () => {
      // First, check if there's a recovery token in the URL hash
      const hash = window.location.hash;
      if (hash.includes('type=recovery') && hash.includes('access_token')) {
        console.log("Recovery token detected in URL");
        // Let Supabase handle the session creation from the hash
        // It will call the onAuthStateChange listener
      }

      // Get the current session (might be created from hash)
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    };

    initAuth();

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        toast({
          variant: "destructive",
          title: "Erro ao fazer login",
          description: error.message,
        });
        return { error };
      }

      toast({
        title: "Login realizado!",
        description: "Bem-vindo de volta ao TNT Ofertas!",
      });
      
      return { error: null };
    } catch (error: any) {
      return { error };
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) {
        toast({
          variant: "destructive",
          title: "Erro ao criar conta",
          description: error.message,
        });
        return { error };
      }

      // Enviar email de boas-vindas
      if (data.user) {
        try {
          await supabase.functions.invoke('send-welcome-email', {
            body: {
              userId: data.user.id,
              email: data.user.email,
              fullName: fullName,
            },
          });
        } catch (emailError) {
          // Email de boas-vindas é opcional - não bloqueia o signup
        }
      }

      toast({
        title: "Conta criada com sucesso!",
        description: "Você já pode fazer login. Confira seu email de boas-vindas!",
      });
      
      return { error: null };
    } catch (error: any) {
      return { error };
    }
  };

  const signInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/`,
        },
      });

      if (error) {
        toast({
          variant: "destructive",
          title: "Erro ao fazer login com Google",
          description: error.message,
        });
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível fazer login com Google.",
      });
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        toast({
          variant: "destructive",
          title: "Erro ao sair",
          description: error.message,
        });
        return;
      }

      toast({
        title: "Logout realizado",
        description: "Até logo!",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível fazer logout.",
      });
    }
  };

  const resetPassword = async (email: string) => {
    try {
      // Use Supabase's built-in email (not our custom one) to preserve the hash with token
      // This ensures the reset link includes the access_token in the hash
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth?mode=reset-password`,
      });

      if (error) {
        toast({
          variant: "destructive",
          title: "Erro ao solicitar redefinição",
          description: error.message,
        });
        return { error };
      }

      toast({
        title: "Email enviado!",
        description: "Verifique seu email para redefinir sua senha. O link expira em 1 hora.",
      });

      return { error: null };
    } catch (error: any) {
      return { error };
    }
  };

  const updatePassword = async (newPassword: string) => {
    try {
      // Supabase automatically handles the session from the URL hash
      // when resetPasswordForEmail is used with the correct redirect URL
      
      // First, verify we have a valid session from the reset link
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (!session) {
        // Try to extract and use the token from URL hash
        const hash = window.location.hash;
        if (hash.includes('access_token')) {
          // Parse the access token from the hash
          const params = new URLSearchParams(hash.replace('#', '?'));
          const accessToken = params.get('access_token');
          const refreshToken = params.get('refresh_token');
          const type = params.get('type');

          if (accessToken && type === 'recovery') {
            // Set the session manually with the token from the URL
            const { error: setSessionError } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken || '',
            });

            if (setSessionError) {
              throw new Error(`Session setup failed: ${setSessionError.message}`);
            }
          } else {
            throw new Error("Reset link is invalid or expired. Please request a new password reset.");
          }
        } else {
          throw new Error("Auth session missing! Please try clicking the reset link again.");
        }
      }

      // Now update the password with the valid session
      const { error } = await supabase.auth.updateUser(
        { password: newPassword }
      );

      if (error) {
        throw error;
      }

      toast({
        title: "Senha atualizada!",
        description: "Sua senha foi redefinida com sucesso.",
      });

      // Sign out after password reset for security
      await supabase.auth.signOut();

      return { error: null };
    } catch (error: any) {
      const errorMsg = error?.message || "Erro ao atualizar senha";
      toast({
        variant: "destructive",
        title: "Erro ao atualizar senha",
        description: errorMsg,
      });
      return { error };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        signIn,
        signUp,
        signInWithGoogle,
        signOut,
        resetPassword,
        updatePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
