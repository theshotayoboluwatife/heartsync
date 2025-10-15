import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth, authenticatedFetch } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { ProfileCard } from "@/components/ProfileCard";
import { Navigation } from "@/components/Navigation";
import { RatingModal } from "@/components/RatingModal";
import { Header } from "@/components/layout/header";
import { MiniChallengeModal } from "@/components/MiniChallengeModal";
import { ProfileCompletionCard } from "@/components/ProfileCompletionCard";
import { Icons } from "@/lib/icons";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { ProfileWithUser } from "@shared/schema";

export default function Home() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [selectedProfile, setSelectedProfile] =
    useState<ProfileWithUser | null>(null);
  const [showChallengeModal, setShowChallengeModal] = useState(false);

  // Debug logging
  console.log("Home component state:", {
    isAuthenticated,
    isLoading,
    hasUser: !!user,
    userEmail: user?.email,
  });

  // Queries with proper authentication
  const {
    data: profiles = [],
    isLoading: profilesLoading,
    error: profilesError,
    refetch,
  } = useQuery({
    queryKey: ["/api/discover"],
    queryFn: async () => {
      console.log("Fetching profiles...");
      const response = await authenticatedFetch("/api/discover");
      if (!response.ok) {
        throw new Error(`Failed to fetch profiles: ${response.status}`);
      }
      const data = await response.json();
      console.log("Profiles fetched:", data.length);
      return data;
    },
    enabled: isAuthenticated && !isLoading,
    retry: 1,
  });

  const { data: myRatings = [] } = useQuery({
    queryKey: ["/api/my-ratings"],
    queryFn: async () => {
      const response = await authenticatedFetch("/api/my-ratings");
      if (!response.ok) {
        throw new Error("Failed to fetch ratings");
      }
      return response.json();
    },
    enabled: isAuthenticated && !isLoading,
    retry: 1,
  });

  const { data: subscriptionStatus } = useQuery({
    queryKey: ["/api/subscription-status"],
    queryFn: async () => {
      const response = await authenticatedFetch("/api/subscription-status");
      if (!response.ok) {
        throw new Error("Failed to fetch subscription");
      }
      return response.json();
    },
    enabled: isAuthenticated && !isLoading,
    retry: 1,
  });

  const handleRate = (profile: ProfileWithUser) => {
    if (!user?.profile || user.profile.gender !== "female") {
      toast({
        title: "Access Denied",
        description: "Only women can rate profiles",
        variant: "destructive",
      });
      return;
    }
    setSelectedProfile(profile);
    setShowRatingModal(true);
  };

  const handleRatingSubmitted = () => {
    setShowRatingModal(false);
    setSelectedProfile(null);
    refetch();
  };

  // Loading state - only show if profiles are loading (not auth loading)

  // Error state
  if (profilesError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error: {profilesError.message}</p>
          <Button onClick={() => refetch()}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-28">
      {/* Header */}
      <Header />
      {/* Main Content */}
      <main className="max-w-md mx-auto bg-white min-h-screen">
        <div className="p-4">
          {/* Welcome Section */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">
                  Bonjour,{" "}
                  {user?.user_metadata?.first_name ||
                    user?.email?.split("@")[0] ||
                    "User"}
                  !
                </h2>
                <p className="text-gray-600 text-sm">
                  {user?.profile?.gender === "female"
                    ? "Découvrez des profils honnêtes"
                    : "Votre profil est visible"}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowChallengeModal(true)}
                  className="flex items-center space-x-2"
                >
                  <Icons.Sparkles className="w-4 h-4" />
                  <span>Mini-Défi</span>
                </Button>
                <div className="text-right">
                  <p className="text-sm text-gray-500">
                    {user?.profile?.gender === "female"
                      ? "Évaluations données"
                      : "Score moyen"}
                  </p>
                  <p className="text-2xl font-bold text-pink-500">
                    {user?.profile?.gender === "female"
                      ? myRatings.length
                      : "4.2"}
                  </p>
                </div>
              </div>
            </div>

            {/* Trust Score Info */}
            <div className="gradient-trust rounded-xl p-4 text-white mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">
                    {user?.profile?.gender === "female"
                      ? "Votre contribution"
                      : "Votre statut"}
                  </p>
                  <p className="text-xl font-bold">
                    {user?.profile?.gender === "female"
                      ? "Experte en Évaluation"
                      : "Profil Vérifié"}
                  </p>
                </div>
                <div className="text-right">
                  <div className="flex items-center space-x-1">
                    <Icons.Star className="w-4 h-4 text-yellow-400" />
                    <span className="text-lg font-bold">4.8</span>
                  </div>
                  <p className="text-xs opacity-80">
                    {user?.profile?.gender === "female"
                      ? "Fiabilité"
                      : "Évaluations"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Completion Card */}
          <div className="mb-6">
            <ProfileCompletionCard
              compact={true}
              onImprove={() => (window.location.href = "/profile")}
            />
          </div>

          {profilesLoading ? (
            <div className="min-h-[50vh] flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading profiles...</p>
              </div>
            </div>
          ) : profiles.length > 0 ? (
            <div className="space-y-4">
              {profiles.map((profile) => (
                <ProfileCard
                  key={profile.id}
                  profile={profile}
                  onRate={() => handleRate(profile)}
                  canRate={user?.profile?.gender === "female"}
                />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-gray-600">No more profiles to show</p>
                {/* <Button
                  onClick={() => refetch()}
                  className="mt-4 gradient-primary text-white"
                >
                  Refresh
                </Button> */}
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      {/* Rating Modal */}
      <RatingModal
        isOpen={showRatingModal}
        onClose={() => setShowRatingModal(false)}
        profile={selectedProfile}
        onRatingSubmitted={handleRatingSubmitted}
      />

      {/* Mini Challenge Modal */}
      <MiniChallengeModal
        isOpen={showChallengeModal}
        onClose={() => setShowChallengeModal(false)}
        onChallengeComplete={() => {
          toast({
            title: "Défi terminé !",
            description: "Votre réponse aidera à démarrer des conversations",
          });
        }}
      />

      {/* Bottom Navigation */}
      <Navigation />
    </div>
  );
}
