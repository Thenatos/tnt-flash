import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Zap, Mail, Lock, User as UserIcon, Flame, ArrowLeft } from "lucide-react";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email({ message: "Email inválido" }),
  password: z.string().min(6, { message: "A senha deve ter no mínimo 6 caracteres" }),
});

const signupSchema = z.object({
  fullName: z.string().min(3, { message: "Nome deve ter no mínimo 3 caracteres" }),
  email: z.string().email({ message: "Email inválido" }),
  password: z.string().min(6, { message: "A senha deve ter no mínimo 6 caracteres" }),
  confirmPassword: z.string(),
  acceptedTerms: z.boolean().refine((val) => val === true, {
    message: "Você deve aceitar os termos para continuar",
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
});

const resetPasswordSchema = z.object({
  newPassword: z.string().min(6, { message: "A senha deve ter no mínimo 6 caracteres" }),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
});

const Auth = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, signIn, signUp, signInWithGoogle, resetPassword, updatePassword } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showTermsDialog, setShowTermsDialog] = useState(false);
  const [showForgotPasswordDialog, setShowForgotPasswordDialog] = useState(false);
  const [showResetPasswordDialog, setShowResetPasswordDialog] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
  const [forgotPasswordErrors, setForgotPasswordErrors] = useState<any>({});
  const [resetPasswordMsg, setResetPasswordMsg] = useState("");
  
  // Reset password form
  const [resetNewPassword, setResetNewPassword] = useState("");
  const [resetConfirmPassword, setResetConfirmPassword] = useState("");
  const [resetPasswordErrors, setResetPasswordErrors] = useState<any>({});
  
  // Login form
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginErrors, setLoginErrors] = useState<any>({});

  // Signup form
  const [signupFullName, setSignupFullName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupConfirmPassword, setSignupConfirmPassword] = useState("");
  const [signupErrors, setSignupErrors] = useState<any>({});

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  // Check if we're in reset password mode
  useEffect(() => {
    const mode = searchParams.get("mode");
    if (mode === "reset-password") {
      setShowResetPasswordDialog(true);
    }
  }, [searchParams]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginErrors({});
    
    try {
      const validated = loginSchema.parse({ email: loginEmail, password: loginPassword });
      setIsLoading(true);
      
      const { error } = await signIn(validated.email, validated.password);
      
      if (!error) {
        navigate("/");
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors: any = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            errors[err.path[0]] = err.message;
          }
        });
        setLoginErrors(errors);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignupErrors({});
    
    try {
      const validated = signupSchema.parse({
        fullName: signupFullName,
        email: signupEmail,
        password: signupPassword,
        confirmPassword: signupConfirmPassword,
        acceptedTerms: acceptedTerms,
      });
      
      setIsLoading(true);
      
      const { error } = await signUp(validated.email, validated.password, validated.fullName);
      
      if (!error) {
        // Clear form
        setSignupFullName("");
        setSignupEmail("");
        setSignupPassword("");
        setSignupConfirmPassword("");
        setAcceptedTerms(false);
        setShowTermsDialog(false);
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors: any = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            errors[err.path[0]] = err.message;
          }
        });
        setSignupErrors(errors);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignupClick = (e: React.FormEvent) => {
    e.preventDefault();
    setSignupErrors({});
    
    // Validate form fields first (excluding terms)
    const basicValidation = z.object({
      fullName: z.string().min(3, { message: "Nome deve ter no mínimo 3 caracteres" }),
      email: z.string().email({ message: "Email inválido" }),
      password: z.string().min(6, { message: "A senha deve ter no mínimo 6 caracteres" }),
      confirmPassword: z.string(),
    }).refine((data) => data.password === data.confirmPassword, {
      message: "As senhas não coincidem",
      path: ["confirmPassword"],
    });
    
    try {
      basicValidation.parse({
        fullName: signupFullName,
        email: signupEmail,
        password: signupPassword,
        confirmPassword: signupConfirmPassword,
      });
      
      // If validation passes, show terms dialog
      setShowTermsDialog(true);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors: any = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            errors[err.path[0]] = err.message;
          }
        });
        setSignupErrors(errors);
      }
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotPasswordErrors({});

    try {
      const validated = z.object({
        email: z.string().email({ message: "Email inválido" }),
      }).parse({ email: forgotPasswordEmail });

      setIsLoading(true);

      const { error } = await resetPassword(validated.email);

      if (!error) {
        setResetPasswordMsg("Email de recuperação enviado com sucesso! Verifique sua caixa de entrada.");
        setForgotPasswordEmail("");
        setTimeout(() => {
          setShowForgotPasswordDialog(false);
          setResetPasswordMsg("");
        }, 3000);
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors: any = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            errors[err.path[0]] = err.message;
          }
        });
        setForgotPasswordErrors(errors);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetPasswordErrors({});

    try {
      const validated = resetPasswordSchema.parse({
        newPassword: resetNewPassword,
        confirmPassword: resetConfirmPassword,
      });

      setIsLoading(true);

      const { error } = await updatePassword(validated.newPassword);

      if (!error) {
        setResetNewPassword("");
        setResetConfirmPassword("");
        setShowResetPasswordDialog(false);
        setTimeout(() => {
          navigate("/");
        }, 2000);
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors: any = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            errors[err.path[0]] = err.message;
          }
        });
        setResetPasswordErrors(errors);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center gradient-explosive py-12 px-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-gradient-accent rounded-full p-3">
              <Zap className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold">
            <span className="text-gradient-primary">TNT</span> OFERTAS
          </CardTitle>
          <CardDescription>
            Acesse sua conta ou crie uma nova para aproveitar as melhores ofertas
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login">Entrar</TabsTrigger>
              <TabsTrigger value="signup">Cadastrar</TabsTrigger>
            </TabsList>
            
            {/* Login Tab */}
            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="seu@email.com"
                      className="pl-10"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                  {loginErrors.email && (
                    <p className="text-sm text-destructive">{loginErrors.email}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="login-password">Senha</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="••••••••"
                      className="pl-10"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                  {loginErrors.password && (
                    <p className="text-sm text-destructive">{loginErrors.password}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full gradient-accent font-bold"
                  disabled={isLoading}
                >
                  {isLoading ? "Entrando..." : "Entrar"}
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  className="w-full text-sm"
                  onClick={() => setShowForgotPasswordDialog(true)}
                  disabled={isLoading}
                >
                  Esqueci minha senha
                </Button>
              </form>
            </TabsContent>
            
            {/* Signup Tab */}
            <TabsContent value="signup">
              <form onSubmit={handleSignupClick} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-name">Nome Completo</Label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="signup-name"
                      type="text"
                      placeholder="Seu nome"
                      className="pl-10"
                      value={signupFullName}
                      onChange={(e) => setSignupFullName(e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                  {signupErrors.fullName && (
                    <p className="text-sm text-destructive">{signupErrors.fullName}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="seu@email.com"
                      className="pl-10"
                      value={signupEmail}
                      onChange={(e) => setSignupEmail(e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                  {signupErrors.email && (
                    <p className="text-sm text-destructive">{signupErrors.email}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Senha</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="••••••••"
                      className="pl-10"
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                  {signupErrors.password && (
                    <p className="text-sm text-destructive">{signupErrors.password}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-confirm">Confirmar Senha</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="signup-confirm"
                      type="password"
                      placeholder="••••••••"
                      className="pl-10"
                      value={signupConfirmPassword}
                      onChange={(e) => setSignupConfirmPassword(e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                  {signupErrors.confirmPassword && (
                    <p className="text-sm text-destructive">{signupErrors.confirmPassword}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full gradient-accent font-bold"
                  disabled={isLoading}
                >
                  {isLoading ? "Criando conta..." : "Criar Conta"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Terms and Conditions Dialog */}
      <Dialog open={showTermsDialog} onOpenChange={setShowTermsDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader className="space-y-4">
            <div className="flex justify-center">
              <div className="bg-gradient-accent rounded-full p-6">
                <Flame className="h-12 w-12 text-white" />
              </div>
            </div>
            <DialogTitle className="text-center text-2xl">
              Você concorda com nossas políticas e termos?
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            <div className="flex items-start gap-3">
              <Checkbox
                id="terms"
                checked={acceptedTerms}
                onCheckedChange={(checked) => setAcceptedTerms(checked as boolean)}
                className="mt-1"
              />
              <label
                htmlFor="terms"
                className="text-sm leading-relaxed cursor-pointer"
              >
                Confirmo que li, aceito e concordo com os{" "}
                <a
                  href="/termos"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold underline hover:text-primary"
                >
                  Termos de uso
                </a>
                ,{" "}
                <a
                  href="/conduta"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold underline hover:text-primary"
                >
                  Código de conduta
                </a>
                {" "}e{" "}
                <a
                  href="/privacidade"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold underline hover:text-primary"
                >
                  Política de privacidade
                </a>
                .
              </label>
            </div>
            {signupErrors.acceptedTerms && (
              <p className="text-sm text-destructive">{signupErrors.acceptedTerms}</p>
            )}
            
            <Button
              type="button"
              className="w-full gradient-accent hover:opacity-90 font-bold text-lg py-6"
              disabled={!acceptedTerms || isLoading}
              onClick={handleSignup}
            >
              {isLoading ? "Criando conta..." : "Continuar"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Forgot Password Dialog */}
      <Dialog open={showForgotPasswordDialog} onOpenChange={setShowForgotPasswordDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader className="space-y-4">
            <div className="flex justify-center">
              <div className="bg-gradient-accent rounded-full p-3">
                <Mail className="h-8 w-8 text-white" />
              </div>
            </div>
            <DialogTitle className="text-center text-2xl">
              Recuperar Senha
            </DialogTitle>
            <DialogDescription className="text-center">
              Insira seu email para receber um link de redefinição de senha
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleForgotPassword} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="forgot-email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="forgot-email"
                  type="email"
                  placeholder="seu@email.com"
                  className="pl-10"
                  value={forgotPasswordEmail}
                  onChange={(e) => setForgotPasswordEmail(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              {forgotPasswordErrors.email && (
                <p className="text-sm text-destructive">{forgotPasswordErrors.email}</p>
              )}
            </div>

            {resetPasswordMsg && (
              <div className="bg-green-50 border border-green-200 rounded-md p-3">
                <p className="text-sm text-green-800">{resetPasswordMsg}</p>
              </div>
            )}

            <Button
              type="submit"
              className="w-full gradient-accent font-bold"
              disabled={isLoading || !!resetPasswordMsg}
            >
              {isLoading ? "Enviando..." : "Enviar Email"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Reset Password Dialog */}
      <Dialog open={showResetPasswordDialog} onOpenChange={setShowResetPasswordDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader className="space-y-4">
            <div className="flex justify-center">
              <div className="bg-gradient-accent rounded-full p-3">
                <Lock className="h-8 w-8 text-white" />
              </div>
            </div>
            <DialogTitle className="text-center text-2xl">
              Redefinir Senha
            </DialogTitle>
            <DialogDescription className="text-center">
              Digite sua nova senha para recuperar o acesso à sua conta
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleResetPassword} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="reset-password">Nova Senha</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="reset-password"
                  type="password"
                  placeholder="••••••••"
                  className="pl-10"
                  value={resetNewPassword}
                  onChange={(e) => setResetNewPassword(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              {resetPasswordErrors.newPassword && (
                <p className="text-sm text-destructive">{resetPasswordErrors.newPassword}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="reset-confirm">Confirmar Senha</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="reset-confirm"
                  type="password"
                  placeholder="••••••••"
                  className="pl-10"
                  value={resetConfirmPassword}
                  onChange={(e) => setResetConfirmPassword(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              {resetPasswordErrors.confirmPassword && (
                <p className="text-sm text-destructive">{resetPasswordErrors.confirmPassword}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full gradient-accent font-bold"
              disabled={isLoading}
            >
              {isLoading ? "Atualizando..." : "Redefinir Senha"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Auth;
