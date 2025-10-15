import { useQuery } from "@tanstack/react-query";
import { useAuth, authenticatedFetch } from "@/hooks/useAuth";
import { AchievementBadge } from "@/components/AchievementBadge";
import { ProfileCompletionCard } from "@/components/ProfileCompletionCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Header } from "@/components/layout/header";
import { Navigation } from "@/components/Navigation";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Icons } from "@/lib/icons";
import { cn } from "@/lib/utils";
import type { Achievement, UserAchievement } from "@shared/schema";

interface AchievementWithUserData extends Achievement {
  userAchievement?: UserAchievement;
}

export default function AchievementsPage() {
    const { isAuthenticated, isLoading: authLoading } = useAuth();

  const { data: achievements, isLoading: achievementsLoading } = useQuery<Achievement[]>({
    queryKey: ["/api/achievements"],
    queryFn: async () => {
      const response = await authenticatedFetch("/api/achievements");
      if (!response.ok) {
        throw new Error('Failed to fetch achievements');
      }
      return response.json();
    },
    enabled: isAuthenticated && !authLoading,
  });

  const { data: userAchievements, isLoading: userAchievementsLoading } = useQuery<(UserAchievement & { achievement: Achievement })[]>({
    queryKey: ["/api/my-achievements"],
    queryFn: async () => {
      const response = await authenticatedFetch("/api/my-achievements");
      if (!response.ok) {
        throw new Error('Failed to fetch user achievements');
      }
      return response.json();
    },
    enabled: isAuthenticated && !authLoading,
  });

  const isLoading = achievementsLoading || userAchievementsLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!achievements || !userAchievements) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 flex items-center justify-center">
        <div className="text-center">
          <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-700 mb-2">
            Aucun succès trouvé
          </h2>
          <p className="text-gray-500">
            Les succès se chargeront bientôt...
          </p>
        </div>
      </div>
    );
  }

  // Create a map of user achievements by achievement id
  const userAchievementMap = new Map();
  userAchievements.forEach(ua => {
    userAchievementMap.set(ua.achievementId, ua);
  });

  // Combine achievements with user data
  const achievementsWithUserData: AchievementWithUserData[] = achievements.map(achievement => ({
    ...achievement,
    userAchievement: userAchievementMap.get(achievement.id)
  }));

  // Calculate statistics
  const totalAchievements = achievements.length;
  const completedAchievements = userAchievements.filter(ua => ua.isCompleted).length;
  const totalPoints = userAchievements
    .filter(ua => ua.isCompleted)
    .reduce((sum, ua) => sum + ua.achievement.points, 0);
  const completionPercentage = Math.round((completedAchievements / totalAchievements) * 100);

  // Group achievements by category
  const achievementsByCategory = achievementsWithUserData.reduce((acc, achievement) => {
    const category = achievement.category || 'other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(achievement);
    return acc;
  }, {} as Record<string, AchievementWithUserData[]>);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'profile':
        return <Icons.Target className="w-5 h-5" />;
      case 'social':
        return <Icons.Users className="w-5 h-5" />;
      case 'community':
        return <Icons.Star className="w-5 h-5" />;
      case 'special':
        return <Icons.Crown className="w-5 h-5" />;
      case 'reputation':
        return <Icons.Shield className="w-5 h-5" />;
      default:
        return <Icons.Award className="w-5 h-5" />;
    }
  };

  const getCategoryTitle = (category: string) => {
    switch (category) {
      case 'profile':
        return 'Profil';
      case 'social':
        return 'Social';
      case 'community':
        return 'Communauté';
      case 'special':
        return 'Spécial';
      case 'reputation':
        return 'Réputation';
      default:
        return 'Autre';
    }
  };

  return (
      <div className="min-h-screen bg-gray-50 p-4 pb-28">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <Header/>
        <div className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Icons.Trophy className="w-8 h-8 text-yellow-500" />
            <h1 className="text-3xl font-bold text-gray-900">
              Mes Succès
            </h1>
            <Icons.Sparkles className="w-8 h-8 text-pink-500" />
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Débloquez des succès en complétant votre profil, en participant à la communauté et en utilisant Heartsync.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-yellow-50 to-amber-50 border-yellow-200">
            <CardContent className="p-6 text-center">
              <Icons.Trophy className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-yellow-700">
                {completedAchievements}
              </div>
              <div className="text-sm text-yellow-600">
                Succès débloqués
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
            <CardContent className="p-6 text-center">
              <Icons.Target className="w-8 h-8 text-blue-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-blue-700">
                {totalAchievements}
              </div>
              <div className="text-sm text-blue-600">
                Succès disponibles
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
            <CardContent className="p-6 text-center">
              <Icons.Star className="w-8 h-8 text-purple-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-purple-700">
                {totalPoints}
              </div>
              <div className="text-sm text-purple-600">
                Points gagnés
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
            <CardContent className="p-6 text-center">
              <Icons.TrendingUp className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-green-700">
                {completionPercentage}%
              </div>
              <div className="text-sm text-green-600">
                Progression
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Profile Completion Card */}
        <ProfileCompletionCard />

        {/* Achievements Tabs */}
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-3 md:grid-cols-6 gap-1 h-auto p-1">
              <TabsTrigger value="all" className="text-xs md:text-sm px-2 py-2 md:py-2.5">Tous</TabsTrigger>
              <TabsTrigger value="profile" className="text-xs md:text-sm px-2 py-2 md:py-2.5">Profil</TabsTrigger>
              <TabsTrigger value="social" className="text-xs md:text-sm px-2 py-2 md:py-2.5">Social</TabsTrigger>
              <TabsTrigger value="community" className="text-xs md:text-sm px-2 py-2 md:py-2.5">Communauté</TabsTrigger>
              <TabsTrigger value="special" className="text-xs md:text-sm px-2 py-2 md:py-2.5">Spécial</TabsTrigger>
              <TabsTrigger value="reputation" className="text-xs md:text-sm px-2 py-2 md:py-2.5">Réputation</TabsTrigger>
            </TabsList>

          <TabsContent value="all" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {achievementsWithUserData
                .sort((a, b) => {
                  // Sort completed achievements first, then by points
                  const aCompleted = a.userAchievement?.isCompleted || false;
                  const bCompleted = b.userAchievement?.isCompleted || false;
                  if (aCompleted && !bCompleted) return -1;
                  if (!aCompleted && bCompleted) return 1;
                  return b.points - a.points;
                })
                .map(achievement => (
                  <AchievementBadge
                    key={achievement.id}
                    achievement={achievement}
                    userAchievement={achievement.userAchievement}
                    size="md"
                    showProgress={true}
                    animate={achievement.userAchievement?.isCompleted}
                  />
                ))}
            </div>
          </TabsContent>

          {Object.entries(achievementsByCategory).map(([category, categoryAchievements]) => (
            <TabsContent key={category} value={category} className="space-y-6">
              <div className="flex items-center space-x-2 mb-4">
                {getCategoryIcon(category)}
                <h2 className="text-xl font-semibold text-gray-900">
                  {getCategoryTitle(category)}
                </h2>
                <Badge variant="outline">
                  {categoryAchievements.filter(a => a.userAchievement?.isCompleted).length}/{categoryAchievements.length}
                </Badge>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {categoryAchievements
                  .sort((a, b) => {
                    // Sort completed achievements first, then by points
                    const aCompleted = a.userAchievement?.isCompleted || false;
                    const bCompleted = b.userAchievement?.isCompleted || false;
                    if (aCompleted && !bCompleted) return -1;
                    if (!aCompleted && bCompleted) return 1;
                    return b.points - a.points;
                  })
                  .map(achievement => (
                    <AchievementBadge
                      key={achievement.id}
                      achievement={achievement}
                      userAchievement={achievement.userAchievement}
                      size="md"
                      showProgress={true}
                      animate={achievement.userAchievement?.isCompleted}
                    />
                  ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>

        {/* Bottom Navigation */}
        <Navigation />
        
      </div>
    </div>
  );
}