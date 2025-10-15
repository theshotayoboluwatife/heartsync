import { useQuery } from "@tanstack/react-query";
import { useAuth, authenticatedFetch } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  User, 
  CheckCircle, 
  AlertCircle, 
  TrendingUp, 
  Target,
  Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ProfileCompletionCardProps {
  onImprove?: () => void;
  compact?: boolean;
}

export function ProfileCompletionCard({ onImprove, compact = false }: ProfileCompletionCardProps) {
  // Add the missing useAuth hook
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const { data: completion, isLoading } = useQuery({
    queryKey: ["/api/profile-completion"],
    queryFn: async () => {
      const response = await authenticatedFetch("/api/profile-completion");
      if (!response.ok) {
        throw new Error('Failed to fetch profile completion');
      }
      return response.json();
    },
    enabled: isAuthenticated && !authLoading,
  });

  if (isLoading || authLoading) {
    return (
      <Card className="animate-pulse">
        <CardContent className="p-6">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-8 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </CardContent>
      </Card>
    );
  }

  if (!completion) return null;

  const { percentage, score, maxScore } = completion;
  const isComplete = percentage >= 100;
  const isNearComplete = percentage >= 80;

  const getStatusColor = () => {
    if (isComplete) return "text-green-600";
    if (isNearComplete) return "text-yellow-600";
    return "text-red-600";
  };

  const getStatusIcon = () => {
    if (isComplete) return <CheckCircle className="w-5 h-5 text-green-600" />;
    if (isNearComplete) return <AlertCircle className="w-5 h-5 text-yellow-600" />;
    return <Target className="w-5 h-5 text-red-600" />;
  };

  const getStatusMessage = () => {
    if (isComplete) return "Profil terminé !";
    if (isNearComplete) return "Presque terminé";
    return "Profil incomplet";
  };

  const getMotivationalMessage = () => {
    if (isComplete) return "Votre profil est parfait ! Vous attirez plus de matches.";
    if (percentage >= 60) return "Encore quelques détails et votre profil sera parfait !";
    if (percentage >= 40) return "Vous êtes sur la bonne voie, continuez !";
    return "Complétez votre profil pour obtenir plus de matches !";
  };

  const getProgressColor = () => {
    if (isComplete) return "from-green-500 to-emerald-500";
    if (isNearComplete) return "from-yellow-500 to-orange-500";
    return "from-red-500 to-pink-500";
  };

  if (compact) {
    return (
      <Card className="border-l-4 border-l-pink-500">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {getStatusIcon()}
              <div>
                <h3 className="font-semibold text-sm">{getStatusMessage()}</h3>
                <p className="text-xs text-gray-600">{percentage}% terminé</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-pink-600">{percentage}%</div>
              <Badge variant="outline" className="text-xs">
                {score}/{maxScore}
              </Badge>
            </div>
          </div>
          <Progress 
            value={percentage} 
            className="mt-3 h-2"
            style={{
              background: `linear-gradient(to right, ${getProgressColor()})`
            }}
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn(
      "relative overflow-hidden",
      isComplete && "border-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50"
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <User className="w-5 h-5 text-pink-600" />
            <span>Complétude du Profil</span>
          </CardTitle>
          {isComplete && (
            <div className="flex items-center space-x-1 text-green-600">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-medium">Parfait !</span>
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Status */}
        <div className="flex items-center space-x-3">
          {getStatusIcon()}
          <div>
            <h3 className={cn("font-semibold", getStatusColor())}>
              {getStatusMessage()}
            </h3>
            <p className="text-sm text-gray-600">{getMotivationalMessage()}</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700">
              Progrès: {score}/{maxScore} points
            </span>
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-green-500" />
              <span className="text-2xl font-bold text-pink-600">
                {percentage}%
              </span>
            </div>
          </div>
          
          <div className="relative">
            <Progress 
              value={percentage} 
              className="h-3"
            />
            <div 
              className={cn(
                "absolute top-0 left-0 h-3 rounded-full bg-gradient-to-r transition-all duration-500",
                getProgressColor()
              )}
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>

        {/* Completion Breakdown */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Infos de base</span>
              <Badge variant="outline" className="text-xs">30/30</Badge>
            </div>
            <div className="flex justify-between">
              <span>Photo de profil</span>
              <Badge variant="outline" className="text-xs">10/10</Badge>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Détails profil</span>
              <Badge variant="outline" className="text-xs">{Math.min(score - 30, 70)}/70</Badge>
            </div>
            <div className="flex justify-between">
              <span>Bio complète</span>
              <Badge variant="outline" className="text-xs">20/20</Badge>
            </div>
          </div>
        </div>

        {/* Action Button */}
        {!isComplete && onImprove && (
          <Button 
            onClick={onImprove}
            className="w-full mt-4 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
          >
            <Target className="w-4 h-4 mr-2" />
            Améliorer mon profil
          </Button>
        )}

        {isComplete && (
          <div className="text-center py-2">
            <div className="text-green-600 font-semibold flex items-center justify-center space-x-2">
              <CheckCircle className="w-5 h-5" />
              <span>Profil parfaitement optimisé !</span>
            </div>
          </div>
        )}
      </CardContent>

      {/* Completion Sparkles */}
      {isComplete && (
        <div className="absolute top-2 right-2 text-yellow-400 animate-pulse">
          <Sparkles className="w-6 h-6" />
        </div>
      )}
    </Card>
  );
}