// import { useState } from "react";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent } from "@/components/ui/card";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Icons } from "@/lib/icons";
// import { useAuth } from "@/hooks/useAuth"; // Adjust path as needed

// export default function Landing() {
//   const { login, signup, isAuthenticated } = useAuth();
//   const [isLogin, setIsLogin] = useState(true);
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [firstName, setFirstName] = useState("");
//   const [lastName, setLastName] = useState("");
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState("");
//   const [successMessage, setSuccessMessage] = useState("");

//   // If already authenticated, redirect or show different content
//   if (isAuthenticated) {
//     window.location.href = "/discover"; // Or use your router
//     return null;
//   }

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setIsLoading(true);
//     setError("");
//     setSuccessMessage("");

//     try {
//       if (isLogin) {
//         await login(email, password);
//         // User will be redirected by the auth check above
//       } else {
//         const result = await signup(email, password, firstName, lastName);
//         if (result.message) {
//           setSuccessMessage(result.message);
//         } else {
//           setSuccessMessage("Account created successfully!");
//         }
//       }
//     } catch (err: any) {
//       setError(err.message || "Authentication failed");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gray-50 flex flex-col">
//       {/* Header */}
//       <header className="bg-white shadow-sm border-b border-gray-200">
//         <div className="max-w-md mx-auto px-4 py-4">
//           <div className="flex items-center justify-center space-x-3">
//             <div className="w-10 h-10 gradient-primary rounded-full flex items-center justify-center">
//               <Icons.Heart className="w-5 h-5 text-white" />
//             </div>
//             <h1 className="text-2xl font-bold text-gray-800">Heartsync</h1>
//           </div>
//         </div>
//       </header>

//       {/* Main Content */}
//       <main className="flex-1 flex items-center justify-center p-4">
//         <div className="max-w-md w-full space-y-8">
//           {/* Hero Section */}
//           <div className="text-center space-y-4">
//             <div className="gradient-trust rounded-2xl p-6 text-white">
//               <h2 className="text-3xl font-bold mb-2">Rencontres Basées sur l'Honnêteté</h2>
//               <p className="text-lg opacity-90">
//                 Découvrez des profils évalués par notre communauté pour leur transparence et authenticité
//               </p>
//             </div>
//           </div>

//           {/* Features */}
//           <div className="grid grid-cols-1 gap-4">
//             <Card className="border-l-4 border-l-blue-500">
//               <CardContent className="p-4">
//                 <div className="flex items-center space-x-3">
//                   <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
//                     <Icons.Star className="w-5 h-5 text-blue-600" />
//                   </div>
//                   <div>
//                     <h3 className="font-semibold text-gray-800">Système d'Évaluation</h3>
//                     <p className="text-sm text-gray-600">Les femmes évaluent l'honnêteté des hommes</p>
//                   </div>
//                 </div>
//               </CardContent>
//             </Card>

//             <Card className="border-l-4 border-l-green-500">
//               <CardContent className="p-4">
//                 <div className="flex items-center space-x-3">
//                   <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
//                     <Icons.Shield className="w-5 h-5 text-green-600" />
//                   </div>
//                   <div>
//                     <h3 className="font-semibold text-gray-800">Profils Vérifiés</h3>
//                     <p className="text-sm text-gray-600">Authenticity garantie par la communauté</p>
//                   </div>
//                 </div>
//               </CardContent>
//             </Card>

//             <Card className="border-l-4 border-l-pink-500">
//               <CardContent className="p-4">
//                 <div className="flex items-center space-x-3">
//                   <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center">
//                     <Icons.Users className="w-5 h-5 text-pink-600" />
//                   </div>
//                   <div>
//                     <h3 className="font-semibold text-gray-800">Communauté Bienveillante</h3>
//                     <p className="text-sm text-gray-600">Rencontres basées sur la confiance mutuelle</p>
//                   </div>
//                 </div>
//               </CardContent>
//             </Card>
//           </div>

//           {/* Auth Form */}
//           <Card>
//             <CardContent className="p-6">
//               <div className="space-y-4">
//                 {/* Toggle between Login/Signup */}
//                 <div className="flex bg-gray-100 rounded-lg p-1">
//                   <button
//                     onClick={() => setIsLogin(true)}
//                     className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
//                       isLogin 
//                         ? 'bg-white text-gray-900 shadow-sm' 
//                         : 'text-gray-600 hover:text-gray-900'
//                     }`}
//                   >
//                     Connexion
//                   </button>
//                   <button
//                     onClick={() => setIsLogin(false)}
//                     className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
//                       !isLogin 
//                         ? 'bg-white text-gray-900 shadow-sm' 
//                         : 'text-gray-600 hover:text-gray-900'
//                     }`}
//                   >
//                     Inscription
//                   </button>
//                 </div>

//                 {/* Form */}
//                 <form onSubmit={handleSubmit} className="space-y-4">
//                   {!isLogin && (
//                     <div className="grid grid-cols-2 gap-4">
//                       <div>
//                         <Label htmlFor="firstName">Prénom</Label>
//                         <Input
//                           id="firstName"
//                           type="text"
//                           value={firstName}
//                           onChange={(e) => setFirstName(e.target.value)}
//                           required={!isLogin}
//                         />
//                       </div>
//                       <div>
//                         <Label htmlFor="lastName">Nom</Label>
//                         <Input
//                           id="lastName"
//                           type="text"
//                           value={lastName}
//                           onChange={(e) => setLastName(e.target.value)}
//                           required={!isLogin}
//                         />
//                       </div>
//                     </div>
//                   )}

//                   <div>
//                     <Label htmlFor="email">Email</Label>
//                     <Input
//                       id="email"
//                       type="email"
//                       value={email}
//                       onChange={(e) => setEmail(e.target.value)}
//                       required
//                     />
//                   </div>

//                   <div>
//                     <Label htmlFor="password">Mot de passe</Label>
//                     <Input
//                       id="password"
//                       type="password"
//                       value={password}
//                       onChange={(e) => setPassword(e.target.value)}
//                       required
//                     />
//                   </div>

//                   {error && (
//                     <div className="p-3 bg-red-50 border border-red-200 rounded-md">
//                       <p className="text-sm text-red-800">{error}</p>
//                     </div>
//                   )}

//                   {successMessage && (
//                     <div className="p-3 bg-green-50 border border-green-200 rounded-md">
//                       <p className="text-sm text-green-800">{successMessage}</p>
//                     </div>
//                   )}

//                   <Button
//                     type="submit"
//                     disabled={isLoading}
//                     className="w-full gradient-primary text-white py-3 text-lg font-semibold rounded-xl hover:opacity-90 transition-opacity"
//                   >
//                     {isLoading ? (
//                       <div className="flex items-center justify-center space-x-2">
//                         <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
//                         <span>{isLogin ? "Connexion..." : "Inscription..."}</span>
//                       </div>
//                     ) : (
//                       isLogin ? "Se connecter" : "Créer un compte"
//                     )}
//                   </Button>
//                 </form>
//               </div>
//             </CardContent>
//           </Card>

//           <p className="text-center text-sm text-gray-600">
//             Rejoignez notre communauté basée sur l'honnêteté et la transparence
//           </p>
//         </div>
//       </main>
//     </div>
//   );
// }
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Icons } from "@/lib/icons";
import { useAuth } from "@/hooks/useAuth";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function Landing() {
  const { login, signup, resetPassword, isAuthenticated } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  
  // Forgot password state
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState("");
  const [resetSuccess, setResetSuccess] = useState("");

  // REMOVED THE PROBLEMATIC REDIRECT - Let the router handle navigation!
  // The router will automatically show the right page based on auth state

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccessMessage("");

    try {
      if (isLogin) {
        await login(email, password);
        // User will be redirected by the auth check above
      } else {
        const result = await signup(email, password, firstName, lastName);
        if (result && 'message' in result && result.message) {
          setSuccessMessage(result.message);
        } else {
          setSuccessMessage("Account created successfully!");
        }
      }
    } catch (err: any) {
      setError(err.message || "Authentication failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setResetLoading(true);
    setResetError("");
    setResetSuccess("");

    try {
      await resetPassword(resetEmail);
      setResetSuccess("Un email de réinitialisation a été envoyé à votre adresse email. Veuillez vérifier votre boîte de réception.");
      setResetEmail("");
      // Close dialog after 3 seconds
      setTimeout(() => {
        setShowForgotPassword(false);
        setResetSuccess("");
      }, 3000);
    } catch (err: any) {
      setResetError(err.message || "Erreur lors de l'envoi de l'email");
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center justify-center space-x-3">
            <div className="w-10 h-10 gradient-primary rounded-full flex items-center justify-center">
              <Icons.Heart className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800">Heartsync</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="max-w-md w-full space-y-8">
          {/* Hero Section */}
          <div className="text-center space-y-4">
            <div className="gradient-trust rounded-2xl p-6 text-white">
              <h2 className="text-3xl font-bold mb-2">Rencontres Basées sur l'Honnêteté</h2>
              <p className="text-lg opacity-90">
                Découvrez des profils évalués par notre communauté pour leur transparence et authenticité
              </p>
            </div>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 gap-4">
            <Card className="border-l-4 border-l-blue-500">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Icons.Star className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">Système d'Évaluation</h3>
                    <p className="text-sm text-gray-600">Les femmes évaluent l'honnêteté des hommes</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-green-500">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <Icons.Shield className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">Profils Vérifiés</h3>
                    <p className="text-sm text-gray-600">Authenticity garantie par la communauté</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-pink-500">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center">
                    <Icons.Users className="w-5 h-5 text-pink-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">Communauté Bienveillante</h3>
                    <p className="text-sm text-gray-600">Rencontres basées sur la confiance mutuelle</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Auth Form */}
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                {/* Toggle between Login/Signup */}
                <div className="flex bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setIsLogin(true)}
                    className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                      isLogin 
                        ? 'bg-white text-gray-900 shadow-sm' 
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Connexion
                  </button>
                  <button
                    onClick={() => setIsLogin(false)}
                    className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                      !isLogin 
                        ? 'bg-white text-gray-900 shadow-sm' 
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Inscription
                  </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  {!isLogin && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="firstName">Prénom</Label>
                        <Input
                          id="firstName"
                          type="text"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          required={!isLogin}
                        />
                      </div>
                      <div>
                        <Label htmlFor="lastName">Nom</Label>
                        <Input
                          id="lastName"
                          type="text"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          required={!isLogin}
                        />
                      </div>
                    </div>
                  )}

                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password">Mot de passe</Label>
                      {isLogin && (
                        <Dialog open={showForgotPassword} onOpenChange={setShowForgotPassword}>
                          <DialogTrigger asChild>
                            <button
                              type="button"
                              className="text-sm text-blue-600 hover:text-blue-700 hover:underline"
                              data-testid="link-forgot-password"
                            >
                              Mot de passe oublié?
                            </button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Réinitialiser le mot de passe</DialogTitle>
                              <DialogDescription>
                                Entrez votre adresse email et nous vous enverrons un lien pour réinitialiser votre mot de passe.
                              </DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleResetPassword} className="space-y-4">
                              <div>
                                <Label htmlFor="reset-email">Email</Label>
                                <Input
                                  id="reset-email"
                                  type="email"
                                  value={resetEmail}
                                  onChange={(e) => setResetEmail(e.target.value)}
                                  placeholder="votre@email.com"
                                  required
                                  data-testid="input-reset-email"
                                />
                              </div>

                              {resetError && (
                                <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                                  <p className="text-sm text-red-800">{resetError}</p>
                                </div>
                              )}

                              {resetSuccess && (
                                <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                                  <p className="text-sm text-green-800">{resetSuccess}</p>
                                </div>
                              )}

                              <Button
                                type="submit"
                                disabled={resetLoading}
                                className="w-full"
                                data-testid="button-send-reset-email"
                              >
                                {resetLoading ? (
                                  <div className="flex items-center justify-center space-x-2">
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    <span>Envoi en cours...</span>
                                  </div>
                                ) : (
                                  "Envoyer le lien de réinitialisation"
                                )}
                              </Button>
                            </form>
                          </DialogContent>
                        </Dialog>
                      )}
                    </div>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      data-testid="input-password"
                    />
                  </div>

                  {error && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                      <p className="text-sm text-red-800">{error}</p>
                    </div>
                  )}

                  {successMessage && (
                    <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                      <p className="text-sm text-green-800">{successMessage}</p>
                    </div>
                  )}

                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full gradient-primary text-white py-3 text-lg font-semibold rounded-xl hover:opacity-90 transition-opacity"
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>{isLogin ? "Connexion..." : "Inscription..."}</span>
                      </div>
                    ) : (
                      isLogin ? "Se connecter" : "Créer un compte"
                    )}
                  </Button>
                </form>
              </div>
            </CardContent>
          </Card>

          <p className="text-center text-sm text-gray-600">
            Rejoignez notre communauté basée sur l'honnêteté et la transparence
          </p>
        </div>
      </main>
    </div>
  );
}