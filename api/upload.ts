import multer from 'multer';
import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs';

// Ensure upload directories exist
const uploadDir = path.join(process.cwd(), 'uploads');
const profileDir = path.join(uploadDir, 'profiles');
const tempDir = path.join(uploadDir, 'temp');

[uploadDir, profileDir, tempDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Configure multer for file upload
const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Check if file is an image
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Seuls les fichiers image sont acceptés'));
    }
    
    // Check file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error('Format de fichier non supporté. Utilisez JPEG, PNG ou WebP'));
    }
    
    cb(null, true);
  },
});

export interface ProcessedImage {
  filename: string;
  path: string;
  url: string;
  thumbnailUrl: string;
  originalSize: number;
  processedSize: number;
  dimensions: {
    width: number;
    height: number;
  };
}

export async function processProfileImage(buffer: Buffer, userId: string): Promise<ProcessedImage> {
  const filename = `${userId}_${uuidv4()}.webp`;
  const thumbnailFilename = `${userId}_${uuidv4()}_thumb.webp`;
  
  const imagePath = path.join(profileDir, filename);
  const thumbnailPath = path.join(profileDir, thumbnailFilename);
  
  // Get original image metadata
  const metadata = await sharp(buffer).metadata();
  const originalSize = buffer.length;
  
  // Process main image (resize and optimize)
  const processedBuffer = await sharp(buffer)
    .resize(800, 800, { 
      fit: 'inside', 
      withoutEnlargement: true,
      background: { r: 255, g: 255, b: 255 }
    })
    .webp({ quality: 85 })
    .toBuffer();
  
  // Process thumbnail
  const thumbnailBuffer = await sharp(buffer)
    .resize(200, 200, { 
      fit: 'cover',
      background: { r: 255, g: 255, b: 255 }
    })
    .webp({ quality: 80 })
    .toBuffer();
  
  // Save processed images
  await fs.promises.writeFile(imagePath, processedBuffer);
  await fs.promises.writeFile(thumbnailPath, thumbnailBuffer);
  
  const processedMetadata = await sharp(processedBuffer).metadata();
  
  return {
    filename,
    path: imagePath,
    url: `/uploads/profiles/${filename}`,
    thumbnailUrl: `/uploads/profiles/${thumbnailFilename}`,
    originalSize,
    processedSize: processedBuffer.length,
    dimensions: {
      width: processedMetadata.width || 0,
      height: processedMetadata.height || 0,
    },
  };
}

export async function deleteProfileImage(filename: string): Promise<void> {
  const imagePath = path.join(profileDir, filename);
  const thumbnailPath = path.join(profileDir, filename.replace('.webp', '_thumb.webp'));
  
  try {
    await fs.promises.unlink(imagePath);
    await fs.promises.unlink(thumbnailPath);
  } catch (error) {
    console.error('Error deleting image files:', error);
  }
}

export function validateImageDimensions(buffer: Buffer): Promise<boolean> {
  return sharp(buffer)
    .metadata()
    .then(metadata => {
      const { width, height } = metadata;
      if (!width || !height) return false;
      
      // Minimum dimensions
      if (width < 200 || height < 200) return false;
      
      // Maximum dimensions
      if (width > 4000 || height > 4000) return false;
      
      return true;
    })
    .catch(() => false);
}

export async function detectFaces(buffer: Buffer): Promise<number> {
  // Simple face detection using image analysis
  // In a real app, you'd use a service like AWS Rekognition or Google Vision API
  try {
    const metadata = await sharp(buffer).metadata();
    const { width, height } = metadata;
    
    // Basic heuristic: check if image is roughly square/portrait oriented
    // and has reasonable dimensions for a face photo
    if (width && height) {
      const aspectRatio = width / height;
      // Portrait or square images are more likely to contain faces
      if (aspectRatio >= 0.7 && aspectRatio <= 1.5) {
        return 1; // Assume 1 face detected
      }
    }
    
    return 0;
  } catch (error) {
    console.error('Error in face detection:', error);
    return 0;
  }
}

export interface ImageVerification {
  isValid: boolean;
  hasMinimumQuality: boolean;
  hasFace: boolean;
  isAppropriate: boolean;
  confidence: number;
  issues: string[];
}

export async function verifyProfileImage(buffer: Buffer): Promise<ImageVerification> {
  const issues: string[] = [];
  
  // Check dimensions
  const validDimensions = await validateImageDimensions(buffer);
  if (!validDimensions) {
    issues.push('Image trop petite ou trop grande');
  }
  
  // Check for faces
  const faceCount = await detectFaces(buffer);
  const hasFace = faceCount > 0;
  if (!hasFace) {
    issues.push('Aucun visage détecté');
  }
  
  // Check file size and quality
  const metadata = await sharp(buffer).metadata();
  const hasMinimumQuality = buffer.length > 50000; // At least 50KB
  if (!hasMinimumQuality) {
    issues.push('Qualité d\'image insuffisante');
  }
  
  // Basic content appropriateness (placeholder)
  const isAppropriate = true; // In real app, use content moderation API
  
  const confidence = calculateConfidence(validDimensions, hasFace, hasMinimumQuality, isAppropriate);
  
  return {
    isValid: validDimensions && hasFace && hasMinimumQuality && isAppropriate,
    hasMinimumQuality,
    hasFace,
    isAppropriate,
    confidence,
    issues,
  };
}

function calculateConfidence(
  validDimensions: boolean,
  hasFace: boolean,
  hasMinimumQuality: boolean,
  isAppropriate: boolean
): number {
  let confidence = 0;
  
  if (validDimensions) confidence += 25;
  if (hasFace) confidence += 40;
  if (hasMinimumQuality) confidence += 20;
  if (isAppropriate) confidence += 15;
  
  return confidence;
}