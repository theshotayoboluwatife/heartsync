import { useState, useRef, useCallback, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useAuth, authenticatedFetch } from "@/hooks/useAuth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Camera, 
  Upload, 
  X, 
  Check, 
  Clock, 
  AlertCircle, 
  ImageIcon,
  Trash2,
  CheckCircle,
  Shield,
  Settings
} from "lucide-react";
import { createClient } from '@supabase/supabase-js';

// Create Supabase client
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

interface PhotoUploadProps {
  userId: string;
  onPhotoUploaded?: (imageUrl: string) => void;
}

export function PhotoUpload({ userId, onPhotoUploaded }: PhotoUploadProps) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [optimizedFile, setOptimizedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [compressionQuality, setCompressionQuality] = useState(0.9);

  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const { data: verificationStatus, isLoading: statusLoading } = useQuery({
    queryKey: ["/api/verification-status"],
    queryFn: async () => {
      const response = await authenticatedFetch("/api/verification-status");
      if (!response.ok) {
        throw new Error('Failed to fetch verification status');
      }
      return response.json();
    },
    enabled: isAuthenticated && !authLoading,
    refetchInterval: 30000,
    staleTime: 10000,
  });

  const { data: guidelines } = useQuery({
    queryKey: ["/api/verification-guidelines"],
    queryFn: async () => {
      const response = await fetch("/api/verification-guidelines"); // This one doesn't need auth
      if (!response.ok) {
        throw new Error('Failed to fetch guidelines');
      }
      return response.json();
    },
    staleTime: 300000,
  });

  // Image optimization function
  const optimizeImage = useCallback((file: File): Promise<File> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const canvas = canvasRef.current;

      if (!canvas) {
        reject(new Error('Canvas not available'));
        return;
      }

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas context not available'));
        return;
      }

      img.onload = () => {
        // Calculate optimal dimensions (max 1920x1920, maintain aspect ratio)
        const maxSize = 1920;
        let { width, height } = img;

        if (width > maxSize || height > maxSize) {
          if (width > height) {
            height = (height * maxSize) / width;
            width = maxSize;
          } else {
            width = (width * maxSize) / height;
            height = maxSize;
          }
        }

        // Ensure minimum dimensions for quality (at least 800x800)
        const minSize = 800;
        if (width < minSize && height < minSize) {
          if (width > height) {
            height = (height * minSize) / width;
            width = minSize;
          } else {
            width = (width * minSize) / height;
            height = minSize;
          }
        }

        // Set canvas dimensions
        canvas.width = width;
        canvas.height = height;

        // Enable image smoothing for better quality
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        // Draw image with high quality
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to blob with high quality
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const optimizedFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now(),
              });
              resolve(optimizedFile);
            } else {
              reject(new Error('Failed to optimize image'));
            }
          },
          'image/jpeg',
          compressionQuality
        );
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(file);
    });
  }, [compressionQuality]);

  // Cleanup function to prevent memory leaks
  const cleanupPreview = useCallback(() => {
    if (previewUrl && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setSelectedFile(null);
    setOptimizedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [previewUrl]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      console.log('Upload mutation function called with file:', file.name, 'Size:', file.size);

      // Create FormData
      const formData = new FormData();
      formData.append('photo', file);

      // Get auth token manually for FormData upload
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Not authenticated');
      }

      console.log('Making API request to /api/upload-photo');
      const response = await fetch('/api/upload-photo', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          // DON'T set Content-Type - let browser handle multipart boundary
        },
        body: formData, // Send FormData, not JSON
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Upload failed:', response.status, errorText);

        try {
          const errorData = JSON.parse(errorText);
          throw new Error(errorData.message || `Upload failed: ${response.status}`);
        } catch {
          throw new Error(`Upload failed: ${response.status} - ${errorText}`);
        }
      }

      return response.json();
    },
    onMutate: () => {
      setIsUploading(true);
    },

    
    onSuccess: (data) => {
      setIsUploading(false);
      toast({
        title: "Photo téléchargée",
        description: "Votre photo est en cours de vérification",
      });

      cleanupPreview();

      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ["/api/verification-status"] });
        queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
        queryClient.invalidateQueries({ queryKey: ["/api/profiles/me"] });
        queryClient.invalidateQueries({ queryKey: ["/api/profile-completion"] });
      }, 100);

      onPhotoUploaded?.(data.imageUrl);

      // 👉 reset mutation so next upload can start fresh
      uploadMutation.reset();
    },
    onError: (error: any) => {
      setIsUploading(false);
      console.error('Upload error:', error);

      toast({
        title: "Erreur de téléchargement",
        description: error.message || "Impossible de télécharger la photo",
        variant: "destructive",
      });

      // 👉 also reset on error
      uploadMutation.reset();
    },


    
  });


  
 const deleteMutation = useMutation({
  mutationFn: async () => {
    const response = await authenticatedFetch('/api/profile-photo', {
      method: 'DELETE',
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Delete failed:', response.status, errorText);
      throw new Error('Delete failed');
    }

    return response.json();
  },
    onSuccess: () => {
      toast({
        title: "Photo supprimée",
        description: "Votre photo a été supprimée avec succès",
      });

      cleanupPreview();

      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ["/api/verification-status"] });
        queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
        queryClient.invalidateQueries({ queryKey: ["/api/profiles/me"] });
      }, 100);
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de supprimer la photo",
        variant: "destructive",
      });
    },
  });

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
      
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFile(files[0]);
    }
  }, []);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  }, []);

  const handleFile = useCallback(async (file: File) => {
    // Clean up any existing preview first
    if (previewUrl && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Type de fichier invalide",
        description: "Veuillez sélectionner une image",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (50MB max for processing)
    if (file.size > 50 * 1024 * 1024) {
      toast({
        title: "Fichier trop volumineux",
        description: "La taille maximale est de 50MB",
        variant: "destructive",
      });
      return;
    }

    setSelectedFile(file);
    setIsProcessing(true);

    try {
      // Optimize the image
      const optimized = await optimizeImage(file);
      setOptimizedFile(optimized);

      // Create preview URL
      const objectUrl = URL.createObjectURL(optimized);
      setPreviewUrl(objectUrl);

      console.log('Image optimized:', {
        original: { size: file.size, type: file.type },
        optimized: { size: optimized.size, type: optimized.type }
      });

    } catch (error) {
      console.error('Image optimization failed:', error);
      toast({
        title: "Erreur de traitement",
        description: "Impossible de traiter l'image. Veuillez essayer avec une autre image.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  }, [previewUrl, toast, optimizeImage]);

  const handleUpload = useCallback(() => {
    const fileToUpload = optimizedFile || selectedFile;

    console.log('handleUpload called', { 
      hasOptimizedFile: !!optimizedFile, 
      hasSelectedFile: !!selectedFile,
      fileToUpload: fileToUpload?.name 
    });

    if (!fileToUpload) {
      console.log('Upload aborted - missing file');
      toast({
        title: "Aucun fichier sélectionné",
        description: "Veuillez sélectionner une photo d'abord",
        variant: "destructive",
      });
      return;
    }

    console.log('Starting upload mutation with file:', fileToUpload.name, 'Size:', fileToUpload.size);
    uploadMutation.mutate(fileToUpload);
  }, [selectedFile, optimizedFile, uploadMutation, toast]);

  const handleCancel = useCallback(() => {
    cleanupPreview();
  }, [cleanupPreview]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'rejected':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <ImageIcon className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="text-yellow-700 border-yellow-300">En attente</Badge>;
      case 'approved':
        return <Badge variant="outline" className="text-green-700 border-green-300">Approuvée</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="text-red-700 border-red-300">Rejetée</Badge>;
      default:
        return <Badge variant="outline">Aucune photo</Badge>;
    }
  };

  const getStatusMessage = (status: string) => {
    switch (status) {
      case 'pending':
        return "Votre photo est en cours de vérification. Cela peut prendre jusqu'à 24 heures.";
      case 'approved':
        return "Votre photo a été approuvée et vérifiée.";
      case 'rejected':
        return "Votre photo a été rejetée. Veuillez télécharger une nouvelle photo qui respecte nos directives.";
      default:
        return "Ajoutez une photo de profil pour commencer.";
    }
  };

  if (statusLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Hidden canvas for image processing */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Status Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            {getStatusIcon(verificationStatus?.status)}
            <span>Photo de profil</span>
            {verificationStatus?.isVerified && (
              <Shield className="w-4 h-4 text-blue-500" />
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            {getStatusBadge(verificationStatus?.status)}
            {verificationStatus?.status !== 'no_profile' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => deleteMutation.mutate()}
                disabled={deleteMutation.isPending || isUploading}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Supprimer
              </Button>
            )}
          </div>

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {getStatusMessage(verificationStatus?.status)}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Upload Area - Only render when can upload */}
      {verificationStatus?.canUpload && !isUploading && (
        <Card key="upload-card">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Télécharger une photo</span>
              <div className="flex items-center space-x-2">
                <Settings className="w-4 h-4 text-gray-500" />
                <label className="text-sm text-gray-600">
                  Qualité:
                  <select 
                    value={compressionQuality} 
                    onChange={(e) => setCompressionQuality(Number(e.target.value))}
                    className="ml-2 text-sm border rounded px-1"
                  >
                    <option value={0.95}>Très haute (95%)</option>
                    <option value={0.9}>Haute (90%)</option>
                    <option value={0.8}>Moyenne (80%)</option>
                  </select>
                </label>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isProcessing ? (
              <div className="flex items-center justify-center space-x-3 py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-pink-500"></div>
                <span className="text-gray-600">Optimisation de l'image...</span>
              </div>
            ) : previewUrl ? (
              <div className="space-y-4" key="preview-section">
                <div className="relative">
                  <img 
                    src={previewUrl} 
                    alt="Aperçu" 
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCancel}
                    className="absolute top-2 right-2 bg-black/50 text-white hover:bg-black/70"
                    disabled={uploadMutation.isPending}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                {/* File info */}
                <div className="text-sm text-gray-600 space-y-1">
                  {selectedFile && (
                    <div>Fichier original: {(selectedFile.size / 1024 / 1024).toFixed(1)} MB</div>
                  )}
                  {optimizedFile && (
                    <div>Fichier optimisé: {(optimizedFile.size / 1024 / 1024).toFixed(1)} MB</div>
                  )}
                </div>

                <div className="flex space-x-2">
                  <Button
                    onClick={handleUpload}
                    disabled={uploadMutation.isPending}
                    className="flex-1"
                  >
                    {uploadMutation.isPending ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    ) : (
                      <Check className="w-4 h-4 mr-2" />
                    )}
                    {uploadMutation.isPending ? 'Téléchargement...' : 'Confirmer'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleCancel}
                    disabled={uploadMutation.isPending}
                  >
                    Annuler
                  </Button>
                </div>
              </div>
            ) : (
              <div key="upload-section">
                <div
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                    dragActive
                      ? 'border-pink-500 bg-pink-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <Camera className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">
                    Glissez-déposez une photo ici ou cliquez pour sélectionner
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="mb-4"
                    disabled={uploadMutation.isPending || isProcessing}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Choisir une photo
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileInput}
                    className="hidden"
                    disabled={uploadMutation.isPending || isProcessing}
                  />
                  <p className="text-sm text-gray-500">
                    JPEG, PNG ou WebP • Max 50MB • Optimisation automatique
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {isUploading && (
        <Card>
          <CardContent className="py-8">
            <div className="flex items-center justify-center space-x-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-pink-500"></div>
              <span className="text-gray-600">Téléchargement en cours...</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Guidelines */}
      {guidelines && (
        <Card>
          <CardHeader>
            <CardTitle>Directives pour les photos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800 font-medium">
                💡 Conseils pour une meilleure qualité:
              </p>
              <ul className="text-sm text-blue-700 mt-2 space-y-1">
                <li>• Utilisez un éclairage naturel ou bien éclairé</li>
                <li>• Évitez les photos floues ou pixelisées</li>
                <li>• Assurez-vous que votre visage est clairement visible</li>
                <li>• Les photos sont automatiquement optimisées pour la qualité</li>
              </ul>
            </div>
            <ul className="space-y-2">
              {guidelines.guidelines.map((guideline: string, index: number) => (
                <li key={index} className="flex items-start space-x-2">
                  <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-700">{guideline}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}