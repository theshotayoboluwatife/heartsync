import { storage } from "./storage";
import { db } from "./db";
import { achievements } from "@shared/schema";

// Initial achievements to seed the database
const initialAchievements = [
  {
    key: 'first_photo',
    title: 'Première Photo',
    description: 'Ajoutez votre première photo de profil',
    icon: 'camera',
    category: 'profile',
    points: 15,
    condition: { type: 'profile_photo' }
  },
  {
    key: 'bio_writer',
    title: 'Écrivain',
    description: 'Rédigez une bio détaillée (plus de 20 caractères)',
    icon: 'edit',
    category: 'profile',
    points: 20,
    condition: { type: 'bio_length', minLength: 20 }
  },
  {
    key: 'profile_complete',
    title: 'Profil Complet',
    description: 'Complétez votre profil à 100%',
    icon: 'check-circle',
    category: 'profile',
    points: 50,
    condition: { type: 'profile_completion', percentage: 100 }
  },
  {
    key: 'challenge_participant',
    title: 'Participant',
    description: 'Participez à votre premier défi',
    icon: 'zap',
    category: 'social',
    points: 10,
    condition: { type: 'challenge_count', count: 1 }
  },
  {
    key: 'social_butterfly',
    title: 'Papillon Social',
    description: 'Participez à 5 défis',
    icon: 'users',
    category: 'social',
    points: 25,
    condition: { type: 'challenge_count', count: 5 }
  },
  {
    key: 'honest_reviewer',
    title: 'Évaluateur Honnête',
    description: 'Donnez 3 évaluations à d\'autres utilisateurs',
    icon: 'star',
    category: 'community',
    points: 30,
    condition: { type: 'rating_count', count: 3 }
  },
  {
    key: 'early_adopter',
    title: 'Pionnier',
    description: 'Rejoignez Heartsync dans ses premiers jours',
    icon: 'trophy',
    category: 'special',
    points: 100,
    condition: { type: 'registration_date', before: '2025-08-01' }
  },
  {
    key: 'trusted_member',
    title: 'Membre de Confiance',
    description: 'Obtenez une note de confiance de 4.5+',
    icon: 'shield',
    category: 'reputation',
    points: 40,
    condition: { type: 'trust_rating', minRating: 4.5 }
  }
];

export async function seedAchievements() {
  try {
    // Check if achievements already exist
    const existing = await db.select().from(achievements).limit(1);
    if (existing.length > 0) {
      console.log('Achievements already seeded');
      return;
    }

    // Insert initial achievements
    for (const achievement of initialAchievements) {
      await storage.createAchievement(achievement);
    }

    console.log('Successfully seeded achievements');
  } catch (error) {
    console.error('Error seeding achievements:', error);
  }
}

export async function checkUserAchievements(userId: string) {
  try {
    await storage.checkAndUpdateAchievements(userId);
  } catch (error) {
    console.error('Error checking achievements for user:', userId, error);
  }
}