import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Camera, 
  Edit, 
  CheckCircle, 
  Zap, 
  Users, 
  Star, 
  Trophy, 
  Shield,
  Crown,
  Award
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Achievement, UserAchievement } from "@shared/schema";

interface AchievementBadgeProps {
  achievement: Achievement;
  userAchievement?: UserAchievement;
  size?: "sm" | "md" | "lg";
  showProgress?: boolean;
  animate?: boolean;
}

export function AchievementBadge({ 
  achievement, 
  userAchievement, 
  size = "md",
  showProgress = false,
  animate = false
}: AchievementBadgeProps) {
  const isCompleted = userAchievement?.isCompleted || false;
  const progress = userAchievement?.progress || 0;
  const maxProgress = userAchievement?.maxProgress || 1;
  const progressPercentage = maxProgress > 0 ? (progress / maxProgress) * 100 : 0;

  const getIcon = (iconName: string) => {
    const iconSize = size === "sm" ? "w-4 h-4" : size === "md" ? "w-5 h-5" : "w-6 h-6";
    
    switch (iconName) {
      case 'camera':
        return <Camera className={iconSize} />;
      case 'edit':
        return <Edit className={iconSize} />;
      case 'check-circle':
        return <CheckCircle className={iconSize} />;
      case 'zap':
        return <Zap className={iconSize} />;
      case 'users':
        return <Users className={iconSize} />;
      case 'star':
        return <Star className={iconSize} />;
      case 'trophy':
        return <Trophy className={iconSize} />;
      case 'shield':
        return <Shield className={iconSize} />;
      case 'crown':
        return <Crown className={iconSize} />;
      default:
        return <Award className={iconSize} />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'profile':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'social':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'community':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'special':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'reputation':
        return 'bg-pink-100 text-pink-800 border-pink-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const sizeClasses = {
    sm: "p-3",
    md: "p-4",
    lg: "p-6"
  };

  return (
    <Card className={cn(
      "relative transition-all duration-300",
      sizeClasses[size],
      isCompleted 
        ? "border-2 border-yellow-300 bg-gradient-to-br from-yellow-50 to-amber-50" 
        : "border border-gray-200 bg-white opacity-75",
      animate && isCompleted && "animate-pulse",
      "hover:shadow-lg hover:scale-105"
    )}>
      <CardContent className="p-0">
        <div className="flex items-center space-x-3">
          {/* Icon */}
          <div className={cn(
            "flex items-center justify-center rounded-full",
            size === "sm" ? "w-8 h-8" : size === "md" ? "w-10 h-10" : "w-12 h-12",
            isCompleted 
              ? "bg-yellow-100 text-yellow-600" 
              : "bg-gray-100 text-gray-400"
          )}>
            {getIcon(achievement.icon)}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <h3 className={cn(
                "font-semibold truncate",
                size === "sm" ? "text-sm" : size === "md" ? "text-base" : "text-lg",
                isCompleted ? "text-gray-900" : "text-gray-600"
              )}>
                {achievement.title}
              </h3>
              {isCompleted && (
                <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
              )}
            </div>
            
            <p className={cn(
              "text-gray-600 line-clamp-2",
              size === "sm" ? "text-xs" : "text-sm"
            )}>
              {achievement.description}
            </p>

            {/* Progress Bar */}
            {showProgress && maxProgress > 1 && (
              <div className="mt-2">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Progrès</span>
                  <span>{progress}/{maxProgress}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-pink-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Points */}
          <div className="flex flex-col items-center space-y-1">
            <Badge className={cn(
              "text-xs px-2 py-1",
              getCategoryColor(achievement.category)
            )}>
              {achievement.points}pts
            </Badge>
            {isCompleted && (
              <div className="text-xs text-gray-500">
                Débloqué
              </div>
            )}
          </div>
        </div>
      </CardContent>

      {/* Completion Overlay */}
      {isCompleted && (
        <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
          <Trophy className="w-3 h-3 text-white" />
        </div>
      )}
    </Card>
  );
}