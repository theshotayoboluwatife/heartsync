import { useEffect } from "react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Navigation } from "@/components/Navigation";
import { Icons } from "@/lib/icons";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export default function PremiumSuccess() {
  const { toast } = useToast();
  const [, navigate] = useLocation();

  // Get session ID from URL
  const sessionId = new URLSearchParams(window.location.search).get('session_id');
  const paymentSuccess = new URLSearchParams(window.location.search).get('payment_success');

  const activatePremiumMutation = useMutation({
    mutationFn: async () => {
      if (sessionId) {
        await apiRequest('POST', '/api/activate-premium', { sessionId });
      }
    },
    onSuccess: () => {
      // Refresh user data to reflect Premium
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/subscription-status"] });
    },
  });

  useEffect(() => {
    if (paymentSuccess && sessionId) {
      // Activate premium subscription
      activatePremiumMutation.mutate();
      
      toast({
        title: "Abonnement confirmé !",
        description: "Vous êtes maintenant membre Premium.",
      });
    }
  }, [toast, sessionId, paymentSuccess]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center text-center px-6">
      <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
        <Icons.Check className="w-8 h-8" />
      </div>
      <h1 className="text-2xl font-bold text-gray-800 mb-2">Bienvenue parmi les Premium</h1>
      <p className="text-gray-600 mb-6">
        Vous avez maintenant accès à toutes les fonctionnalités exclusives.
      </p>
      <Button onClick={() => navigate("/profile")} className="gradient-primary text-white">
        Voir mon profil
      </Button>

      <Navigation />
    </div>
  );
}