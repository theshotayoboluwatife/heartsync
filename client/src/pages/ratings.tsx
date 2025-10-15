import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Navigation } from "@/components/Navigation";
import { HonestyMeter } from "@/components/HonestyMeter";
import { HonestyMeterCard } from "@/components/HonestyMeterCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Icons } from "@/lib/icons";
import { formatDate } from "@/lib/dateUtils";

export default function Ratings() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();

  const { data: myRatings = [], isLoading: ratingsLoading } = useQuery({
    queryKey: ["/api/my-ratings"],
    enabled: isAuthenticated && !isLoading,
  });

  const { data: receivedRatings = [], isLoading: receivedLoading } = useQuery({
    queryKey: ["/api/ratings", user?.id],
    enabled: isAuthenticated && !isLoading && !!user?.id,
  });

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Icons.Star
        key={i}
        className={`w-4 h-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  if (isLoading || ratingsLoading || receivedLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading ratings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-md mx-auto px-4 py-3">
          <div className="flex items-center justify-center space-x-3">
            <div className="w-8 h-8 gradient-primary rounded-full flex items-center justify-center">
              <Icons.Star className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-xl font-bold text-gray-800">Évaluations</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-md mx-auto bg-white min-h-screen">
        <div className="p-4 space-y-6">
          {/* Overall Honesty Score */}
          <div className="mb-6">
            <HonestyMeterCard 
              rating={receivedRatings.length > 0 
                ? receivedRatings.reduce((sum, r) => sum + parseFloat(r.score), 0) / receivedRatings.length
                : 0
              }
              ratingCount={receivedRatings.length}
              recentRatings={receivedRatings.slice(0, 10)}
              showTrend={true}
              compact={false}
            />
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            <Card>
              <CardContent className="p-3 text-center">
                <div className="flex items-center justify-center mb-2">
                  <Icons.Trophy className="w-5 h-5 text-yellow-500" />
                </div>
                <div className="text-lg font-bold text-pink-600">
                  {user?.profile?.gender === 'female' ? myRatings.length : receivedRatings.length}
                </div>
                <div className="text-xs text-gray-600">
                  {user?.profile?.gender === 'female' ? 'Données' : 'Reçues'}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-3 text-center">
                <div className="flex items-center justify-center mb-2">
                  <Icons.Target className="w-5 h-5 text-blue-500" />
                </div>
                <div className="text-lg font-bold text-blue-600">
                  {receivedRatings.length > 0 
                    ? (receivedRatings.reduce((sum, r) => sum + parseFloat(r.score), 0) / receivedRatings.length).toFixed(1)
                    : '0.0'
                  }
                </div>
                <div className="text-xs text-gray-600">Moyenne</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-3 text-center">
                <div className="flex items-center justify-center mb-2">
                  <Icons.Star className="w-5 h-5 text-green-500" />
                </div>
                <div className="text-lg font-bold text-green-600">
                  {receivedRatings.filter(r => parseFloat(r.score) >= 4).length}
                </div>
                <div className="text-xs text-gray-600">4+ étoiles</div>
              </CardContent>
            </Card>
          </div>

          {/* Given Ratings (for women) */}
          {user?.profile?.gender === 'female' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Icons.Star className="w-5 h-5 text-pink-600" />
                  <span>Évaluations Données</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {myRatings.length > 0 ? (
                  <div className="space-y-3">
                    {myRatings.map((rating: any) => (
                      <div key={rating.id} className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <div className="flex">
                              {renderStars(Math.floor(parseFloat(rating.score)))}
                            </div>
                            <span className="text-sm font-medium">{rating.score}/5</span>
                          </div>
                          <div className="flex items-center space-x-1 text-xs text-gray-500">
                            <Icons.Calendar className="w-3 h-3" />
                            <span>{formatDate(new Date(rating.createdAt), 'dd/MM/yyyy')}</span>
                          </div>
                        </div>
                        {rating.comment && (
                          <p className="text-sm text-gray-700">{rating.comment}</p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Icons.Star className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>Aucune évaluation donnée</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Received Ratings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Icons.User className="w-5 h-5 text-blue-600" />
                <span>Évaluations Reçues</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {receivedRatings.length > 0 ? (
                <div className="space-y-3">
                  {receivedRatings.map((rating: any) => (
                    <div key={rating.id} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <div className="flex">
                            {renderStars(Math.floor(parseFloat(rating.score)))}
                          </div>
                          <span className="text-sm font-medium">{rating.score}/5</span>
                        </div>
                        <div className="flex items-center space-x-1 text-xs text-gray-500">
                          <Icons.Calendar className="w-3 h-3" />
                          <span>{formatDate(new Date(rating.createdAt), 'dd/MM/yyyy')}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 mb-2">
                        <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center">
                          <Icons.User className="w-3 h-3 text-gray-400" />
                        </div>
                        <span className="text-sm text-gray-600">
                          {rating.rater.firstName || 'Anonyme'}
                        </span>
                      </div>
                      {rating.comment && (
                        <p className="text-sm text-gray-700">{rating.comment}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Icons.Star className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>Aucune évaluation reçue</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Bottom Navigation */}
      <Navigation />
    </div>
  );
}
