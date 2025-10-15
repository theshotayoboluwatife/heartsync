// import { useQuery } from "@tanstack/react-query";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
// import { Button } from "@/components/ui/button";
// import { ScrollArea } from "@/components/ui/scroll-area";
// import { Icons } from "@/lib/icons";
// import { formatDistanceToNow } from "@/lib/dateUtils";
// import type { ChallengeResponse, MiniChallenge } from "@shared/schema";
// import { useAuth, authenticatedFetch } from "@/hooks/useAuth";


// interface ChallengeResponsesListProps {
//   userId?: string;
//   maxHeight?: string;
//   onNewChallenge?: () => void;
// }

// export function ChallengeResponsesList({ 
//   userId, 
//   maxHeight = "400px",
//   onNewChallenge 
// }: ChallengeResponsesListProps) {
//   const { isAuthenticated, isLoading: authLoading } = useAuth();

//   const { data: responses = [], isLoading, refetch } = useQuery({
//     queryKey: ["/api/my-challenge-responses"],
//     queryFn: async () => {
//       const response = await authenticatedFetch("/api/my-challenge-responses");
//       if (!response.ok) {
//         throw new Error('Failed to fetch challenge responses');
//       }
//       return response.json();
//     },
//     enabled: isAuthenticated && !authLoading,
//   });

//   const getCategoryIcon = (category: string) => {
//     switch (category) {
//       case 'this_or_that':
//         return <Icons.Heart />;
//       case 'quick_question':
//         return <Icons.MessageCircle />;
//       case 'fun_fact':
//         return <Icons.Lightbulb />;
//       case 'preference':
//         return <Icons.Star />;
//       default:
//         return <Icons.Coffee className="w-4 h-4" />;
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

//   if (isLoading) {
//     return (
//       <div className="flex items-center justify-center py-8">
//         <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
//       </div>
//     );
//   }

//   return (
//     <Card>
//       <CardHeader>
//         <div className="flex items-center justify-between">
//           <CardTitle className="flex items-center space-x-2">
//             <Icons.MessageCircle className="w-5 h-5" />
//             <span>Mes Réponses aux Défis</span>
//             <Badge variant="outline" className="ml-2">
//               {responses.length}
//             </Badge>
//           </CardTitle>
//           <div className="flex space-x-2">
//             <Button
//               variant="outline"
//               size="sm"
//               onClick={() => refetch()}
//               className="flex items-center space-x-1"
//             >
//               <Icons.RefreshCw className="w-4 h-4" />
//             </Button>
//             {onNewChallenge && (
//               <Button
//                 variant="outline"
//                 size="sm"
//                 onClick={onNewChallenge}
//                 className="flex items-center space-x-1"
//               >
//                 <Icons.Star className="w-4 h-4" />
//                 <span>Nouveau défi</span>
//               </Button>
//             )}
//           </div>
//         </div>
//       </CardHeader>
      
//       <CardContent>
//         {responses.length === 0 ? (
//           <div className="text-center py-8 space-y-4">
//             <Icons.Coffee className="w-16 h-16 text-gray-400 mx-auto" />
//             <p className="text-gray-600">
//               Vous n'avez pas encore répondu à des défis
//             </p>
//             <p className="text-sm text-gray-500">
//               Participez aux mini-défis pour améliorer vos conversations !
//             </p>
//             {onNewChallenge && (
//               <Button onClick={onNewChallenge} className="mt-4">
//                 <Icons.Star className="w-4 h-4 mr-2" />
//                 Commencer un défi
//               </Button>
//             )}
//           </div>
//         ) : (
//           <ScrollArea className={`w-full pr-4`} style={{ maxHeight }}>
//             <div className="space-y-4">
//               {responses.map((response: ChallengeResponse & { challenge: MiniChallenge }) => (
//                 <Card key={response.id} className="shadow-sm">
//                   <CardContent className="p-4">
//                     <div className="flex items-start justify-between mb-3">
//                       <Badge 
//                         variant="outline" 
//                         className={getCategoryColor(response.challenge.category)}
//                       >
//                         {getCategoryIcon(response.challenge.category)}
//                         <span className="ml-1">{getCategoryLabel(response.challenge.category)}</span>
//                       </Badge>
//                       <div className="flex items-center space-x-1 text-sm text-gray-500">
//                         <Icons.Clock className="w-3 h-3" />
//                         <span>
//                           {formatDistanceToNow(new Date(response.createdAt))}
//                         </span>
//                       </div>
//                     </div>
                    
//                     <h4 className="font-semibold text-gray-800 mb-2">
//                       {response.challenge.title}
//                     </h4>
                    
//                     <p className="text-sm text-gray-600 mb-3">
//                       {response.challenge.description}
//                     </p>
                    
//                     <div className="bg-gray-50 rounded-lg p-3">
//                       <p className="text-sm font-medium text-gray-700">
//                         Ma réponse:
//                       </p>
//                       <p className="text-gray-800 mt-1">
//                         {response.response}
//                       </p>
//                     </div>
//                   </CardContent>
//                 </Card>
//               ))}
//             </div>
//           </ScrollArea>
//         )}
//       </CardContent>
//     </Card>
//   );
// }

// import { useQuery } from "@tanstack/react-query";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
// import { Button } from "@/components/ui/button";
// import { ScrollArea } from "@/components/ui/scroll-area";
// import { Icons } from "@/lib/icons";
// import { formatDistanceToNow } from "@/lib/dateUtils";
// import type { ChallengeResponse, MiniChallenge } from "@shared/schema";
// import { useAuth, authenticatedFetch } from "@/hooks/useAuth";

// interface ChallengeResponsesListProps {
//   userId?: string;
//   maxHeight?: string;
//   onNewChallenge?: () => void;
// }

// export function ChallengeResponsesList({ 
//   userId, 
//   maxHeight = "400px",
//   onNewChallenge 
// }: ChallengeResponsesListProps) {
//   const { isAuthenticated, isLoading: authLoading } = useAuth();

//   const { data: responses = [], isLoading, refetch } = useQuery({
//     queryKey: ["/api/my-challenge-responses"],
//     queryFn: async () => {
//       const response = await authenticatedFetch("/api/my-challenge-responses");
//       if (!response.ok) {
//         throw new Error('Failed to fetch challenge responses');
//       }
//       return response.json();
//     },
//     enabled: isAuthenticated && !authLoading,
//   });

//   const getCategoryIcon = (category: string) => {
//     switch (category) {
//       case 'this_or_that':
//         return <Icons.Heart className="w-4 h-4" />;
//       case 'quick_question':
//         return <Icons.MessageCircle className="w-4 h-4" />;
//       case 'fun_fact':
//         return <Icons.Lightbulb className="w-4 h-4" />;
//       case 'preference':
//         return <Icons.Star className="w-4 h-4" />;
//       default:
//         return <Icons.Coffee className="w-4 h-4" />;
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

//   if (isLoading) {
//     return (
//       <div className="flex items-center justify-center py-8">
//         <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-4">
//       {responses.length === 0 ? (
//         <div className="text-center py-12 space-y-4">
//           <Icons.Coffee className="w-16 h-16 text-gray-400 mx-auto" />
//           <div className="space-y-2">
//             <p className="text-gray-600 font-medium">
//               Vous n'avez pas encore répondu à des défis
//             </p>
//             <p className="text-sm text-gray-500">
//               Participez aux mini-défis pour améliorer vos conversations !
//             </p>
//           </div>
//           {onNewChallenge && (
//             <Button onClick={onNewChallenge} className="mt-6">
//               <Icons.Star className="w-4 h-4 mr-2" />
//               Commencer un défi
//             </Button>
//           )}
//         </div>
//       ) : (
//         <ScrollArea className="w-full" style={{ maxHeight }}>
//           <div className="space-y-3 pr-2">
//             {responses.map((response: ChallengeResponse & { challenge: MiniChallenge }) => (
//               <div
//                 key={response.id}
//                 className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow duration-200"
//               >
//                 {/* Header with category badge and timestamp */}
//                 <div className="flex items-center justify-between mb-3">
//                   <Badge 
//                     variant="outline" 
//                     className={`${getCategoryColor(response.challenge.category)} px-2.5 py-1 text-xs font-medium`}
//                   >
//                     <span className="flex items-center gap-1.5">
//                       {getCategoryIcon(response.challenge.category)}
//                       {getCategoryLabel(response.challenge.category)}
//                     </span>
//                   </Badge>
//                   <div className="flex items-center gap-1 text-xs text-gray-500">
//                     <Icons.Clock className="w-3 h-3" />
//                     <span>
//                       {formatDistanceToNow(new Date(response.createdAt))}
//                     </span>
//                   </div>
//                 </div>

//                 {/* Challenge title and description */}
//                 <div className="mb-3">
//                   <h4 className="font-semibold text-gray-900 text-sm mb-1.5 leading-tight">
//                     {response.challenge.title}
//                   </h4>
//                   <p className="text-xs text-gray-600 leading-relaxed">
//                     {response.challenge.description}
//                   </p>
//                 </div>

//                 {/* Response section */}
//                 <div className="bg-gray-50 rounded-md p-3 border border-gray-100">
//                   <div className="flex items-start gap-2.5">
//                     <div className="w-5 h-5 bg-pink-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
//                       <Icons.MessageCircle className="w-2.5 h-2.5 text-pink-600" />
//                     </div>
//                     <div className="flex-1 min-w-0">
//                       <p className="text-xs font-medium text-gray-700 mb-1">
//                         Ma réponse:
//                       </p>
//                       <p className="text-sm text-gray-900 leading-relaxed break-words">
//                         {response.response}
//                       </p>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </ScrollArea>
//       )}
//     </div>
//   );
// }

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Icons } from "@/lib/icons";
import { formatDistanceToNow } from "@/lib/dateUtils";
import type { ChallengeResponse, MiniChallenge } from "@shared/schema";
import { useAuth, authenticatedFetch } from "@/hooks/useAuth";

interface ChallengeResponsesListProps {
  userId?: string;
  maxHeight?: string;
  onNewChallenge?: () => void;
}

export function ChallengeResponsesList({ 
  userId, 
  maxHeight = "400px",
  onNewChallenge 
}: ChallengeResponsesListProps) {
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const { data: responses = [], isLoading, refetch } = useQuery({
    queryKey: ["/api/my-challenge-responses"],
    queryFn: async () => {
      const response = await authenticatedFetch("/api/my-challenge-responses");
      if (!response.ok) {
        throw new Error('Failed to fetch challenge responses');
      }
      return response.json();
    },
    enabled: isAuthenticated && !authLoading,
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'this_or_that':
        return <Icons.Heart className="w-4 h-4" />;
      case 'quick_question':
        return <Icons.MessageCircle className="w-4 h-4" />;
      case 'fun_fact':
        return <Icons.Lightbulb className="w-4 h-4" />;
      case 'preference':
        return <Icons.Star className="w-4 h-4" />;
      default:
        return <Icons.Coffee className="w-4 h-4" />;
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
      <div className="flex items-center justify-between">
  <CardTitle className="flex items-center space-x-2">
    <Icons.MessageCircle className="w-5 h-5" />
    <span>Mes Réponses aux Défis</span>
    <Badge variant="outline" className="ml-2">
      {responses.length}
    </Badge>
  </CardTitle>
  <div className="flex space-x-2 ml-4">
    <Button
      variant="outline"
      size="sm"
      onClick={() => refetch()}
      className="flex items-center space-x-1"
    >
      <Icons.RefreshCw className="w-4 h-4" />
    </Button>
  </div>
</div>

        
      </CardHeader>

      <CardContent>
        {responses.length === 0 ? (
          <div className="text-center py-12 space-y-4">
            <Icons.Coffee className="w-16 h-16 text-gray-400 mx-auto" />
            <div className="space-y-2">
              <p className="text-gray-600 font-medium">
                Vous n'avez pas encore répondu à des défis
              </p>
              <p className="text-sm text-gray-500">
                Participez aux mini-défis pour améliorer vos conversations !
              </p>
            </div>
            {onNewChallenge && (
              <Button onClick={onNewChallenge} className="mt-6">
                <Icons.Star className="w-4 h-4 mr-2" />
                Commencer un défi
              </Button>
            )}
          </div>
        ) : (
          <ScrollArea className="w-full" style={{ maxHeight }}>
            <div className="space-y-3 pr-2">
              {responses.map((response: ChallengeResponse & { challenge: MiniChallenge }) => (
                <div
                  key={response.id}
                  className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow duration-200"
                >
                  {/* Header with category badge and timestamp */}
                  <div className="flex items-center justify-between mb-3">
                    <Badge 
                      variant="outline" 
                      className={`${getCategoryColor(response.challenge.category)} px-2.5 py-1 text-xs font-medium`}
                    >
                      <span className="flex items-center gap-1.5">
                        {getCategoryIcon(response.challenge.category)}
                        {getCategoryLabel(response.challenge.category)}
                      </span>
                    </Badge>
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Icons.Clock className="w-3 h-3" />
                      <span>
                        {formatDistanceToNow(new Date(response.createdAt))}
                      </span>
                    </div>
                  </div>

                  {/* Challenge title and description */}
                  <div className="mb-3">
                    <h4 className="font-semibold text-gray-900 text-sm mb-1.5 leading-tight">
                      {response.challenge.title}
                    </h4>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      {response.challenge.description}
                    </p>
                  </div>

                  {/* Response section */}
                  <div className="bg-gray-50 rounded-md p-3 border border-gray-100">
                    <div className="flex items-start gap-2.5">
                      <div className="w-5 h-5 bg-pink-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Icons.MessageCircle className="w-2.5 h-2.5 text-pink-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-700 mb-1">
                          Ma réponse:
                        </p>
                        <p className="text-sm text-gray-900 leading-relaxed break-words">
                          {response.response}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}