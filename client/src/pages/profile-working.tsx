import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Star, Camera, Edit3, MapPin, Briefcase, Heart, LogOut } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

export default function ProfileWorking() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();

  const { data: profileCompletion } = useQuery({
    queryKey: ["/api/profile-completion"],
    enabled: isAuthenticated,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement du profil...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="mb-4">
            <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-700">Non connecté</h2>
            <p className="text-gray-500 mt-2">Veuillez vous connecter pour accéder à votre profil</p>
          </div>
          <Button 
            onClick={() => window.location.href = "/api/login"}
            className="gradient-primary text-white"
          >
            Se connecter
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-md mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 gradient-primary rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-800">Mon Profil</h1>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.location.href = "/api/logout"}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-md mx-auto">
        <div className="p-4 space-y-6">
          {/* Profile Header */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center space-x-4 mb-4">
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center">
                  {user?.profileImageUrl ? (
                    <img 
                      src={user.profileImageUrl} 
                      alt="Profile" 
                      className="w-20 h-20 rounded-full object-cover"
                    />
                  ) : (
                    <User className="w-10 h-10 text-white" />
                  )}
                </div>
                <button className="absolute -bottom-1 -right-1 w-6 h-6 bg-white rounded-full shadow-md flex items-center justify-center">
                  <Camera className="w-3 h-3 text-gray-600" />
                </button>
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-gray-800">
                  {user?.firstName || "Utilisateur"}
                </h2>
                <p className="text-gray-600 text-sm">{user?.email}</p>
                <div className="flex items-center space-x-2 mt-2">
                  <Star className="w-4 h-4 text-yellow-500" />
                  <span className="text-sm font-medium">4.8</span>
                  <span className="text-xs text-gray-500">• 12 évaluations</span>
                </div>
              </div>
            </div>

            {/* Profile Stats */}
            <div className="grid grid-cols-3 gap-4 mt-4">
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-lg font-bold text-gray-800">50%</div>
                <div className="text-xs text-gray-600">Profil complet</div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-lg font-bold text-gray-800">12</div>
                <div className="text-xs text-gray-600">Évaluations</div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-lg font-bold text-gray-800">3</div>
                <div className="text-xs text-gray-600">Matches</div>
              </div>
            </div>
          </div>

          {/* Profile Completion */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Edit3 className="w-5 h-5" />
                <span>Complétude du profil</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Progression</span>
                  <span className="text-sm text-blue-600">
                    {profileCompletion?.percent || 50}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${profileCompletion?.percent || 50}%` }}
                  ></div>
                </div>
                <div className="text-sm text-gray-600">
                  Complétez votre profil pour augmenter vos chances de match
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Profile Info */}
          <Card>
            <CardHeader>
              <CardTitle>Informations personnelles</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center space-x-3">
                <MapPin className="w-4 h-4 text-gray-500" />
                <span className="text-sm">Paris, France</span>
              </div>
              <div className="flex items-center space-x-3">
                <Briefcase className="w-4 h-4 text-gray-500" />
                <span className="text-sm">Développeur</span>
              </div>
              <div className="flex items-center space-x-3">
                <Heart className="w-4 h-4 text-gray-500" />
                <span className="text-sm">Recherche une relation sérieuse</span>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => toast({
                  title: "Bientôt disponible",
                  description: "Cette fonctionnalité sera disponible prochainement",
                })}
              >
                <Edit3 className="w-4 h-4 mr-2" />
                Modifier le profil
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => toast({
                  title: "Bientôt disponible", 
                  description: "Cette fonctionnalité sera disponible prochainement",
                })}
              >
                <Camera className="w-4 h-4 mr-2" />
                Ajouter des photos
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => toast({
                  title: "Bientôt disponible",
                  description: "Cette fonctionnalité sera disponible prochainement", 
                })}
              >
                <Star className="w-4 h-4 mr-2" />
                Mes évaluations
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Navigation */}
      <Navigation />
    </div>
  );
}