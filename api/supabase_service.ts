// Add this new function to handle Supabase Storage uploads
import { supabaseAdmin } from "./db";

interface UploadResult {
  imageUrl: string;
  thumbnailUrl: string;
  imagePath: string;
}

export async function uploadToSupabaseStorage(file: Express.Multer.File, userId: string): Promise<UploadResult> {
  try {
    // Create unique filename
    const fileExt = file.originalname.split('.').pop() || 'jpg';
    const timestamp = Date.now();
    const fileName = `${userId}_${timestamp}.${fileExt}`;
    const filePath = `profile-images/${fileName}`;

    console.log('Uploading to Supabase Storage:', filePath);

    // Upload original image to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from('profile-images')
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
      .from('profile-images')
      .getPublicUrl(filePath);

    console.log('File uploaded successfully. Public URL:', publicUrl);

    // For now, use the same URL for both image and thumbnail
    // You can later add thumbnail generation if needed
    return {
      imageUrl: publicUrl,
      thumbnailUrl: publicUrl, // Same URL for now
      imagePath: filePath
    };

  } catch (error) {
    console.error('Error uploading to Supabase Storage:', error);
    throw new Error('Failed to upload image to storage');
  }
}