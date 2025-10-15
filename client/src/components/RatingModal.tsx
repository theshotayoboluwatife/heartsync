import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Star } from "lucide-react";
import { HonestyMeter } from "./HonestyMeter";
import type { ProfileWithUser } from "@shared/schema";

interface RatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: ProfileWithUser | null;
  onRatingSubmitted: () => void;
}

export function RatingModal({ isOpen, onClose, profile, onRatingSubmitted }: RatingModalProps) {
  const { toast } = useToast();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [hoveredRating, setHoveredRating] = useState(0);

  const submitRatingMutation = useMutation({
    mutationFn: async () => {
      if (!profile || rating === 0) return;
      
      await apiRequest('POST', '/api/ratings', {
        ratedUserId: profile.userId,
        score: rating.toString(),
        comment: comment.trim() || undefined,
      });
    },
    onSuccess: () => {
      toast({
        title: "Évaluation envoyée",
        description: "Merci pour votre contribution à la communauté",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/discover"] });
      queryClient.invalidateQueries({ queryKey: ["/api/my-ratings"] });
      setRating(0);
      setComment("");
      onRatingSubmitted();
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer l'évaluation",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = () => {
    if (rating === 0) {
      toast({
        title: "Évaluation requise",
        description: "Veuillez sélectionner une note",
        variant: "destructive",
      });
      return;
    }
    submitRatingMutation.mutate();
  };

  const handleClose = () => {
    setRating(0);
    setComment("");
    setHoveredRating(0);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-sm mx-auto rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-center">
            <h3 className="text-xl font-bold text-gray-800 mb-2">Évaluer l'honnêteté</h3>
            <p className="text-gray-600 text-sm font-normal">
              Votre avis aide la communauté
            </p>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Profile Info */}
          {profile && (
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-2 bg-gray-200 rounded-full flex items-center justify-center">
                {profile.user.profileImageUrl ? (
                  <img 
                    src={profile.user.profileImageUrl} 
                    alt="Profile" 
                    className="w-16 h-16 rounded-full object-cover"
                  />
                ) : (
                  <span className="text-gray-400 font-semibold">
                    {profile.user.firstName?.[0] || 'U'}
                  </span>
                )}
              </div>
              <p className="font-medium text-gray-800">
                {profile.user.firstName || 'Utilisateur'}
              </p>
            </div>
          )}

          {/* Interactive Rating with Honesty Meter Preview */}
          <div className="space-y-4">
            {/* Star Rating */}
            <div className="flex items-center justify-center space-x-2">
              {Array.from({ length: 5 }, (_, i) => (
                <button
                  key={i}
                  className="text-3xl transition-all duration-200 focus:outline-none transform hover:scale-110"
                  onClick={() => setRating(i + 1)}
                  onMouseEnter={() => setHoveredRating(i + 1)}
                  onMouseLeave={() => setHoveredRating(0)}
                >
                  <Star
                    className={`w-8 h-8 ${
                      i < (hoveredRating || rating)
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
            </div>

            {/* Live Preview of Honesty Meter */}
            {(rating > 0 || hoveredRating > 0) && (
              <div className="flex justify-center">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs text-gray-600 mb-2 text-center">Aperçu de votre évaluation</p>
                  <HonestyMeter 
                    rating={hoveredRating || rating}
                    ratingCount={1}
                    size="sm"
                    animated={true}
                    showLabel={false}
                  />
                </div>
              </div>
            )}

            {/* Rating Labels */}
            <div className="text-center">
              <p className="text-sm text-gray-600">
                {(hoveredRating || rating) === 1 && "Très peu honnête"}
                {(hoveredRating || rating) === 2 && "Peu honnête"}
                {(hoveredRating || rating) === 3 && "Moyennement honnête"}
                {(hoveredRating || rating) === 4 && "Honnête"}
                {(hoveredRating || rating) === 5 && "Très honnête"}
              </p>
            </div>
          </div>

          {/* Comment */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">
              Commentaire (optionnel)
            </Label>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Partagez votre expérience..."
              className="min-h-[80px] text-sm"
              maxLength={500}
            />
            <p className="text-xs text-gray-500 text-right">
              {comment.length}/500
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <Button 
              variant="outline"
              className="flex-1 py-3 rounded-xl font-medium"
              onClick={handleClose}
              disabled={submitRatingMutation.isPending}
            >
              Annuler
            </Button>
            <Button 
              className="flex-1 gradient-primary text-white py-3 rounded-xl font-medium"
              onClick={handleSubmit}
              disabled={submitRatingMutation.isPending || rating === 0}
            >
              {submitRatingMutation.isPending ? 'Envoi...' : 'Soumettre'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
