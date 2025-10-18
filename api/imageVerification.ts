import { storage } from "./storage";
import { db,supabaseAdmin } from "./db";
import { profiles } from "@shared/schema";
import { eq } from "drizzle-orm";
import multer from 'multer';



export interface VerificationResult {
  approved: boolean;
  reason?: string;
  confidence: number;
}


interface UploadResult {
  imageUrl: string;
  thumbnailUrl: string;
  imagePath: string;
}

// Updated submitForVerification function
export async function submitForVerification(userId: string, imageUrl: string, imagePath: string): Promise<void> {
  const profile = await storage.getProfile(userId);

  if (!profile) {
    // Create a basic profile if it doesn't exist
    await storage.createProfile({
      userId,
      age: 25, // Default age, user can update later
      gender: 'male', // Default gender, user can update later
      profileImageUrl: imageUrl,
      profileImageThumbnailUrl: imageUrl, // Same as main image for now
      profileImageVerificationStatus: "pending",
      isProfileImageVerified: false,
    });
  } else {
    // Update existing profile with new image
    const profileData = { 
      profileImageUrl: imageUrl,
      profileImageThumbnailUrl: imageUrl, // Same as main image for now
      profileImageVerificationStatus: "pending",
      isProfileImageVerified: false,
      updatedAt: new Date(),
    };
    const updatedProfile = await storage.updateProfile(userId, profileData);
    console.log("🟢 Updated profile with Supabase image:", updatedProfile);
  }

  // Also update the user table with the new image
  await storage.updateUser(userId, {
    profileImageUrl: imageUrl,
    // Store the Supabase path for potential cleanup later
    profileImagePath: imagePath
  });

  // Auto-approve after 30 seconds for demo purposes
  // In production, this would be replaced with manual or AI verification
  setTimeout(async () => {
    try {
      await approveImage(userId, "system_auto_approval");
    } catch (error) {
      console.error("Auto-approval failed:", error);
    }
  }, 30000); // 30 seconds
}

export async function approveImage(userId: string, adminId: string): Promise<void> {
  await db
    .update(profiles)
    .set({
      profileImageVerificationStatus: "approved",
      isProfileImageVerified: true,
      updatedAt: new Date(),
    })
    .where(eq(profiles.userId, userId));
  
  // In a real app, you'd log this action
  console.log(`Image approved for user ${userId} by admin ${adminId}`);
}

export async function rejectImage(userId: string, adminId: string, reason: string): Promise<void> {
  await db
    .update(profiles)
    .set({
      profileImageVerificationStatus: "rejected",
      isProfileImageVerified: false,
      updatedAt: new Date(),
    })
    .where(eq(profiles.userId, userId));
  
  // In a real app, you'd log this action and potentially notify the user
  console.log(`Image rejected for user ${userId} by admin ${adminId}. Reason: ${reason}`);
}

export async function getPendingVerifications(): Promise<any[]> {
  const pendingProfiles = await db
    .select({
      userId: profiles.userId,
      profileImageUrl: profiles.profileImageUrl,
      profileImageThumbnailUrl: profiles.profileImageThumbnailUrl,
      createdAt: profiles.createdAt,
    })
    .from(profiles)
    .where(eq(profiles.profileImageVerificationStatus, "pending"));
  
  return pendingProfiles;
}

export async function getVerificationStatus(userId: string): Promise<{
  status: string;
  isVerified: boolean;
  canUpload: boolean;
}> {
  const profile = await storage.getProfile(userId);
  
  if (!profile) {
    return {
      status: "no_profile",
      isVerified: false,
      canUpload: true,
    };
  }
  
  const status = profile.profileImageVerificationStatus || "no_profile";
  const isVerified = profile.isProfileImageVerified || false;
  const canUpload = status !== "pending"; // Can upload if not currently pending
  
  return {
    status,
    isVerified,
    canUpload,
  };
}

export function getVerificationStatusMessage(status: string): string {
  switch (status) {
    case "pending":
      return "Votre photo est en cours de vérification. Cela peut prendre jusqu'à 24 heures.";
    case "approved":
      return "Votre photo a été approuvée et vérifiée.";
    case "rejected":
      return "Votre photo a été rejetée. Veuillez télécharger une nouvelle photo qui respecte nos directives.";
    default:
      return "Ajoutez une photo de profil pour commencer.";
  }
}




export async function uploadToSupabaseStorage(file: multer.File, userId: string): Promise<UploadResult> {
  try {
    
    const fileExt = file.originalname.split('.').pop() || 'jpg';
    const timestamp = Date.now();
    const fileName = `${userId}_${timestamp}.${fileExt}`;
    const filePath = `profile-images/${fileName}`;

    console.log('Uploading to Supabase Storage:', filePath);

    
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from('media')
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
        cacheControl: '3600',
        upsert: true
      });

    if (uploadError) {
      console.error('Supabase upload error:', uploadError);
      throw new Error(`Upload failed: ${uploadError.message}`);
    }

    // Get public URL
    const { data: { publicUrl } } = supabaseAdmin.storage
      .from('media')
      .getPublicUrl(filePath);

    console.log('File uploaded successfully. Public URL:', publicUrl);

    
    return {
      imageUrl: publicUrl,
      thumbnailUrl: publicUrl, 
      imagePath: filePath
    };

  } catch (error) {
    console.error('Error uploading to Supabase Storage:', error);
    throw new Error('Failed to upload image to storage');
  }
}




export function getVerificationGuidelines(): string[] {
  return [
    "Utilisez une photo récente de vous",
    "Votre visage doit être clairement visible",
    "Pas de lunettes de soleil ou de masque",
    "Pas de photos de groupe",
    "Pas de photos d'animaux ou d'objets",
    "Pas de contenu inapproprié",
    "Photos de bonne qualité uniquement"
  ];
}