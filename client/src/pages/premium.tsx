// import { useState, useEffect } from "react";
// import { useQuery, useMutation } from "@tanstack/react-query";
// import { useAuth } from "@/hooks/useAuth";
// import { useToast } from "@/hooks/use-toast";
// import { apiRequest, queryClient } from "@/lib/queryClient";
// import { isUnauthorizedError } from "@/lib/authUtils";
// import { Navigation } from "@/components/Navigation";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import { Icons } from "@/lib/icons";

// export default function Premium() {
//   const { user, isAuthenticated, isLoading } = useAuth();
//   const { toast } = useToast();


//   const { data: subscriptionStatus, refetch: refetchSubscription } = useQuery({
//     queryKey: ["/api/subscription-status"],
//     queryFn: async () => {
//       const response = await apiRequest("GET", "/api/subscription-status");
//       if (!response.ok) {
//         throw new Error("Failed to fetch subscription status");
//       }
//       return response.json();
//     },
//     enabled: isAuthenticated && !isLoading,
//   });

  
//   const createCheckoutSession = useMutation({
//     mutationFn: async () => {
//       const res = await apiRequest("POST", "/api/subscribe");
//       return res.json();
//     },
//     onSuccess: (data) => {
//       if (data.url) {
//         window.location.href = data.url;
//       } else if (data.message === "Already subscribed") {
//         toast({
//           title: "Déjà abonné",
//           description: "Vous avez déjà un abonnement Premium actif",
//         });
//         refetchSubscription();
//       } else {
//         toast({
//           title: "Erreur",
//           description: "Impossible de rediriger vers Stripe",
//           variant: "destructive"
//         });
//       }
//     },
//     onError: (error) => {
//       if (isUnauthorizedError(error)) {
//         toast({
//           title: "Non autorisé",
//           description: "Vous devez être connecté pour souscrire",
//           variant: "destructive",
//         });
//         setTimeout(() => {
//           window.location.href = "/api/login";
//         }, 500);
//         return;
//       }
//       console.error("Checkout session creation error:", error);
//       toast({
//         title: "Erreur",
//         description: "Impossible de créer une session Stripe",
//         variant: "destructive"
//       });
//     }
//   });

//   useEffect(() => {
//     if (!isLoading && !isAuthenticated) {
//       toast({
//         title: "Non autorisé",
//         description: "Vous devez être connecté pour accéder à cette page",
//         variant: "destructive",
//       });
//       setTimeout(() => {
//         window.location.href = "/api/login";
//       }, 500);
//       return;
//     }
//   }, [isAuthenticated, isLoading, toast]);

//   const handleSubscribe = () => {
//     createCheckoutSession.mutate();
//   };



//   if (isLoading) {
//     return (
//       <div className="min-h-screen bg-gray-50 flex items-center justify-center">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
//           <p className="text-gray-600">Chargement...</p>
//         </div>
//       </div>
//     );
//   }

//   const isSubscribed = subscriptionStatus?.subscribed;

//   return (
//     <div className="min-h-screen bg-gray-50 pb-20">
//       {/* Header */}
//       <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
//         <div className="max-w-md mx-auto px-4 py-3">
//           <div className="flex items-center justify-center space-x-3">
//             <div className="w-8 h-8 gradient-primary rounded-full flex items-center justify-center">
//               <Icons.Crown className="w-4 h-4 text-white" />
//             </div>
//             <h1 className="text-xl font-bold text-gray-800">Heartsync Premium</h1>
//           </div>
//         </div>
//       </header>

//       {/* Main Content */}
//       <main className="max-w-md mx-auto bg-white min-h-screen">
//         <div className="p-4 space-y-6">
//           {/* Current Status */}
//           <Card>
//             <CardContent className="p-6 text-center">
//               <div className="w-16 h-16 mx-auto mb-4 gradient-primary rounded-full flex items-center justify-center">
//                 <Icons.Crown className="w-8 h-8 text-white" />
//               </div>
//               <h2 className="text-xl font-bold text-gray-800 mb-2">
//                 {isSubscribed ? 'Abonnement Premium Actif' : 'Passez à Premium'}
//               </h2>
//               <p className="text-gray-600 text-sm mb-4">
//                 {isSubscribed 
//                   ? 'Profitez de toutes les fonctionnalités premium' 
//                   : 'Débloquez toutes les fonctionnalités de Heartsync'
//                 }
//               </p>
//               {isSubscribed && (
//                 <Badge className="bg-green-100 text-green-800 border-green-200">
//                   Actif
//                 </Badge>
//               )}
//             </CardContent>
//           </Card>

//           {/* Features Comparison */}
//           <Card>
//             <CardHeader>
//               <CardTitle>Fonctionnalités Premium</CardTitle>
//             </CardHeader>
//             <CardContent>
//               <div className="space-y-4">
//                 <div className="grid grid-cols-3 gap-4 text-sm">
//                   <div className="font-medium">Fonctionnalité</div>
//                   <div className="font-medium text-center">Gratuit</div>
//                   <div className="font-medium text-center">Premium</div>
//                 </div>
                
//                 <div className="grid grid-cols-3 gap-4 text-sm border-t pt-4">
//                   <div className="flex items-center space-x-2">
//                     <Icons.Shield className="w-4 h-4 text-blue-500" />
//                     <span>Profils vérifiés</span>
//                   </div>
//                   <div className="text-center">
//                     <Icons.Check className="w-4 h-4 text-green-500 mx-auto" />
//                   </div>
//                   <div className="text-center">
//                     <Icons.Check className="w-4 h-4 text-green-500 mx-auto" />
//                   </div>
//                 </div>

//                 <div className="grid grid-cols-3 gap-4 text-sm">
//                   <div className="flex items-center space-x-2">
//                     <Icons.Star className="w-4 h-4 text-yellow-500" />
//                     <span>Évaluations illimitées</span>
//                   </div>
//                   <div className="text-center">
//                     <span className="text-gray-500">3/jour</span>
//                   </div>
//                   <div className="text-center">
//                     <Icons.Check className="w-4 h-4 text-green-500 mx-auto" />
//                   </div>
//                 </div>

//                 <div className="grid grid-cols-3 gap-4 text-sm">
//                   <div className="flex items-center space-x-2">
//                     <Icons.MessageCircle className="w-4 h-4 text-pink-500" />
//                     <span>Messages prioritaires</span>
//                   </div>
//                   <div className="text-center">
//                     <Icons.X className="w-4 h-4 text-red-500 mx-auto" />
//                   </div>
//                   <div className="text-center">
//                     <Icons.Check className="w-4 h-4 text-green-500 mx-auto" />
//                   </div>
//                 </div>

//                 <div className="grid grid-cols-3 gap-4 text-sm">
//                   <div className="flex items-center space-x-2">
//                     <Icons.Crown className="w-4 h-4 text-purple-500" />
//                     <span>Badge Premium</span>
//                   </div>
//                   <div className="text-center">
//                     <Icons.X className="w-4 h-4 text-red-500 mx-auto" />
//                   </div>
//                   <div className="text-center">
//                     <Icons.Check className="w-4 h-4 text-green-500 mx-auto" />
//                   </div>
//                 </div>

//                 <div className="grid grid-cols-3 gap-4 text-sm">
//                   <div className="flex items-center space-x-2">
//                     <Icons.Shield className="w-4 h-4 text-blue-500" />
//                     <span>Profils détaillés</span>
//                   </div>
//                   <div className="text-center">
//                     <Icons.X className="w-4 h-4 text-red-500 mx-auto" />
//                   </div>
//                   <div className="text-center">
//                     <Icons.Check className="w-4 h-4 text-green-500 mx-auto" />
//                   </div>
//                 </div>
//               </div>
//             </CardContent>
//           </Card>

//           {/* Payment Section */}
//           {!isSubscribed && (
//             <Card>
//               <CardHeader>
//                 <CardTitle>Souscrire Premium</CardTitle>
//               </CardHeader>
//               <CardContent>
//                 <div className="space-y-4">
//                   <div className="text-center">
//                     <div className="text-3xl font-bold text-gray-800 mb-2">9,99€</div>
//                     <div className="text-gray-600">par mois</div>
//                   </div>
//                   <Button 
//                     onClick={handleSubscribe}
//                     className="w-full gradient-primary text-white py-3 rounded-xl font-semibold"
//                     disabled={createCheckoutSession.isPending}
//                   >
//                     {createCheckoutSession.isPending ? 'Préparation...' : 'Souscrire Premium'}
//                   </Button>
//                   <p className="text-xs text-gray-500 text-center">
//                     Résiliable à tout moment • Paiement sécurisé par Stripe
//                   </p>
//                 </div>
//               </CardContent>
//             </Card>
//           )}

//           {/* Premium Benefits */}
//           <Card>
//             <CardHeader>
//               <CardTitle>Avantages Premium</CardTitle>
//             </CardHeader>
//             <CardContent>
//               <div className="space-y-3">
//                 <div className="flex items-start space-x-3">
//                   <div className="w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center">
//                     <Icons.Star className="w-4 h-4 text-pink-600" />
//                   </div>
//                   <div>
//                     <h4 className="font-medium text-gray-800">Évaluations illimitées</h4>
//                     <p className="text-sm text-gray-600">Évaluez autant de profils que vous voulez pour aider la communauté</p>
//                   </div>
//                 </div>

//                 <div className="flex items-start space-x-3">
//                   <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
//                     <Icons.MessageCircle className="w-4 h-4 text-blue-600" />
//                   </div>
//                   <div>
//                     <h4 className="font-medium text-gray-800">Messages prioritaires</h4>
//                     <p className="text-sm text-gray-600">Vos messages apparaissent en premier dans les conversations</p>
//                   </div>
//                 </div>

//                 <div className="flex items-start space-x-3">
//                   <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
//                     <Icons.Crown className="w-4 h-4 text-purple-600" />
//                   </div>
//                   <div>
//                     <h4 className="font-medium text-gray-800">Badge Premium</h4>
//                     <p className="text-sm text-gray-600">Montrez votre engagement envers la qualité et l'honnêteté</p>
//                   </div>
//                 </div>

//                 <div className="flex items-start space-x-3">
//                   <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
//                     <Icons.Shield className="w-4 h-4 text-green-600" />
//                   </div>
//                   <div>
//                     <h4 className="font-medium text-gray-800">Profils détaillés</h4>
//                     <p className="text-sm text-gray-600">Accédez à plus d'informations sur les profils et leurs évaluations</p>
//                   </div>
//                 </div>
//               </div>
//             </CardContent>
//           </Card>
//         </div>
//       </main>

//       {/* Bottom Navigation */}
//       <Navigation />
//     </div>
//   );
// }

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Icons } from "@/lib/icons";

export default function Premium() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();

  const { data: subscriptionStatus, refetch: refetchSubscription } = useQuery({
    queryKey: ["/api/subscription-status"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/subscription-status");
      if (!response.ok) {
        throw new Error("Failed to fetch subscription status");
      }
      return response.json();
    },
    enabled: isAuthenticated && !isLoading,
  });

  const createCheckoutSession = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/subscribe");
      return res.json();
    },
    onSuccess: (data) => {
      if (data.url) {
        window.location.href = data.url;
      } else if (data.message === "Already subscribed") {
        toast({
          title: "Déjà abonné",
          description: "Vous avez déjà un abonnement Premium actif",
        });
        refetchSubscription();
      } else {
        toast({
          title: "Erreur",
          description: "Impossible de rediriger vers Stripe",
          variant: "destructive"
        });
      }
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Non autorisé",
          description: "Vous devez être connecté pour souscrire",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      console.error("Checkout session creation error:", error);
      toast({
        title: "Erreur",
        description: "Impossible de créer une session Stripe",
        variant: "destructive"
      });
    }
  });

  const startFreeTrial = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/start-trial");
      return res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Essai gratuit activé !",
        description: "Profitez de 7 jours de Premium gratuit",
      });
      refetchSubscription();
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    },
    onError: (error) => {
      console.error("Free trial activation error:", error);
      toast({
        title: "Erreur",
        description: "Impossible d'activer l'essai gratuit",
        variant: "destructive"
      });
    }
  });

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Non autorisé",
        description: "Vous devez être connecté pour accéder à cette page",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  const handleSubscribe = () => {
    if (!hasUsedTrial && !isSubscribed) {
      // Start free trial without payment
      startFreeTrial.mutate();
    } else {
      // Go to Stripe checkout for payment
      createCheckoutSession.mutate();
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  const isSubscribed = subscriptionStatus?.subscribed;
  const isInTrialPeriod = subscriptionStatus?.isInTrialPeriod;
  const trialDaysRemaining = subscriptionStatus?.trialDaysRemaining;
  const hasUsedTrial = subscriptionStatus?.hasUsedTrial;
  const trialExpired = hasUsedTrial && !isInTrialPeriod && !isSubscribed;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-md mx-auto px-4 py-3">
          <div className="flex items-center justify-center space-x-3">
            <div className="w-8 h-8 gradient-primary rounded-full flex items-center justify-center">
              <Icons.Crown className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-xl font-bold text-gray-800">Heartsync Premium</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-md mx-auto bg-white min-h-screen">
        <div className="p-4 space-y-6">
          {/* Current Status */}
          <Card>
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 mx-auto mb-4 gradient-primary rounded-full flex items-center justify-center">
                <Icons.Crown className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">
                {isSubscribed 
                  ? (isInTrialPeriod ? 'Période d\'essai Premium' : 'Abonnement Premium Actif')
                  : 'Passez à Premium'
                }
              </h2>
              <p className="text-gray-600 text-sm mb-4">
                {isSubscribed 
                  ? (isInTrialPeriod 
                    ? `${trialDaysRemaining} jours restants dans votre essai gratuit` 
                    : 'Profitez de toutes les fonctionnalités premium')
                  : 'Débloquez toutes les fonctionnalités de Heartsync'
                }
              </p>
              {isSubscribed && (
                <Badge className={isInTrialPeriod ? "bg-blue-100 text-blue-800 border-blue-200" : "bg-green-100 text-green-800 border-green-200"}>
                  {isInTrialPeriod ? 'Essai Gratuit' : 'Actif'}
                </Badge>
              )}
            </CardContent>
          </Card>

         
          {/* Features Comparison */}
          <Card>
            <CardHeader>
              <CardTitle>Fonctionnalités Premium</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div className="font-medium">Fonctionnalité</div>
                  <div className="font-medium text-center">Gratuit</div>
                  <div className="font-medium text-center">Premium</div>
                </div>

                <div className="grid grid-cols-3 gap-4 text-sm border-t pt-4">
                  <div className="flex items-center space-x-2">
                    <Icons.Shield className="w-4 h-4 text-blue-500" />
                    <span>Profils vérifiés</span>
                  </div>
                  <div className="text-center">
                    <Icons.Check className="w-4 h-4 text-green-500 mx-auto" />
                  </div>
                  <div className="text-center">
                    <Icons.Check className="w-4 h-4 text-green-500 mx-auto" />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <Icons.Star className="w-4 h-4 text-yellow-500" />
                    <span>Évaluations illimitées</span>
                  </div>
                  <div className="text-center">
                    <span className="text-gray-500">3/jour</span>
                  </div>
                  <div className="text-center">
                    <Icons.Check className="w-4 h-4 text-green-500 mx-auto" />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <Icons.MessageCircle className="w-4 h-4 text-pink-500" />
                    <span>Messages prioritaires</span>
                  </div>
                  <div className="text-center">
                    <Icons.X className="w-4 h-4 text-red-500 mx-auto" />
                  </div>
                  <div className="text-center">
                    <Icons.Check className="w-4 h-4 text-green-500 mx-auto" />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <Icons.Crown className="w-4 h-4 text-purple-500" />
                    <span>Badge Premium</span>
                  </div>
                  <div className="text-center">
                    <Icons.X className="w-4 h-4 text-red-500 mx-auto" />
                  </div>
                  <div className="text-center">
                    <Icons.Check className="w-4 h-4 text-green-500 mx-auto" />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <Icons.Shield className="w-4 h-4 text-blue-500" />
                    <span>Profils détaillés</span>
                  </div>
                  <div className="text-center">
                    <Icons.X className="w-4 h-4 text-red-500 mx-auto" />
                  </div>
                  <div className="text-center">
                    <Icons.Check className="w-4 h-4 text-green-500 mx-auto" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

       
          {/* Free Trial Card - Only for new users who haven't used trial */}
          {!isSubscribed && !hasUsedTrial && (
            <Card className="border-2 border-green-200 bg-green-50">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Icons.Star className="w-5 h-5 text-green-600" />
                  <span>Essai Gratuit</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 px-4 py-1 mb-4">
                      7 JOURS GRATUITS
                    </Badge>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">
                      Testez Premium gratuitement
                    </h3>
                    <p className="text-sm text-gray-600">
                      Accès complet à toutes les fonctionnalités Premium pendant 7 jours.
                    </p>
                  </div>
                  <Button 
                    onClick={() => startFreeTrial.mutate()}
                    className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-semibold"
                    disabled={startFreeTrial.isPending}
                  >
                    {startFreeTrial.isPending ? 'Activation...' : 'Commencer l\'essai gratuit'}
                  </Button>
                  <p className="text-xs text-gray-500 text-center">
                   
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Regular Subscription Card */}
          {!isSubscribed && (
            <Card className={trialExpired ? "border-2 border-red-200" : ""}>
              <CardHeader>
                <CardTitle>
                  {trialExpired ? "Continuer avec Premium" : "Abonnement Premium"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {trialExpired && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                      <p className="text-sm text-red-700">
                        Votre période d'essai de 7 jours est terminée. Souscrivez pour continuer à profiter des fonctionnalités Premium.
                      </p>
                    </div>
                  )}
                  <div className="text-center">
                    <div className="text-3xl font-bold text-gray-800 mb-2">9,99€</div>
                    <div className="text-gray-600">par mois</div>
                  </div>
                  <Button 
                    onClick={() => createCheckoutSession.mutate()}
                    className={`w-full text-white py-3 rounded-xl font-semibold ${
                      trialExpired ? "bg-red-600 hover:bg-red-700" : "gradient-primary"
                    }`}
                    disabled={createCheckoutSession.isPending}
                  >
                    {createCheckoutSession.isPending
                      ? 'Redirection...' 
                      : (trialExpired ? 'Continuer avec Premium' : 'Souscrire maintenant')
                    }
                  </Button>
                  <p className="text-xs text-gray-500 text-center">
                    Paiement sécurisé par Stripe • Résiliable à tout moment
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Trial Info for subscribers in trial */}
          {isInTrialPeriod && (
            <Card className="border-2 border-blue-200 bg-blue-50">
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-800">Votre essai gratuit</h3>
                    <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                      {trialDaysRemaining} jours restants
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600">
                    Vous profitez actuellement de toutes les fonctionnalités Premium gratuitement. Après {trialDaysRemaining} jours, vous perdrez ces privilèges et devrez souscrire
                  </p>
                 
                </div>
              </CardContent>
            </Card>
          )}

          {/* Premium Benefits */}
          <Card>
            <CardHeader>
              <CardTitle>Avantages Premium</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center">
                    <Icons.Star className="w-4 h-4 text-pink-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-800">Évaluations illimitées</h4>
                    <p className="text-sm text-gray-600">Évaluez autant de profils que vous voulez pour aider la communauté</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <Icons.MessageCircle className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-800">Messages prioritaires</h4>
                    <p className="text-sm text-gray-600">Vos messages apparaissent en premier dans les conversations</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <Icons.Crown className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-800">Badge Premium</h4>
                    <p className="text-sm text-gray-600">Montrez votre engagement envers la qualité et l'honnêteté</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <Icons.Shield className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-800">Profils détaillés</h4>
                    <p className="text-sm text-gray-600">Accédez à plus d'informations sur les profils et leurs évaluations</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Bottom Navigation */}
      <Navigation />
    </div>
  );
}