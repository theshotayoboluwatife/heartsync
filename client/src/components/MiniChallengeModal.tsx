// import { useState, useEffect } from "react";
// import { useQuery } from "@tanstack/react-query";
// import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import { MiniChallengeCard } from "./MiniChallengeCard";
// import { 
//   RefreshCw, 
//   Sparkles, 
//   X,
//   MessageCircle,
//   Users
// } from "lucide-react";
// import type { MiniChallenge } from "@shared/schema";

// interface MiniChallengeModalProps {
//   isOpen: boolean;
//   onClose: () => void;
//   onChallengeComplete?: (challenge: MiniChallenge) => void;
//   matchId?: string;
// }

// export function MiniChallengeModal({ 
//   isOpen, 
//   onClose, 
//   onChallengeComplete, 
//   matchId 
// }: MiniChallengeModalProps) {
//   const [currentChallenge, setCurrentChallenge] = useState<MiniChallenge | null>(null);
//   const [isCompleted, setIsCompleted] = useState(false);

//   const { data: randomChallenge, isLoading, refetch } = useQuery({
//     queryKey: ["/api/random-challenge"],
//     enabled: isOpen,
//     refetchOnWindowFocus: false,
//   });

//   useEffect(() => {
//     if (randomChallenge && isOpen) {
//       setCurrentChallenge(randomChallenge);
//       setIsCompleted(false);
//     }
//   }, [randomChallenge, isOpen]);

//   const handleChallengeComplete = () => {
//     setIsCompleted(true);
//     if (currentChallenge) {
//       onChallengeComplete?.(currentChallenge);
//     }
//   };

//   const handleGetNewChallenge = () => {
//     refetch();
//   };

//   const handleClose = () => {
//     setCurrentChallenge(null);
//     setIsCompleted(false);
//     onClose();
//   };

//   return (
//     <Dialog open={isOpen} onOpenChange={handleClose}>
//       <DialogContent className="max-w-md mx-auto">
//         <DialogHeader>
//           <DialogTitle className="flex items-center space-x-2">
//             <Sparkles className="w-5 h-5 text-pink-500" />
//             <span>Mini-Défi</span>
//           </DialogTitle>
//         </DialogHeader>
        
//         <div className="space-y-6">
//           {isLoading && (
//             <div className="flex flex-col items-center space-y-4 py-8">
//               <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
//               <p className="text-gray-600">Chargement d'un défi...</p>
//             </div>
//           )}

//           {!isLoading && !currentChallenge && (
//             <div className="text-center py-8 space-y-4">
//               <MessageCircle className="w-16 h-16 text-gray-400 mx-auto" />
//               <p className="text-gray-600">
//                 Vous avez terminé tous les défis disponibles !
//               </p>
//               <p className="text-sm text-gray-500">
//                 Revenez plus tard pour de nouveaux défis.
//               </p>
//             </div>
//           )}

//           {!isLoading && currentChallenge && !isCompleted && (
//             <>
//               <div className="text-center">
//                 <Badge variant="outline" className="bg-pink-50 text-pink-700 border-pink-200">
//                   <Users className="w-3 h-3 mr-1" />
//                   Défi Conversation
//                 </Badge>
//                 <p className="text-sm text-gray-600 mt-2">
//                   Répondez à ce défi pour briser la glace avec vos matches !
//                 </p>
//               </div>
              
//               <MiniChallengeCard
//                 challenge={currentChallenge}
//                 onComplete={handleChallengeComplete}
//                 compact={true}
//               />
//             </>
//           )}

//           {isCompleted && (
//             <div className="text-center py-8 space-y-4">
//               <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
//                 <Sparkles className="w-8 h-8 text-green-600" />
//               </div>
//               <h3 className="text-lg font-semibold text-gray-800">
//                 Défi terminé !
//               </h3>
//               <p className="text-gray-600">
//                 Votre réponse sera visible par vos matches pour démarrer des conversations.
//               </p>
              
//               <div className="flex space-x-2">
//                 <Button
//                   onClick={handleGetNewChallenge}
//                   variant="outline"
//                   className="flex-1"
//                 >
//                   <RefreshCw className="w-4 h-4 mr-2" />
//                   Nouveau défi
//                 </Button>
//                 <Button
//                   onClick={handleClose}
//                   className="flex-1"
//                 >
//                   Terminer
//                 </Button>
//               </div>
//             </div>
//           )}
//         </div>
//       </DialogContent>
//     </Dialog>
//   );
// }

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth, authenticatedFetch } from "@/hooks/useAuth";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MiniChallengeCard } from "./MiniChallengeCard";
import { 
  RefreshCw, 
  Sparkles, 
  X,
  MessageCircle,
  Users
} from "lucide-react";
import type { MiniChallenge } from "@shared/schema";

interface MiniChallengeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onChallengeComplete?: (challenge: MiniChallenge) => void;
  matchId?: string;
}

export function MiniChallengeModal({ 
  isOpen, 
  onClose, 
  onChallengeComplete, 
  matchId 
}: MiniChallengeModalProps) {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [currentChallenge, setCurrentChallenge] = useState<MiniChallenge | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);

  const { data: randomChallenge, isLoading, refetch } = useQuery({
    queryKey: ["/api/random-challenge"],
    queryFn: async () => {
      const response = await authenticatedFetch("/api/random-challenge");
      if (!response.ok) {
        throw new Error('Failed to fetch random challenge');
      }
      return response.json();
    },
    enabled: isOpen && isAuthenticated && !authLoading,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (randomChallenge && isOpen) {
      setCurrentChallenge(randomChallenge);
      setIsCompleted(false);
    }
  }, [randomChallenge, isOpen]);

  const handleChallengeComplete = () => {
    setIsCompleted(true);
    if (currentChallenge) {
      onChallengeComplete?.(currentChallenge);
    }
  };

  const handleGetNewChallenge = () => {
    refetch();
  };

  const handleClose = () => {
    setCurrentChallenge(null);
    setIsCompleted(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-pink-500" />
            <span>Mini-Défi</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {isLoading && (
            <div className="flex flex-col items-center space-y-4 py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
              <p className="text-gray-600">Chargement d'un défi...</p>
            </div>
          )}

          {!isLoading && !currentChallenge && (
            <div className="text-center py-8 space-y-4">
              <MessageCircle className="w-16 h-16 text-gray-400 mx-auto" />
              <p className="text-gray-600">
                Vous avez terminé tous les défis disponibles !
              </p>
              <p className="text-sm text-gray-500">
                Revenez plus tard pour de nouveaux défis.
              </p>
            </div>
          )}

          {!isLoading && currentChallenge && !isCompleted && (
            <>
              <div className="text-center">
                <Badge variant="outline" className="bg-pink-50 text-pink-700 border-pink-200">
                  <Users className="w-3 h-3 mr-1" />
                  Défi Conversation
                </Badge>
                <p className="text-sm text-gray-600 mt-2">
                  Répondez à ce défi pour briser la glace avec vos matches !
                </p>
              </div>

              <MiniChallengeCard
                challenge={currentChallenge}
                onComplete={handleChallengeComplete}
                compact={true}
              />
            </>
          )}

          {isCompleted && (
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <Sparkles className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800">
                Défi terminé !
              </h3>
              <p className="text-gray-600">
                Votre réponse sera visible par vos matches pour démarrer des conversations.
              </p>

              <div className="flex space-x-2">
                <Button
                  onClick={handleGetNewChallenge}
                  variant="outline"
                  className="flex-1"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Nouveau défi
                </Button>
                <Button
                  onClick={handleClose}
                  className="flex-1"
                >
                  Terminer
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}