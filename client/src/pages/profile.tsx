
import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth, authenticatedFetch } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { Navigation } from "@/components/Navigation";
import { PhotoUpload } from "@/components/PhotoUpload";
import { ChallengeResponsesList } from "@/components/ChallengeResponsesList";
import { MiniChallengeModal } from "@/components/MiniChallengeModal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { insertProfileSchema } from "@shared/schema";
import { z } from "zod";
import { Icons } from "@/lib/icons";
import { User } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const profileFormSchema = insertProfileSchema.extend({
  age: z.number().min(18).max(100),
});

type ProfileFormData = z.infer<typeof profileFormSchema>;

function PremiumBadge({ isPremium }: { isPremium: boolean }) {
  if (!isPremium) return null;

  return (
    <Badge className="bg-yellow-200 text-yellow-800 border-yellow-300">
      Premium
    </Badge>
  );
}

export default function Profile() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();

  const { toast } = useToast();
  const [showChallengeModal, setShowChallengeModal] = useState(false);

  // Profile query
  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ["/api/profiles/me"],
    queryFn: async () => {
      const response = await authenticatedFetch("/api/profiles/me");
      if (!response.ok) {
        throw new Error("Échec du chargement du profil");
      }
      const data = await response.json();
      console.log("🟢 Profile data fetched:", data);
      return data;
    },
    enabled: isAuthenticated && !isLoading,
  });

  // Ratings query
  const { data: myRatings = [] } = useQuery({
    queryKey: ["/api/my-ratings"],
    queryFn: async () => {
      const response = await authenticatedFetch("/api/my-ratings");
      if (!response.ok) {
        throw new Error('Failed to fetch ratings');
      }
      return response.json();
    },
    enabled: isAuthenticated && !isLoading,
  });

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      userId: user?.id || '',
      age: profile?.age || 25,
      gender: profile?.gender || "male",
      occupation: profile?.occupation || "",
      bio: profile?.bio || "",
      location: profile?.location || "",
    },
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileFormData) => {
      console.log("🟢 Starting mutation with data:", data);

      try {
        const response = await authenticatedFetch('/api/profiles', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log("🟢 API request successful:", result);
        return result;
      } catch (error) {
        console.log("🔴 API request failed:", error);
        throw error;
      }
    },
    onMutate: (data) => {
      console.log("🟡 Mutation starting (onMutate):", data);
    },
    onSuccess: (data) => {
      console.log("🟢 Mutation success (onSuccess):", data);

      toast({
        title: "Succès",
        description: "Profil mis à jour avec succès",
      });

      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/profiles/me"] });
      queryClient.invalidateQueries({ queryKey: ["/api/profile-completion"] });
    },

    
    onError: (error: any, variables) => {
      console.log("🔴 Mutation error (onError):", error, "variables:", variables);

      toast({
        title: "Erreur",
        description: error.message || "Échec de la mise à jour du profil",
        variant: "destructive",
      });
    },
    onSettled: (data, error) => {
      console.log("🟡 Mutation settled (onSettled):", { data, error });
    },
  });

  const handleLogout = async () => {
    try {
      await logout();
      window.location.href = "/";
    } catch (error) {
      // Fallback - just redirect
      window.location.href = "/";
    }
  };

  // Initialize form with profile data
  useEffect(() => {
    if (profile) {
      form.reset({
        userId: user?.id || '',
        age: profile.age || 25,
        gender: profile.gender || "male",
        occupation: profile.occupation || "",
        bio: profile.bio || "",
        location: profile.location || "",
      });
    }
  }, [profile, form, user?.id]);

  const onSubmit = (data: ProfileFormData) => {
    console.log("🟢 Form submitted with data:", data);
    console.log("🟢 Form is valid:", form.formState.isValid);
    console.log("🟢 Form errors:", form.formState.errors);

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
            onClick={() => window.location.href = "/"}
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
                {(profile?.profileImageUrl || user?.profileImageUrl) ? (
                  <img 
                    src={profile?.profileImageUrl || user?.profileImageUrl} 
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
            queryClient.invalidateQueries({ queryKey: ["/api/profiles/me"] });
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
              <form onSubmit={form.handleSubmit((data) => {
                console.log("🟢 handleSubmit called with:", data);
                onSubmit(data);
              }, (errors) => {
                console.log("🔴 Form validation errors:", errors);
              })} className="space-y-4">

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
                            value={field.value || ''}
                            onChange={(e) => {
                              const value = e.target.value;
                              field.onChange(value === '' ? 25 : parseInt(value) || 25);
                            }}
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

        {/* Challenge Responses Section - FIXED */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <Icons.MessageCircle className="w-5 h-5" />
                <span>Mes Défis</span>
                {myRatings && (
                  <Badge variant="outline" className="ml-2">
                    {myRatings.length}
                  </Badge>
                )}
              </CardTitle>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => queryClient.invalidateQueries({ queryKey: ["/api/my-challenge-responses"] })}
                  className="flex items-center space-x-1"
                >
                  <Icons.RefreshCw className="w-4 h-4" />
                </Button>
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
            </div>
          </CardHeader>
          
          <CardContent className="p-0">
            <div className="px-6 pb-6">
              <div className="h-80 overflow-y-auto">
                <ChallengeResponsesList
                  userId={user?.id}
                  maxHeight="100%"
                  onNewChallenge={() => setShowChallengeModal(true)}
                />
              </div>
            </div>
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
        // Invalidate the challenge responses to show the new one
        queryClient.invalidateQueries({ queryKey: ["/api/my-challenge-responses"] });
      }}
    />

    {/* Bottom Navigation */}
    <Navigation />
  </div>
);
}