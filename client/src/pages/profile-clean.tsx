import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Navigation } from "@/components/Navigation";
import { PhotoUpload } from "@/components/PhotoUpload";
import { MiniChallengeModal } from "@/components/MiniChallengeModal";
import { ChallengeResponsesList } from "@/components/ChallengeResponsesList";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Icons } from "@/lib/icons";
import { User } from "lucide-react";
import { insertProfileSchema } from "@shared/schema";
import type { Profile } from "@shared/schema";

function PremiumBadge({ isPremium }: { isPremium: boolean }) {
  if (!isPremium) return null;
  return (
    <Badge className="bg-yellow-200 text-yellow-800 border-yellow-300">
      Premium
    </Badge>
  );
}

export default function ProfileClean() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const [showChallengeModal, setShowChallengeModal] = useState(false);

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ["/api/profiles/me"],
    enabled: isAuthenticated && !isLoading,
  });

  const { data: myRatings = [] } = useQuery({
    queryKey: ["/api/my-ratings"],
    enabled: isAuthenticated && !isLoading,
  });

  const form = useForm({
    resolver: zodResolver(insertProfileSchema),
    defaultValues: {
      age: 25,
      gender: "male",
      occupation: "",
      location: "",
      bio: "",
    },
  });

  useEffect(() => {
    if (profile) {
      form.reset({
        age: profile.age || 25,
        gender: profile.gender || "male",
        occupation: profile.occupation || "",
        location: profile.location || "",
        bio: profile.bio || "",
      });
    }
  }, [profile, form]);

  const updateProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("PUT", "/api/profiles/me", data);
    },
    onSuccess: () => {
      toast({
        title: "Profil mis à jour",
        description: "Vos informations ont été sauvegardées avec succès",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/profiles/me"] });
      queryClient.invalidateQueries({ queryKey: ["/api/profile-completion"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Non autorisé",
          description: "Vous devez être connecté pour modifier votre profil",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le profil",
        variant: "destructive",
      });
    },
  });

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  const onSubmit = (data: any) => {
    updateProfileMutation.mutate(data);
  };

  if (isLoading || profileLoading) {
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
              onClick={handleLogout}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Icons.LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-md mx-auto bg-white">
        <div className="p-4 space-y-6">
          {/* User Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="w-5 h-5" />
                <span>Information Utilisateur</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                  {user?.profileImageUrl ? (
                    <img 
                      src={user.profileImageUrl} 
                      alt="Profile" 
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  ) : (
                    <User className="w-8 h-8 text-gray-400" />
                  )}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="font-semibold text-gray-800">
                      {user?.firstName} {user?.lastName}
                    </h3>
                    <PremiumBadge isPremium={user?.isPremium || false} />
                  </div>
                  <p className="text-sm text-gray-600">{user?.email}</p>
                </div>
              </div>

              {profile?.gender === 'female' && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-pink-50 rounded-lg">
                    <p className="text-2xl font-bold text-pink-600">{myRatings.length}</p>
                    <p className="text-sm text-gray-600">Évaluations données</p>
                  </div>
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <p className="text-2xl font-bold text-blue-600">4.8</p>
                    <p className="text-sm text-gray-600">Fiabilité</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Photo Upload Section */}
          <PhotoUpload 
            userId={user?.id || ''}
            onPhotoUploaded={() => {
              queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
            }}
          />

          {/* Profile Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Icons.Settings className="w-5 h-5" />
                <span>Profil Dating</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="age"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Âge</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="gender"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Genre</FormLabel>
                          <Select value={field.value} onValueChange={field.onChange}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select gender" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="male">Homme</SelectItem>
                              <SelectItem value="female">Femme</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="occupation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Profession</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Ex: Ingénieur, Architecte..." />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Localisation</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Ex: Paris, Lyon..." />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="bio"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bio</FormLabel>
                        <FormControl>
                          <Textarea 
                            {...field}
                            placeholder="Parlez-nous de vous..."
                            className="min-h-[100px]"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button 
                    type="submit" 
                    className="w-full gradient-primary text-white"
                    disabled={updateProfileMutation.isPending}
                  >
                    {updateProfileMutation.isPending ? 'Mise à jour...' : 'Mettre à jour le profil'}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* Challenge Responses Section */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <Icons.MessageCircle className="w-5 h-5" />
                  <span>Mes Défis</span>
                </CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowChallengeModal(true)}
                  className="flex items-center space-x-2"
                >
                  <Icons.Sparkles className="w-4 h-4" />
                  <span>Nouveau</span>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <ChallengeResponsesList
                userId={user?.id}
                maxHeight="300px"
                onNewChallenge={() => setShowChallengeModal(true)}
              />
            </CardContent>
          </Card>

          {/* Action Buttons */}
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
                <Icons.Edit className="w-4 h-4 mr-2" />
                Modifier le profil avancé
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => toast({
                  title: "Bientôt disponible",
                  description: "Cette fonctionnalité sera disponible prochainement",
                })}
              >
                <Icons.Camera className="w-4 h-4 mr-2" />
                Gérer mes photos
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => toast({
                  title: "Bientôt disponible",
                  description: "Cette fonctionnalité sera disponible prochainement",
                })}
              >
                <Icons.Star className="w-4 h-4 mr-2" />
                Voir mes évaluations
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
      
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