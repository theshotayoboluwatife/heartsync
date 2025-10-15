import { motion } from "framer-motion";
import { HonestyMeter } from "./HonestyMeter";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Icons } from "@/lib/icons";

interface HonestyMeterCardProps {
  rating: number;
  ratingCount: number;
  previousRating?: number;
  recentRatings?: any[];
  showTrend?: boolean;
  compact?: boolean;
}

export function HonestyMeterCard({ 
  rating, 
  ratingCount, 
  previousRating, 
  recentRatings = [],
  showTrend = true,
  compact = false
}: HonestyMeterCardProps) {
  const getTrend = () => {
    if (!previousRating || previousRating === 0) return null;
    const diff = rating - previousRating;
    if (Math.abs(diff) < 0.1) return { type: 'stable', value: 0 };
    return {
      type: diff > 0 ? 'up' : 'down',
      value: Math.abs(diff)
    };
  };

  const trend = getTrend();

  const getTrendIcon = () => {
    if (!trend) return null;
    switch (trend.type) {
      case 'up':
        return <Icons.TrendingUp className="w-4 h-4 text-green-500" />;
      case 'down':
        return <Icons.TrendingDown className="w-4 h-4 text-red-500" />;
      default:
        return <Icons.Minus className="w-4 h-4 text-gray-500" />;
    }
  };

  const getTrendColor = () => {
    if (!trend) return 'text-gray-600';
    switch (trend.type) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getRecentTrend = () => {
    if (recentRatings.length < 2) return null;
    const recent = recentRatings.slice(0, 3);
    const older = recentRatings.slice(3, 6);
    
    if (older.length === 0) return null;
    
    const recentAvg = recent.reduce((sum, r) => sum + parseFloat(r.score), 0) / recent.length;
    const olderAvg = older.reduce((sum, r) => sum + parseFloat(r.score), 0) / older.length;
    
    return recentAvg - olderAvg;
  };

  if (compact) {
    return (
      <Card className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <HonestyMeter 
                rating={rating}
                ratingCount={ratingCount}
                size="sm"
                animated={true}
                showLabel={false}
              />
              <div>
                <div className="text-sm font-medium text-gray-800">
                  Score d'Honnêteté
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-lg font-bold text-blue-600">
                    {rating.toFixed(1)}
                  </span>
                  <span className="text-sm text-gray-500">
                    ({ratingCount} avis)
                  </span>
                </div>
              </div>
            </div>
            
            {showTrend && trend && (
              <div className="flex items-center space-x-1">
                {getTrendIcon()}
                <span className={`text-sm font-medium ${getTrendColor()}`}>
                  {trend.value > 0 ? `+${trend.value.toFixed(1)}` : trend.value.toFixed(1)}
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-white via-blue-50 to-purple-50 border border-gray-200 shadow-lg">
      <CardContent className="p-6">
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-2">
            <Icons.Star className="w-5 h-5 text-yellow-500" />
            <h3 className="text-lg font-semibold text-gray-800">
              Score d'Honnêteté
            </h3>
          </div>
          
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <HonestyMeter 
              rating={rating}
              ratingCount={ratingCount}
              size="lg"
              animated={true}
              showLabel={true}
            />
          </motion.div>

          {/* Statistics */}
          <div className="grid grid-cols-2 gap-4 pt-4">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-center"
            >
              <div className="text-2xl font-bold text-blue-600">
                {rating.toFixed(1)}
              </div>
              <div className="text-sm text-gray-600">Note moyenne</div>
            </motion.div>
            
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-center"
            >
              <div className="text-2xl font-bold text-purple-600">
                {ratingCount}
              </div>
              <div className="text-sm text-gray-600">Total avis</div>
            </motion.div>
          </div>

          {/* Trend Analysis */}
          {showTrend && (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="pt-4 border-t border-gray-200"
            >
              <div className="flex items-center justify-center space-x-2">
                {trend ? (
                  <>
                    {getTrendIcon()}
                    <span className={`text-sm font-medium ${getTrendColor()}`}>
                      {trend.type === 'up' ? 'En hausse' : 
                       trend.type === 'down' ? 'En baisse' : 'Stable'}
                    </span>
                    {trend.value > 0 && (
                      <Badge variant="outline" className={getTrendColor()}>
                        {trend.type === 'up' ? '+' : '-'}{trend.value.toFixed(1)}
                      </Badge>
                    )}
                  </>
                ) : (
                  <span className="text-sm text-gray-500">
                    Pas assez de données pour la tendance
                  </span>
                )}
              </div>
            </motion.div>
          )}

          {/* Recent Activity */}
          {recentRatings.length > 0 && (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="pt-4 border-t border-gray-200"
            >
              <div className="flex items-center justify-center space-x-2 mb-3">
                <Users className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600">Activité récente</span>
              </div>
              <div className="flex justify-center space-x-1">
                {recentRatings.slice(0, 5).map((rating, index) => (
                  <motion.div
                    key={index}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.7 + index * 0.1 }}
                    className="flex items-center space-x-1"
                  >
                    <div className="flex">
                      {Array.from({ length: 5 }, (_, i) => (
                        <Star
                          key={i}
                          className={`w-3 h-3 ${
                            i < parseFloat(rating.score) 
                              ? 'text-yellow-400 fill-current' 
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    {index < recentRatings.slice(0, 5).length - 1 && (
                      <span className="text-gray-300">•</span>
                    )}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}