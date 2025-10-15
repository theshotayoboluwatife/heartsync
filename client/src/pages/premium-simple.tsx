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
import { useStripe, useElements, Elements, PaymentElement } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { Icons } from "@/lib/icons";

if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  throw new Error('Missing required Stripe key: VITE_STRIPE_PUBLIC_KEY');
}
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const SubscriptionForm = ({ onSuccess }: { onSuccess: () => void }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: window.location.origin + "/premium",
      },
    });

    if (error) {
      toast({
        title: "Erreur de paiement",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Paiement réussi",
        description: "Vous êtes maintenant abonné Premium !",
      });
      onSuccess();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />
      <Button 
        type="submit" 
        className="w-full gradient-primary text-white py-3 rounded-xl font-semibold"
        disabled={!stripe || !elements}
      >
        Souscrire Premium - 9,99€/mois
      </Button>
    </form>
  );
};

export default function Premium() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const [clientSecret, setClientSecret] = useState("");
  const [showPaymentForm, setShowPaymentForm] = useState(false);

  const { data: subscriptionStatus, refetch: refetchSubscription } = useQuery({
    queryKey: ["/api/subscription-status"],
    enabled: isAuthenticated && !isLoading,
  });

  const createSubscriptionMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/create-subscription");
      return response.json();
    },
    onSuccess: (data) => {
      setClientSecret(data.clientSecret);
      setShowPaymentForm(true);
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Non autorisé",
          description: "Vous devez être connecté pour vous abonner",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Erreur",
        description: "Impossible de créer l'abonnement",
        variant: "destructive",
      });
    },
  });

  const handleSubscribe = () => {
    createSubscriptionMutation.mutate();
  };

  const handlePaymentSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ["/api/subscription-status"] });
    setShowPaymentForm(false);
    setClientSecret("");
  };

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

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-md mx-auto px-4 py-3">
          <div className="flex items-center justify-center space-x-3">
            <div className="w-8 h-8 gradient-primary rounded-full flex items-center justify-center">
              <Icons.Crown className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-xl font-bold text-gray-800">TrustMatch Premium</h1>
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
                {isSubscribed ? 'Abonnement Premium Actif' : 'Passez à Premium'}
              </h2>
              <p className="text-gray-600 text-sm mb-4">
                {isSubscribed 
                  ? 'Profitez de toutes les fonctionnalités premium' 
                  : 'Débloquez toutes les fonctionnalités de TrustMatch'
                }
              </p>
              {isSubscribed && (
                <Badge className="bg-green-100 text-green-800 border-green-200">
                  Actif
                </Badge>
              )}
            </CardContent>
          </Card>

          {/* Features */}
          <Card>
            <CardHeader>
              <CardTitle>Fonctionnalités Premium</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Icons.Shield className="w-5 h-5 text-blue-500" />
                  <div>
                    <h4 className="font-medium">Profils vérifiés</h4>
                    <p className="text-sm text-gray-600">Accès prioritaire aux profils vérifiés</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Icons.Star className="w-5 h-5 text-yellow-500" />
                  <div>
                    <h4 className="font-medium">Évaluations illimitées</h4>
                    <p className="text-sm text-gray-600">Évaluez sans limite pour aider la communauté</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Icons.MessageCircle className="w-5 h-5 text-pink-500" />
                  <div>
                    <h4 className="font-medium">Messages prioritaires</h4>
                    <p className="text-sm text-gray-600">Vos messages apparaissent en premier</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Subscription */}
          {!isSubscribed && (
            <Card>
              <CardHeader>
                <CardTitle>Souscrire Premium</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-gray-800 mb-2">9,99€</div>
                    <div className="text-gray-600">par mois</div>
                  </div>
                  {!showPaymentForm ? (
                    <Button 
                      onClick={handleSubscribe}
                      className="w-full gradient-primary text-white py-3 rounded-xl font-semibold"
                      disabled={createSubscriptionMutation.isPending}
                    >
                      {createSubscriptionMutation.isPending ? 'Préparation...' : 'Souscrire Premium'}
                    </Button>
                  ) : (
                    <div className="space-y-4">
                      {clientSecret && (
                        <Elements stripe={stripePromise} options={{ clientSecret }}>
                          <SubscriptionForm onSuccess={handlePaymentSuccess} />
                        </Elements>
                      )}
                    </div>
                  )}
                  <p className="text-xs text-gray-500 text-center">
                    Résiliable à tout moment • Paiement sécurisé
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      {/* Bottom Navigation */}
      <Navigation />
    </div>
  );
}