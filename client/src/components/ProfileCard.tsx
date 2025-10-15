import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { authenticatedFetch } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Icons } from "@/lib/icons";
import { formatDate } from "@/lib/dateUtils";
import { HonestyMeter } from "./HonestyMeter";
import type { ProfileWithUser } from "@shared/schema";
// Remove this line: import { Shield } from "lucide-react";

interface ProfileCardProps {
  profile: ProfileWithUser;
  onRate: () => void;
  canRate: boolean;
}

export function ProfileCard({ profile, onRate, canRate }: ProfileCardProps) {
  const { toast } = useToast();
  //const [imageError, setImageError] = useState(false);
  console.log('this is user: ', profile);

  const swipeMutation = useMutation({
    mutationFn: async ({ liked }: { liked: boolean }) => {
      const response = await authenticatedFetch('/api/swipes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          swipedUserId: profile.userId,
          liked,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to swipe');
      }

      return response.json();
    },
    onSuccess: (data: any) => {
      if (data.matched) {
        toast({
          title: "It's a match!",
          description: "You both liked each other!",
        });
      }
      queryClient.invalidateQueries({ queryKey: ["/api/discover"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to swipe",
        variant: "destructive",
      });
    },
  });

  const handleSwipe = (liked: boolean) => {
    swipeMutation.mutate({ liked });
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Icons.Star
        key={i}
        className={`w-4 h-4 ${i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  const profileImageUrl = profile.profileImageUrl || `https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600`;

  return (
    <Card className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
      {/* Profile Image */}
      <div className="relative">
        <img 
          src={profileImageUrl}
          alt={`Profile de ${profile.user.firstName}`}
          className="w-full h-80 object-cover"
          //onError={() => setImageError(true)}
        />

        {/* Honesty Meter */}
        <div className="absolute top-4 right-4">
          <HonestyMeter 
            rating={profile.averageRating || 0}
            ratingCount={profile.ratingCount || 0}
            size="sm"
            animated={true}
            showLabel={false}
          />
        </div>

        {/* Online Status */}
        <div className="absolute bottom-4 left-4 flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${profile.isOnline ? 'bg-green-500' : 'bg-gray-400'}`}></div>
          <span className="text-white text-sm font-medium bg-black bg-opacity-50 rounded-full px-2 py-1">
            {profile.isOnline ? 'En ligne' : 'Il y a 2h'}
          </span>
        </div>
      </div>

      {/* Profile Info */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-xl font-bold text-gray-800">
              {profile.user.firstName || 'Utilisateur'}
            </h3>
            <div className="flex items-center space-x-2 text-gray-600 text-sm">
              <span>{profile.age} ans</span>
              {profile.occupation && (
                <>
                  <span>•</span>
                  <div className="flex items-center space-x-1">
                    <Icons.Briefcase className="w-3 h-3" />
                    <span>{profile.occupation}</span>
                  </div>
                </>
              )}
              {profile.location && (
                <>
                  <span>•</span>
                  <div className="flex items-center space-x-1">
                    <Icons.MapPin className="w-3 h-3" />
                    <span>{profile.location}</span>
                  </div>
                </>
              )}
            </div>
          </div>
          <div className="flex justify-end">
            <HonestyMeter 
              rating={profile.averageRating || 0}
              ratingCount={profile.ratingCount || 0}
              size="md"
              animated={true}
              showLabel={false}
            />
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="flex items-center space-x-4 mb-4">
          <div className="flex items-center space-x-1">
            <Icons.Shield className="w-4 h-4 text-green-500" />            <span className="text-xs text-gray-600">Profil vérifié</span>
          </div>
          {profile.isOnline && (
            <div className="flex items-center space-x-1">
              <Icons.Clock className="w-4 h-4 text-blue-500" />
              <span className="text-xs text-gray-600">Réponse rapide</span>
            </div>
          )}
          {(profile.averageRating || 0) >= 4.5 && (
            <div className="flex items-center space-x-1">
              <Icons.Star className="w-4 h-4 text-yellow-500" />
              <span className="text-xs text-gray-600">Top évalué</span>
            </div>
          )}
        </div>

        {/* Bio */}
        {profile.bio && (
          <div className="mb-4">
            <p className="text-sm text-gray-700 line-clamp-3">{profile.bio}</p>
          </div>
        )}

        {/* Recent Reviews Preview */}
        {profile.recentRatings && profile.recentRatings.length > 0 && (
          <div className="mb-4">
            <p className="text-xs text-gray-500 mb-2">Derniers avis:</p>
            <div className="space-y-2">
              {profile.recentRatings.slice(0, 2).map((rating, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-2">
                  <div className="flex items-center space-x-2 mb-1">
                    <div className="flex">
                      {renderStars(parseFloat(rating.score))}
                    </div>
                    <span className="text-xs text-gray-500">
                      {rating.rater.firstName || 'Anonyme'}, {formatDate(new Date(rating.createdAt), 'dd/MM/yyyy')}
                    </span>
                  </div>
                  {rating.comment && (
                    <p className="text-xs text-gray-700 line-clamp-2">{rating.comment}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-3">
          <Button 
            variant="outline"
            className="flex-1 py-3 rounded-xl font-medium hover:bg-gray-50"
            onClick={() => handleSwipe(false)}
            disabled={swipeMutation.isPending}
          >
            <Icons.X className="w-4 h-4 mr-2" />
            Passer
          </Button>
          <Button 
            className="flex-1 gradient-primary text-white py-3 rounded-xl font-medium hover:opacity-90"
            onClick={() => handleSwipe(true)}
            disabled={swipeMutation.isPending}
          >
            <Icons.Heart className="w-4 h-4 mr-2" />
            Intéressée
          </Button>
        </div>

        {/* Rating Button for Women */}
        {canRate && (
          <Button 
            variant="outline" 
            className="w-full mt-3 py-3 rounded-xl font-medium border-blue-200 text-blue-600 hover:bg-blue-50"
            onClick={onRate}
          >
            <Icons.Star className="w-4 h-4 mr-2" />
            Évaluer l'honnêteté
          </Button>
        )}
      </div>
    </Card>
  );
}