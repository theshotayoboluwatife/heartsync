import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Icons } from "@/lib/icons";

interface HonestyMeterProps {
  rating: number;
  ratingCount: number;
  size?: "sm" | "md" | "lg";
  animated?: boolean;
  showLabel?: boolean;
}

export function HonestyMeter({ 
  rating, 
  ratingCount, 
  size = "md", 
  animated = true, 
  showLabel = true 
}: HonestyMeterProps) {
  const [animatedRating, setAnimatedRating] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    const timer = setTimeout(() => {
      setAnimatedRating(rating);
    }, 300);
    return () => clearTimeout(timer);
  }, [rating]);

  const getHonestyLevel = (rating: number) => {
    if (rating >= 4.5) return { label: "Très Honnête", color: "from-green-400 to-emerald-500", icon: Icons.Shield };
    if (rating >= 4) return { label: "Honnête", color: "from-blue-400 to-cyan-500", icon: Icons.Star };
    if (rating >= 3.5) return { label: "Assez Honnête", color: "from-yellow-400 to-orange-500", icon: Icons.Heart };
    if (rating >= 3) return { label: "Moyennement Honnête", color: "from-orange-400 to-red-500", icon: Icons.Sparkles };
    return { label: "Peu Honnête", color: "from-red-400 to-pink-500", icon: Icons.Sparkles };
  };

  const honestyLevel = getHonestyLevel(rating);
  const percentage = (rating / 5) * 100;

  const sizeClasses = {
    sm: { 
      container: "w-24 h-24", 
      text: "text-xs", 
      icon: "w-4 h-4",
      meter: "w-20 h-20",
      strokeWidth: 6
    },
    md: { 
      container: "w-32 h-32", 
      text: "text-sm", 
      icon: "w-5 h-5",
      meter: "w-28 h-28",
      strokeWidth: 8
    },
    lg: { 
      container: "w-40 h-40", 
      text: "text-base", 
      icon: "w-6 h-6",
      meter: "w-36 h-36",
      strokeWidth: 10
    }
  };

  const classes = sizeClasses[size];
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (animatedRating / 5) * circumference;

  return (
    <div className={`relative ${classes.container} mx-auto`}>
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="relative w-full h-full"
          >
            {/* Background Circle */}
            <svg 
              className="absolute inset-0 w-full h-full transform -rotate-90"
              viewBox="0 0 120 120"
            >
              <circle
                cx="60"
                cy="60"
                r={radius}
                fill="none"
                stroke="currentColor"
                strokeWidth={classes.strokeWidth}
                className="text-gray-200"
              />
              
              {/* Animated Progress Circle */}
              <motion.circle
                cx="60"
                cy="60"
                r={radius}
                fill="none"
                strokeWidth={classes.strokeWidth}
                strokeLinecap="round"
                className={`bg-gradient-to-r ${honestyLevel.color}`}
                style={{
                  strokeDasharray,
                  strokeDashoffset: animated ? strokeDashoffset : circumference - (rating / 5) * circumference,
                }}
                initial={animated ? { strokeDashoffset: circumference } : undefined}
                animate={animated ? { strokeDashoffset } : undefined}
                transition={{ duration: 1.5, ease: "easeInOut", delay: 0.3 }}
                stroke="url(#gradient)"
              />
              
              {/* Gradient Definition */}
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" className={honestyLevel.color.split(' ')[0].replace('from-', 'stop-')} />
                  <stop offset="100%" className={honestyLevel.color.split(' ')[1].replace('to-', 'stop-')} />

                </linearGradient>
              </defs>
            </svg>

            {/* Center Content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, delay: 0.8 }}
                className={`p-2 rounded-full bg-gradient-to-r ${honestyLevel.color} shadow-lg`}
              >
                <honestyLevel.icon className={`${classes.icon} text-white`} />
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 1 }}
                className="text-center mt-1"
              >
                <div className={`font-bold text-gray-800 ${classes.text}`}>
                  {rating.toFixed(1)}
                </div>
                <div className={`text-gray-500 ${classes.text}`}>
                  {ratingCount} avis
                </div>
              </motion.div>
            </div>

            {/* Floating Particles */}
            {animated && rating >= 4 && (
              <div className="absolute inset-0 pointer-events-none">
                {[...Array(3)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
                    animate={{ 
                      opacity: [0, 1, 0],
                      scale: [0, 1, 0],
                      x: [0, (i - 1) * 20, (i - 1) * 40],
                      y: [0, -20, -40]
                    }}
                    transition={{
                      duration: 2,
                      delay: 1.5 + i * 0.3,
                      repeat: Infinity,
                      repeatDelay: 3
                    }}
                    className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                  >
                    <Sparkles className="w-3 h-3 text-yellow-400" />
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Honesty Level Label */}
      {showLabel && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.2 }}
          className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-center"
        >
          <div className={`font-medium text-gray-700 ${classes.text}`}>
            {honestyLevel.label}
          </div>
        </motion.div>
      )}
    </div>
  );
}