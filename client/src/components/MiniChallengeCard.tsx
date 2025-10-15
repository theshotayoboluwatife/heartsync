// import { useState } from "react";
// import { useMutation } from "@tanstack/react-query";
// import { apiRequest, queryClient } from "@/lib/queryClient";
// import { useToast } from "@/hooks/use-toast";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Textarea } from "@/components/ui/textarea";
// import { Badge } from "@/components/ui/badge";
// import { 
//   MessageCircle, 
//   CheckCircle, 
//   Heart, 
//   Coffee,
//   Lightbulb,
//   Users,
//   Star,
//   Send
// } from "lucide-react";
// import type { MiniChallenge } from "@shared/schema";

// interface MiniChallengeCardProps {
//   challenge: MiniChallenge;
//   onComplete?: () => void;
//   compact?: boolean;
// }

// export function MiniChallengeCard({ challenge, onComplete, compact = false }: MiniChallengeCardProps) {
//   const { toast } = useToast();
//   const [response, setResponse] = useState("");
//   const [selectedOption, setSelectedOption] = useState<string | null>(null);

//   const submitResponseMutation = useMutation({
//     mutationFn: async (responseData: { challengeId: number; response: string }) => {
//       return await apiRequest('POST', '/api/challenge-responses', responseData);
//     },
//     onSuccess: () => {
//       toast({
//         title: "Réponse envoyée",
//         description: "Votre réponse a été enregistrée avec succès",
//       });
//       queryClient.invalidateQueries({ queryKey: ["/api/my-challenge-responses"] });
//       onComplete?.();
//     },
//     onError: (error: any) => {
//       toast({
//         title: "Erreur",
//         description: error.message || "Impossible d'envoyer votre réponse",
//         variant: "destructive",
//       });
//     },
//   });

//   const getCategoryIcon = (category: string) => {
//     switch (category) {
//       case 'this_or_that':
//         return <Heart className="w-4 h-4" />;
//       case 'quick_question':
//         return <MessageCircle className="w-4 h-4" />;
//       case 'fun_fact':
//         return <Lightbulb className="w-4 h-4" />;
//       case 'preference':
//         return <Star className="w-4 h-4" />;
//       default:
//         return <Coffee className="w-4 h-4" />;
//     }
//   };

//   const getCategoryLabel = (category: string) => {
//     switch (category) {
//       case 'this_or_that':
//         return "Ceci ou Cela";
//       case 'quick_question':
//         return "Question Rapide";
//       case 'fun_fact':
//         return "Fait Amusant";
//       case 'preference':
//         return "Préférence";
//       default:
//         return "Défi";
//     }
//   };

//   const getCategoryColor = (category: string) => {
//     switch (category) {
//       case 'this_or_that':
//         return "bg-pink-100 text-pink-700 border-pink-200";
//       case 'quick_question':
//         return "bg-blue-100 text-blue-700 border-blue-200";
//       case 'fun_fact':
//         return "bg-yellow-100 text-yellow-700 border-yellow-200";
//       case 'preference':
//         return "bg-purple-100 text-purple-700 border-purple-200";
//       default:
//         return "bg-gray-100 text-gray-700 border-gray-200";
//     }
//   };

//   const handleSubmit = () => {
//     const finalResponse = challenge.category === 'this_or_that' ? selectedOption : response;
    
//     if (!finalResponse) {
//       toast({
//         title: "Réponse requise",
//         description: "Veuillez fournir une réponse avant de continuer",
//         variant: "destructive",
//       });
//       return;
//     }

//     submitResponseMutation.mutate({
//       challengeId: challenge.id,
//       response: finalResponse,
//     });
//   };

//   const options = challenge.options as string[] | null;

//   return (
//     <Card className={`${compact ? 'shadow-sm' : 'shadow-lg'} transition-all duration-300 hover:shadow-xl`}>
//       <CardHeader className={compact ? 'pb-3' : 'pb-4'}>
//         <div className="flex items-center justify-between">
//           <Badge variant="outline" className={getCategoryColor(challenge.category)}>
//             {getCategoryIcon(challenge.category)}
//             <span className="ml-1">{getCategoryLabel(challenge.category)}</span>
//           </Badge>
//           <Users className="w-4 h-4 text-gray-400" />
//         </div>
//         <CardTitle className={`${compact ? 'text-lg' : 'text-xl'} text-gray-800`}>
//           {challenge.title}
//         </CardTitle>
//       </CardHeader>
      
//       <CardContent className="space-y-4">
//         <p className="text-gray-600">{challenge.description}</p>
        
//         {/* This or That Options */}
//         {challenge.category === 'this_or_that' && options && (
//           <div className="space-y-2">
//             {options.map((option, index) => (
//               <Button
//                 key={index}
//                 variant={selectedOption === option ? "default" : "outline"}
//                 onClick={() => setSelectedOption(option)}
//                 className="w-full justify-start"
//               >
//                 <div className="flex items-center space-x-2">
//                   {selectedOption === option && <CheckCircle className="w-4 h-4" />}
//                   <span>{option}</span>
//                 </div>
//               </Button>
//             ))}
//           </div>
//         )}
        
//         {/* Text Response */}
//         {challenge.category !== 'this_or_that' && (
//           <div className="space-y-2">
//             <Textarea
//               value={response}
//               onChange={(e) => setResponse(e.target.value)}
//               placeholder="Votre réponse..."
//               rows={compact ? 2 : 3}
//               maxLength={280}
//             />
//             <div className="flex justify-between items-center">
//               <span className="text-sm text-gray-500">
//                 {response.length}/280 caractères
//               </span>
//             </div>
//           </div>
//         )}
        
//         <Button
//           onClick={handleSubmit}
//           disabled={
//             submitResponseMutation.isPending ||
//             (challenge.category === 'this_or_that' ? !selectedOption : !response.trim())
//           }
//           className="w-full"
//         >
//           {submitResponseMutation.isPending ? (
//             <div className="flex items-center space-x-2">
//               <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
//               <span>Envoi...</span>
//             </div>
//           ) : (
//             <div className="flex items-center space-x-2">
//               <Send className="w-4 h-4" />
//               <span>Envoyer la réponse</span>
//             </div>
//           )}
//         </Button>
//       </CardContent>
//     </Card>
//   );
// }

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useAuth, authenticatedFetch } from "@/hooks/useAuth";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  MessageCircle, 
  CheckCircle, 
  Heart, 
  Coffee,
  Lightbulb,
  Users,
  Star,
  Send
} from "lucide-react";
import type { MiniChallenge } from "@shared/schema";

interface MiniChallengeCardProps {
  challenge: MiniChallenge;
  onComplete?: () => void;
  compact?: boolean;
}

export function MiniChallengeCard({ challenge, onComplete, compact = false }: MiniChallengeCardProps) {
  const { toast } = useToast();
  const [response, setResponse] = useState("");
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  const submitResponseMutation = useMutation({
    mutationFn: async (responseData: { challengeId: number; response: string }) => {
      const response = await authenticatedFetch('/api/challenge-responses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(responseData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        try {
          const errorData = JSON.parse(errorText);
          throw new Error(errorData.message || `Request failed: ${response.status}`);
        } catch {
          throw new Error(`Request failed: ${response.status} - ${errorText}`);
        }
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Réponse envoyée",
        description: "Votre réponse a été enregistrée avec succès",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/my-challenge-responses"] });
      onComplete?.();
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Impossible d'envoyer votre réponse",
        variant: "destructive",
      });
    },
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'this_or_that':
        return <Heart className="w-4 h-4" />;
      case 'quick_question':
        return <MessageCircle className="w-4 h-4" />;
      case 'fun_fact':
        return <Lightbulb className="w-4 h-4" />;
      case 'preference':
        return <Star className="w-4 h-4" />;
      default:
        return <Coffee className="w-4 h-4" />;
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'this_or_that':
        return "Ceci ou Cela";
      case 'quick_question':
        return "Question Rapide";
      case 'fun_fact':
        return "Fait Amusant";
      case 'preference':
        return "Préférence";
      default:
        return "Défi";
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'this_or_that':
        return "bg-pink-100 text-pink-700 border-pink-200";
      case 'quick_question':
        return "bg-blue-100 text-blue-700 border-blue-200";
      case 'fun_fact':
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case 'preference':
        return "bg-purple-100 text-purple-700 border-purple-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const handleSubmit = () => {
    const finalResponse = challenge.category === 'this_or_that' ? selectedOption : response;

    if (!finalResponse) {
      toast({
        title: "Réponse requise",
        description: "Veuillez fournir une réponse avant de continuer",
        variant: "destructive",
      });
      return;
    }

    submitResponseMutation.mutate({
      challengeId: challenge.id,
      response: finalResponse,
    });
  };

  const options = challenge.options as string[] | null;

  return (
    <Card className={`${compact ? 'shadow-sm' : 'shadow-lg'} transition-all duration-300 hover:shadow-xl`}>
      <CardHeader className={compact ? 'pb-3' : 'pb-4'}>
        <div className="flex items-center justify-between">
          <Badge variant="outline" className={getCategoryColor(challenge.category)}>
            {getCategoryIcon(challenge.category)}
            <span className="ml-1">{getCategoryLabel(challenge.category)}</span>
          </Badge>
          <Users className="w-4 h-4 text-gray-400" />
        </div>
        <CardTitle className={`${compact ? 'text-lg' : 'text-xl'} text-gray-800`}>
          {challenge.title}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="text-gray-600">{challenge.description}</p>

        {/* This or That Options */}
        {challenge.category === 'this_or_that' && options && (
          <div className="space-y-2">
            {options.map((option, index) => (
              <Button
                key={index}
                variant={selectedOption === option ? "default" : "outline"}
                onClick={() => setSelectedOption(option)}
                className="w-full justify-start"
              >
                <div className="flex items-center space-x-2">
                  {selectedOption === option && <CheckCircle className="w-4 h-4" />}
                  <span>{option}</span>
                </div>
              </Button>
            ))}
          </div>
        )}

        {/* Text Response */}
        {challenge.category !== 'this_or_that' && (
          <div className="space-y-2">
            <Textarea
              value={response}
              onChange={(e) => setResponse(e.target.value)}
              placeholder="Votre réponse..."
              rows={compact ? 2 : 3}
              maxLength={280}
            />
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">
                {response.length}/280 caractères
              </span>
            </div>
          </div>
        )}

        <Button
          onClick={handleSubmit}
          disabled={
            submitResponseMutation.isPending ||
            (challenge.category === 'this_or_that' ? !selectedOption : !response.trim())
          }
          className="w-full"
        >
          {submitResponseMutation.isPending ? (
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Envoi...</span>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Send className="w-4 h-4" />
              <span>Envoyer la réponse</span>
            </div>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}