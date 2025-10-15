import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./supabaseAuth";
import { supabase } from "./db"; // Add this import
import { MessagingWebSocket } from "./websocket";
import { insertProfileSchema, insertRatingSchema, insertSwipeSchema, insertChallengeResponseSchema, insertMatchConversationSchema, insertMessageSchema } from "@shared/schema";
import { upload, processProfileImage, verifyProfileImage, deleteProfileImage } from "./upload";
import { submitForVerification, getVerificationStatus, getVerificationGuidelines, uploadToSupabaseStorage } from "./imageVerification";
import { seedAchievements, checkUserAchievements } from "./achievementService";
import { z } from "zod";
import Stripe from "stripe";
import express from "express";
import path from "path";
import { notificationService } from "./notification_service";
import { supabaseAuth } from "./supabaseAuth";
import { supabaseAdmin } from "./db"; 


if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing required Stripe secret: STRIPE_SECRET_KEY');
}
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-09-30.acacia",
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Static file serving for uploads
  app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));
  
  // Initialize achievements
  await seedAchievements();
  
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  // Update your /api/auth/user route to handle both cases
 app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    
    console.log('Fetching user data for:', userId);
    
    // Try to get user from database
    let user = await storage.getUser(userId);
    
    // If user doesn't exist in database, create them
    if (!user) {
      console.log('User not found in database, creating new user');
      
      // Create user in database using data from JWT token
      user = await storage.upsertUser({
        id: userId,
        email: req.user.claims.email || '',
        firstName: req.user.claims.first_name || '',
        lastName: req.user.claims.last_name || '',
        profileImageUrl: req.user.claims.profile_image_url || null,
      });
      
      console.log('Created new user:', user);
    }
    
    // Get user profile (might not exist for new users)
    const profile = await storage.getProfile(userId);
    
    console.log('User profile:', profile ? 'found' : 'not found');
    
    // Check for new achievements (only if user exists)
    try {
      await checkUserAchievements(userId);
    } catch (achievementError) {
      console.warn('Achievement check failed:', achievementError);
      // Don't fail the whole request if achievements fail
    }
    
    const responseData = {
      ...user,
      profile,
    };
    
    console.log('Returning user data:', {
      hasUser: !!user,
      hasProfile: !!profile,
      userId: user?.id,
      userEmail: user?.email
    });
    
    res.json(responseData);
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ message: "Failed to fetch user" });
  }
});

  // Profile routes
  app.get('/api/profiles/me', isAuthenticated, async (req: any, res) => {
    try {
    
      const userId = req.user.claims.sub;
      const profile = await storage.getProfile(userId);
      console.log("User Profile:", profile);
      if (!profile) {
        return res.status(404).json({ message: "Profile not found" });
      }
      res.json(profile);
    } catch (error) {
      console.error("Error fetching profile:", error);
      res.status(500).json({ message: "Failed to fetch profile" });
    }
  });

  app.post('/api/profiles', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const profileData = insertProfileSchema.parse({
        ...req.body,
        userId,
      });

      const existingProfile = await storage.getProfile(userId);
      if (existingProfile) {
        const updatedProfile = await storage.updateProfile(userId, profileData);
        
        // Check for new achievements after profile update
        await checkUserAchievements(userId);
        
        res.json(updatedProfile);
      } else {
        const newProfile = await storage.createProfile(profileData);
        
        // Check for new achievements after profile update
        await checkUserAchievements(userId);
        
        res.json(newProfile);
      }
    } catch (error) {
      console.error("Error creating/updating profile:", error);
      res.status(400).json({ message: "Failed to create/update profile" });
    }
  });

  app.get('/api/profiles/me', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const profile = await storage.getProfile(userId);
      
      if (!profile) {
        // Create a default profile if none exists
        const defaultProfile = {
          userId,
          age: 25,
          gender: 'male',
          occupation: '',
          bio: '',
          location: '',
        };
        const newProfile = await storage.createProfile(defaultProfile);
        return res.json(newProfile);
      }

      res.json(profile);
    } catch (error) {
      console.error("Error fetching my profile:", error);
      res.status(500).json({ message: "Failed to fetch profile" });
    }
  });

  app.get('/api/profiles/:userId', isAuthenticated, async (req, res) => {
    try {
      const { userId } = req.params;
      const profile = await storage.getProfileWithDetails(userId);
      
      if (!profile) {
        return res.status(404).json({ message: "Profile not found" });
      }

      res.json(profile);
    } catch (error) { 
      console.error("Error fetching profile:", error);
      res.status(500).json({ message: "Failed to fetch profile" });
    }
  });

  // Discovery routes
  app.get('/api/discover', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const limit = parseInt(req.query.limit as string) || 10;
      
      const profiles = await storage.getDiscoverableProfiles(userId, limit);
      console.log('retunring profile: ', profiles);
      res.json(profiles);
    } catch (error) {
      console.error("Error fetching discoverable profiles:", error);
      res.status(500).json({ message: "Failed to fetch profiles" });
    }
  });

  // Rating routes
  app.post('/api/ratings', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const userProfile = await storage.getProfile(userId);
      
      if (!userProfile || userProfile.gender !== 'female') {
        return res.status(403).json({ message: "Only women can rate profiles" });
      }

      const ratingData = insertRatingSchema.parse({
        ...req.body,
        raterId: userId,
      });

      const rating = await storage.createRating(ratingData);
      res.json(rating);
    } catch (error) {
      console.error("Error creating rating:", error);
      res.status(400).json({ message: "Failed to create rating" });
    }
  });

  app.get('/api/ratings/:userId', isAuthenticated, async (req, res) => {
    try {
      const { userId } = req.params;
      const ratings = await storage.getRatingsForUser(userId);
      res.json(ratings);
    } catch (error) {
      console.error("Error fetching ratings:", error);
      res.status(500).json({ message: "Failed to fetch ratings" });
    }
  });

  app.get('/api/my-ratings', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const ratings = await storage.getUserRatings(userId);
      res.json(ratings);
    } catch (error) {
      console.error("Error fetching user ratings:", error);
      res.status(500).json({ message: "Failed to fetch user ratings" });
    }
  });

  // Swipe routes
app.post('/api/swipes', isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const swipeData = insertSwipeSchema.parse({
      ...req.body,
      swiperId: userId,
    });

    // Check if already swiped
    const hasSwipped = await storage.hasUserSwiped(userId, swipeData.swipedUserId);
    if (hasSwipped) {
      return res.status(400).json({ message: "Already swiped on this user" });
    }

    const swipe = await storage.createSwipe(swipeData);

    // --- 🔔 Send "You were liked" notification ---
    if (swipeData.liked) {
      await notificationService.createNotification({
        userId: swipeData.swipedUserId, // the person being liked
        type: "like",
        content: "Someone liked your profile!",
        relatedId: swipe.id,
        payload: { swiperId: userId },
      });
    }

    // --- ❤️ Check for mutual like to create a match ---
    if (swipeData.liked) {
      const reciprocalSwipes = await storage.getSwipesBetweenUsers(
        swipeData.swipedUserId,
        userId
      );
      const mutualLike = reciprocalSwipes.find((s) => s.liked);

      if (mutualLike) {
        await storage.createMatch(userId, swipeData.swipedUserId);

        // --- 🔔 Notify both users about the match ---
        await notificationService.createNotification({
          userId: userId,
          type: "match",
          content: "You matched with someone!",
          relatedId: swipeData.swipedUserId,
          payload: { matchedUserId: swipeData.swipedUserId },
        });

        await notificationService.createNotification({
          userId: swipeData.swipedUserId,
          type: "match",
          content: "You matched with someone!",
          relatedId: userId,
          payload: { matchedUserId: userId },
        });

        return res.json({ ...swipe, matched: true });
      }
    }

    // --- No match, just a normal swipe response ---
    res.json({ ...swipe, matched: false });
  } catch (error) {
    console.error("Error creating swipe:", error);
    res.status(400).json({ message: "Failed to create swipe" });
  }
});

  // Match routes
  app.get('/api/matches', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const matches = await storage.getUserMatches(userId);
      res.json(matches);
    } catch (error) {
      console.error("Error fetching matches:", error);
      res.status(500).json({ message: "Failed to fetch matches" });
    }
  });

  // Photo upload routes
  app.post('/api/upload-photo', isAuthenticated, upload.single('photo'), async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    
    if (!req.file) {
      return res.status(400).json({ message: "Aucun fichier téléchargé" });
    }

    // Check if user can upload (not currently pending verification)
    const verificationStatus = await getVerificationStatus(userId);
    if (!verificationStatus.canUpload) {
      return res.status(400).json({ 
        message: "Vous avez déjà une photo en cours de vérification" 
      });
    }

    // //Verify image quality and content
    const verification = await verifyProfileImage(req.file.buffer);
    if (!verification.isValid) {
      return res.status(400).json({ 
        message: "Photo non valide",
        issues: verification.issues 
      });
    }

    // Upload to Supabase Storage instead of local processing
    const { imageUrl, thumbnailUrl, imagePath } = await uploadToSupabaseStorage(req.file, userId);
    
    // Submit for verification with Supabase URLs
     await submitForVerification(userId, imageUrl, imagePath);
    
    res.json({
      message: "Photo téléchargée avec succès",
      imageUrl: imageUrl,
      thumbnailUrl: thumbnailUrl,
     // verification,
    });
  } catch (error: any) {
    console.error("Error uploading photo:", error);
    res.status(500).json({ message: error.message || "Erreur lors du téléchargement" });
  }
});

  app.delete('/api/profile-photo', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);

      if (user?.profileImagePath) {
        // Delete from Supabase Storage
        try {
          const { error: deleteError } = await supabaseAdmin.storage
            .from('profile-images')
            .remove([user.profileImagePath]);

          if (deleteError) {
            console.warn('Failed to delete from Supabase storage:', deleteError);
          } else {
            console.log('Successfully deleted from Supabase storage:', user.profileImagePath);
          }
        } catch (storageError) {
          console.warn('Storage deletion error:', storageError);
        }
      }

      // Update user profile
      await storage.updateUser(userId, {
        profileImageUrl: null,
        profileImagePath: null
      });

      // Also update profile if it exists
      const profile = await storage.getProfile(userId);
      if (profile) {
        await storage.updateProfile(userId, {
          profileImageUrl: null,
          profileImageThumbnailUrl: null,
          isProfileImageVerified: false,
          profileImageVerificationStatus: "no_profile", // Reset to no_profile
        });
      }

      res.json({ message: "Photo supprimée avec succès" });
    } catch (error) {
      console.error("Error deleting photo:", error);
      res.status(500).json({ message: "Erreur lors de la suppression" });
    }
  });

  app.get('/api/verification-status', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const status = await getVerificationStatus(userId);
      res.json(status);
    } catch (error) {
      console.error("Error fetching verification status:", error);
      res.status(500).json({ message: "Failed to fetch verification status" });
    }
  });

  app.get('/api/verification-guidelines', (req, res) => {
    res.json({
      guidelines: getVerificationGuidelines(),
    });
  });

  app.delete('/api/profile-photo', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const profile = await storage.getProfile(userId);
      
      if (!profile?.profileImageUrl) {
        return res.status(404).json({ message: "Aucune photo à supprimer" });
      }

      // Delete image files
      const filename = profile.profileImageUrl.split('/').pop();
      if (filename) {
        await deleteProfileImage(filename);
      }

      // Update profile
      await storage.updateProfile(userId, {
        profileImageUrl: null,
        profileImageThumbnailUrl: null,
        isProfileImageVerified: false,
        profileImageVerificationStatus: "pending",
      });

      res.json({ message: "Photo supprimée avec succès" });
    } catch (error) {
      console.error("Error deleting photo:", error);
      res.status(500).json({ message: "Erreur lors de la suppression" });
    }
  });

  // Stripe payment routes
  app.post("/api/create-payment-intent", isAuthenticated, async (req: any, res) => {
    try {
      const { amount } = req.body;
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: "eur",
        automatic_payment_methods: {
          enabled: true,
        },
      });
      res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error: any) {
      console.error("Error creating payment intent:", error);
      res.status(500).json({ message: "Error creating payment intent: " + error.message });
    }
  });

  // Stripe Checkout Session route
  app.post('/api/subscribe', isAuthenticated, async (req: any, res) => {
    try {
      console.log("Creating checkout session for user:", req.user);
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      if (user.stripeSubscriptionId) {
        const subscription = await stripe.subscriptions.retrieve(user.stripeSubscriptionId);
        
        if (subscription.status === 'active') {
          return res.json({
            message: "Already subscribed",
            url: `${process.env.REPLIT_DEV_DOMAIN ? `https://${process.env.REPLIT_DEV_DOMAIN}` : 'https://trustmarch.com'}/premium`
          });
        }
      }
      
      if (!user.email) {
        return res.status(400).json({ message: 'No user email on file' });
      }

      let customerId = user.stripeCustomerId;
      
      if (!customerId) {
        const customer = await stripe.customers.create({
          email: user.email,
          name: `${user.firstName} ${user.lastName}`,
        });
        customerId = customer.id;
        await storage.updateUserStripeInfo(userId, customerId, null);
      }

      const baseUrl = 'https://trustmarch.com';
      
      const session = await stripe.checkout.sessions.create({
        mode: 'subscription',
        customer: customerId,
        payment_method_types: ['card'],
        line_items: [{
          price_data: {
            currency: 'eur',
            product_data: {
              name: 'TrustMatch Premium',
              description: 'Abonnement mensuel Premium pour TrustMatch',
            },
            unit_amount: 999, // 9.99 EUR
            recurring: {
              interval: 'month',
            },
          },
          quantity: 1,
        }],
        success_url: `${baseUrl}/premium-success?session_id={CHECKOUT_SESSION_ID}&payment_success=true`,
        cancel_url: `${baseUrl}/premium`,
        metadata: {
          userId: userId,
        },
      });

      res.json({ url: session.url });
    } catch (error: any) {
      console.error("Error creating checkout session:", error);
      res.status(500).json({ message: "Error creating checkout session: " + error.message });
    }
  });

  // Activate premium after successful payment
  app.post('/api/activate-premium', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { sessionId } = req.body;
      
      if (sessionId) {
        // Verify session with Stripe
        const session = await stripe.checkout.sessions.retrieve(sessionId);
        
        if (session.payment_status === 'paid' && session.mode === 'subscription') {
          // Update user to premium
          await storage.updateUser(userId, { 
            isPremium: true, 
            subscriptionStatus: 'active',
            stripeCustomerId: session.customer as string,
            stripeSubscriptionId: session.subscription as string
          });
          
          console.log(`User ${userId} activated premium via session ${sessionId}`);
          res.json({ success: true, message: "Premium activated successfully" });
        } else {
          res.status(400).json({ message: "Payment not completed" });
        }
      } else {
        res.status(400).json({ message: "Session ID required" });
      }
    } catch (error: any) {
      console.error("Error activating premium:", error);
      res.status(500).json({ message: "Error activating premium" });
    }
  });

  // Check subscription status
  // app.get('/api/subscription-status', isAuthenticated, async (req: any, res) => {
  //   try {
  //     const userId = req.user.claims.sub;
  //     const user = await storage.getUser(userId);
      
  //     if (!user || !user.stripeSubscriptionId) {
  //       return res.json({ status: 'free', subscribed: false });
  //     }

  //     const subscription = await stripe.subscriptions.retrieve(user.stripeSubscriptionId);
      
  //     res.json({
  //       status: subscription.status,
  //       subscribed: subscription.status === 'active',
  //       currentPeriodEnd: subscription.current_period_end,
  //     });
  //   } catch (error: any) {
  //     console.error("Error checking subscription status:", error);
  //     res.status(500).json({ message: "Error checking subscription status" });
  //   }
  // });

  app.get('/api/subscription-status', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);

      // Check if user has a free trial
      const hasUsedTrial = user?.hasUsedFreeTrial || false;
      const trialStartDate = user?.trialStartDate;
      const trialEndDate = user?.trialEndDate;

      // Calculate trial status
      const now = new Date();
      const isInTrialPeriod = hasUsedTrial && 
        trialStartDate && 
        trialEndDate && 
        now >= new Date(trialStartDate) && 
        now <= new Date(trialEndDate);

      // Calculate days remaining in trial
      let trialDaysRemaining = 0;
      if (isInTrialPeriod && trialEndDate) {
        const endDate = new Date(trialEndDate);
        const timeDiff = endDate.getTime() - now.getTime();
        trialDaysRemaining = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
      }

      // Base response for free users
      if (!user || (!user.stripeSubscriptionId && !isInTrialPeriod)) {
        return res.json({ 
          status: 'free', 
          subscribed: false,
          hasUsedTrial,
          isInTrialPeriod: false,
          trialDaysRemaining: 0
        });
      }

      // If user is in trial period (no Stripe subscription yet)
      if (isInTrialPeriod && !user.stripeSubscriptionId) {
        return res.json({
          status: 'trialing',
          subscribed: true, // They have premium features during trial
          hasUsedTrial: true,
          isInTrialPeriod: true,
          trialDaysRemaining,
          trialEndDate
        });
      }

      // If user has Stripe subscription
      if (user.stripeSubscriptionId) {
        const subscription = await stripe.subscriptions.retrieve(user.stripeSubscriptionId);

        return res.json({
          status: subscription.status,
          subscribed: subscription.status === 'active',
          currentPeriodEnd: subscription.current_period_end,
          hasUsedTrial,
          isInTrialPeriod: false,
          trialDaysRemaining: 0
        });
      }

      // Default response
      return res.json({ 
        status: 'free', 
        subscribed: false,
        hasUsedTrial,
        isInTrialPeriod: false,
        trialDaysRemaining: 0
      });

    } catch (error: any) {
      console.error("Error checking subscription status:", error);
      res.status(500).json({ message: "Error checking subscription status" });
    }
  });

  app.post('/api/start-trial', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);

      // Check if user exists
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Check if user has already used their free trial
      if (user.hasUsedFreeTrial) {
        return res.status(400).json({ 
          message: "You have already used your free trial" 
        });
      }

      // Check if user already has an active subscription
      if (user.stripeSubscriptionId && user.subscriptionStatus === 'active') {
        return res.status(400).json({ 
          message: "You already have an active subscription" 
        });
      }

      // Start the free trial
      const trialStartDate = new Date();
      const trialEndDate = new Date();
      trialEndDate.setDate(trialEndDate.getDate() + 7); // 7 days trial

      // Update user with trial information - pass Date objects directly
      await storage.updateUser(userId, {
        hasUsedFreeTrial: true,
        trialStartDate: trialStartDate,  // Pass Date object directly
        trialEndDate: trialEndDate,      // Pass Date object directly
        subscriptionStatus: 'trialing',
        isPremium: true
      });

      // Log the trial activation (optional)
      console.log(`Free trial activated for user ${userId}`);

      // Return success response
      res.json({
        success: true,
        message: "Free trial activated successfully",
        trialEndDate: trialEndDate.toISOString(), // Convert to string only for response
        trialDaysRemaining: 7
      });

    } catch (error: any) {
      console.error("Error starting free trial:", error);
      res.status(500).json({ 
        message: "Error starting free trial",
        error: error.message 
      });
    }
  });
  // Mini-challenge routes
  app.get('/api/mini-challenges', isAuthenticated, async (req, res) => {
    try {
      const { category } = req.query;
      const challenges = await storage.getMiniChallenges(category as string);
      res.json(challenges);
    } catch (error) {
      console.error("Error fetching mini-challenges:", error);
      res.status(500).json({ message: "Failed to fetch mini-challenges" });
    }
  });

  app.get('/api/random-challenge', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const userResponses = await storage.getUserChallengeResponses(userId);
      const excludeAnswered = userResponses.map(r => r.challengeId.toString());
      
      const challenge = await storage.getRandomChallenge(excludeAnswered);
      if (!challenge) {
        return res.status(404).json({ message: "Aucun défi disponible" });
      }
      
      res.json(challenge);
    } catch (error) {
      console.error("Error fetching random challenge:", error);
      res.status(500).json({ message: "Failed to fetch random challenge" });
    }
  });

  app.post('/api/challenge-responses', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const responseData = insertChallengeResponseSchema.parse({
        ...req.body,
        userId,
      });

      const response = await storage.createChallengeResponse(responseData);
      res.json(response);
    } catch (error) {
      console.error("Error creating challenge response:", error);
      res.status(400).json({ message: "Failed to create challenge response" });
    }
  });

  app.get('/api/my-challenge-responses', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const responses = await storage.getUserChallengeResponses(userId);
      res.json(responses);
    } catch (error) {
      console.error("Error fetching user challenge responses:", error);
      res.status(500).json({ message: "Failed to fetch user challenge responses" });
    }
  });

  app.post('/api/match-conversations', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const conversationData = insertMatchConversationSchema.parse({
        ...req.body,
        initiatorId: userId,
      });

      const conversation = await storage.createMatchConversation(conversationData);
      res.json(conversation);
    } catch (error) {
      console.error("Error creating match conversation:", error);
      res.status(400).json({ message: "Failed to create match conversation" });
    }
  });

  app.get('/api/match-conversations/:matchId', isAuthenticated, async (req, res) => {
    try {
      const { matchId } = req.params;
      const conversations = await storage.getMatchConversations(matchId);
      res.json(conversations);
    } catch (error) {
      console.error("Error fetching match conversations:", error);
      res.status(500).json({ message: "Failed to fetch match conversations" });
    }
  });

  // Achievement routes
  app.get('/api/achievements', isAuthenticated, async (req, res) => {
    try {
      const achievements = await storage.getAchievements();
      res.json(achievements);
    } catch (error) {
      console.error("Error fetching achievements:", error);
      res.status(500).json({ message: "Failed to fetch achievements" });
    }
  });

  app.get('/api/my-achievements', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const userAchievements = await storage.getUserAchievements(userId);
      res.json(userAchievements);
    } catch (error) {
      console.error("Error fetching user achievements:", error);
      res.status(500).json({ message: "Failed to fetch user achievements" });
    }
  });

  app.get('/api/profile-completion', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const completion = await storage.getProfileCompletionScore(userId);
      res.json(completion);
    } catch (error) {
      console.error("Error fetching profile completion:", error);
      res.status(500).json({ message: "Failed to fetch profile completion" });
    }
  });

  app.post('/api/check-achievements', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      await storage.checkAndUpdateAchievements(userId);
      res.json({ message: "Achievements checked successfully" });
    } catch (error) {
      console.error("Error checking achievements:", error);
      res.status(500).json({ message: "Failed to check achievements" });
    }
  });

  // Messaging API endpoints
  app.get('/api/messages/:matchId', isAuthenticated, async (req: any, res) => {
    try {
      const { matchId } = req.params;
      const { limit = 50 } = req.query;
      const messages = await storage.getMessages(matchId, parseInt(limit));
      res.json(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  app.post('/api/messages', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const messageData = insertMessageSchema.parse({
        ...req.body,
        senderId: userId,
      });

      const message = await storage.sendMessage(messageData);
      res.json(message);
    } catch (error) {
      console.error("Error sending message:", error);
      res.status(400).json({ message: "Failed to send message" });
    }
  });

  app.put('/api/messages/:messageId/read', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { messageId } = req.params;
      await storage.markMessageAsRead(parseInt(messageId), userId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error marking message as read:", error);
      res.status(500).json({ message: "Failed to mark message as read" });
    }
  });

  app.get('/api/unread-count', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const count = await storage.getUnreadMessageCount(userId);
      res.json({ count });
    } catch (error) {
      console.error("Error fetching unread count:", error);
      res.status(500).json({ message: "Failed to fetch unread count" });
    }
  });

  app.delete('/api/messages/:messageId', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { messageId } = req.params;
      await storage.deleteMessage(parseInt(messageId), userId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting message:", error);
      res.status(500).json({ message: "Failed to delete message" });
    }
  });

  // Message reactions
  app.post('/api/messages/:messageId/reactions', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { messageId } = req.params;
      const { reactionType } = req.body;

      const reaction = await storage.addMessageReaction({
        messageId: parseInt(messageId),
        userId,
        reactionType,
      });
      res.json(reaction);
    } catch (error) {
      console.error("Error adding reaction:", error);
      res.status(400).json({ message: "Failed to add reaction" });
    }
  });

  app.delete('/api/messages/:messageId/reactions', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { messageId } = req.params;
      await storage.removeMessageReaction(parseInt(messageId), userId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error removing reaction:", error);
      res.status(500).json({ message: "Failed to remove reaction" });
    }
  });

  // Subscription status route
  app.get("/api/subscription-status", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      const subscribed = user?.subscriptionStatus === 'active';
      
      res.json({
        subscribed,
        status: user?.subscriptionStatus || 'free',
        stripeCustomerId: user?.stripeCustomerId || null,
        stripeSubscriptionId: user?.stripeSubscriptionId || null,
      });
    } catch (error) {
      console.error("Error getting subscription status:", error);
      res.status(500).json({ message: "Failed to get subscription status" });
    }
  });

  // Stripe payment routes
  app.post("/api/create-payment-intent", isAuthenticated, async (req: any, res) => {
    try {
      const { amount } = req.body;
      const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
      
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: "eur",
        automatic_payment_methods: {
          enabled: true,
        },
      });
      
      res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error: any) {
      console.error("Error creating payment intent:", error);
      res.status(500).json({ message: "Error creating payment intent: " + error.message });
    }
  });



  // Stripe webhook handler
  app.post('/api/stripe-webhook', async (req, res) => {
    console.log("Webhook received:", req.body);
    console.log("Headers:", req.headers);
    const sig = req.headers['stripe-signature'];
    
    let event;
    try {
      // If webhook secret is available, verify signature
      if (process.env.STRIPE_WEBHOOK_SECRET) {
        event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
      } else {
        // For development/testing, use the raw event body
        console.log("No webhook secret configured, using raw event body");
        event = req.body;
      }
    } catch (err) {
      console.log('Webhook signature verification failed.', err.message);
      return res.status(400).send('Webhook signature verification failed');
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object;
        const userId = session.metadata?.userId;
        
        if (userId && session.mode === 'subscription') {
          console.log(`Updating user ${userId} to premium status from checkout session`);
          // Update user premium status
          await storage.updateUser(userId, { isPremium: true, subscriptionStatus: 'active' });
          
          // Store subscription ID if available
          if (session.subscription) {
            await storage.updateUserStripeInfo(userId, session.customer, session.subscription);
          }
          console.log(`User ${userId} successfully updated to premium`);
        }
        break;

      case 'invoice.payment_succeeded':
        const paymentIntent = event.data.object;
        const subscriptionId = paymentIntent.subscription;
        
        if (subscriptionId) {
          // Find user with this subscription ID and update status
          const subscription = await stripe.subscriptions.retrieve(subscriptionId);
          const customerId = subscription.customer;
          
          // Find user by stripe customer ID
          const user = await storage.getUserByStripeCustomerId(customerId);
          if (user) {
            await storage.updateUser(user.id, { subscriptionStatus: 'active', isPremium: true });
          }
        }
        break;
      
      case 'customer.subscription.deleted':
        const deletedSubscription = event.data.object;
        const deletedCustomerId = deletedSubscription.customer;
        
        const canceledUser = await storage.getUserByStripeCustomerId(deletedCustomerId);
        if (canceledUser) {
          await storage.updateUser(canceledUser.id, { subscriptionStatus: 'canceled', isPremium: false });
        }
        break;
      
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
  });

  // Auth routes for Supabase
  app.post('/api/auth/signup', async (req, res) => {
    try {
      const { email, password, firstName, lastName } = req.body;

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
          }
        }
      });

      if (error) {
        return res.status(400).json({ message: error.message });
      }

      res.json({ user: data.user, message: "Check your email for verification link" });
    } catch (error) {
      console.error("Signup error:", error);
      res.status(500).json({ message: "Signup failed" });
    }
  });

  app.post('/api/auth/signin', async (req, res) => {
    try {
      const { email, password } = req.body;

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return res.status(400).json({ message: error.message });
      }

      res.json({ 
        user: data.user, 
        session: data.session,
        access_token: data.session?.access_token 
      });
    } catch (error) {
      console.error("Signin error:", error);
      res.status(500).json({ message: "Signin failed" });
    }
  });

  app.post('/api/auth/signout', async (req, res) => {
    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        return res.status(400).json({ message: error.message });
      }

      res.json({ message: "Signed out successfully" });
    } catch (error) {
      console.error("Signout error:", error);
      res.status(500).json({ message: "Signout failed" });
    }
  });


  app.post('/api/auth/signup', async (req, res) => {
    try {
      const { email, password, firstName, lastName } = req.body;

      const { data, error } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        user_metadata: {
          first_name: firstName,
          last_name: lastName,
        },
        email_confirm: true, // Auto-confirm for admin creation
      });

      if (error) {
        return res.status(400).json({ message: error.message });
      }

      res.json({ user: data.user, message: "Account created successfully" });
    } catch (error) {
      console.error("Signup error:", error);
      res.status(500).json({ message: "Signup failed" });
    }
  });

  app.post('/api/auth/signin', async (req, res) => {
    try {
      const { email, password } = req.body;

      const { data, error } = await supabaseAdmin.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return res.status(400).json({ message: error.message });
      }

      res.json({ 
        user: data.user, 
        session: data.session,
        access_token: data.session?.access_token 
      });
    } catch (error) {
      console.error("Signin error:", error);
      res.status(500).json({ message: "Signin failed" });
    }
  });

  app.post('/api/auth/signout', async (req, res) => {
    try {
      const { error } = await supabaseAdmin.auth.signOut();

      if (error) {
        return res.status(400).json({ message: error.message });
      }

      res.json({ message: "Signed out successfully" });
    } catch (error) {
      console.error("Signout error:", error);
      res.status(500).json({ message: "Signout failed" });
    }
  });

  app.post('/api/auth/refresh', async (req, res) => {
    try {
      const { refresh_token } = req.body;

      const { data, error } = await supabaseAdmin.auth.refreshSession({
        refresh_token
      });

      if (error) {
        return res.status(400).json({ message: error.message });
      }

      res.json({ session: data.session });
    } catch (error) {
      console.error("Refresh error:", error);
      res.status(500).json({ message: "Token refresh failed" });
    }
  });

  app.post('/api/auth/refresh', async (req, res) => {
    try {
      const { refresh_token } = req.body;

      const { data, error } = await supabase.auth.refreshSession({
        refresh_token
      });

      if (error) {
        return res.status(400).json({ message: error.message });
      }

      res.json({ session: data.session });
    } catch (error) {
      console.error("Refresh error:", error);
      res.status(500).json({ message: "Token refresh failed" });
    }
  });

  // Notification endpoints
  app.get(
    "/api/notifications",
    isAuthenticated,
    async (req: Request, res: Response) => {
      try {
        const rows = await notificationService.getNotifications(req, res);
        res.json(rows);
      } catch (err) {
        console.error("Error fetching notifications:", err);
        res.status(500).json({ message: "Failed to fetch notifications" });
      }
    },
  );

  // GET unread count
  app.get(
    "/api/notifications/unread/count",
    isAuthenticated,
    async (req: Request, res: Response) => {
      try {
        const count = await notificationService.getUnreadNotificationsCount(
          req,
          res,
        );
        res.json({ count });
      } catch (err) {
        console.error("Error fetching unread notification count:", err);
        res
          .status(500)
          .json({ message: "Failed to fetch unread notification count" });
      }
    },
  );

  // POST mark all read
  app.post(
    "/api/notifications/all/read",
    isAuthenticated,
    async (req: Request, res: Response) => {
      try {
        await notificationService.markAllNotificationsAsRead(req, res);
        res.json({ success: true });
      } catch (err) {
        console.error("Error marking all notifications as read:", err);
        res
          .status(500)
          .json({ message: "Failed to mark all notifications as read" });
      }
    },
  );

  // POST single notification as read
  app.post(
    "/api/notifications/:id/read",
    isAuthenticated,
    async (req: Request, res: Response) => {
      try {
        const notifId = parseInt(req.params.id, 10);
        const updated = await notificationService.markNotificationAsRead(
          req,
          res,
          notifId,
        );
        if (!updated) {
          return res.status(404).json({ message: "Notification not found" });
        }
        res.json(updated);
      } catch (err: any) {
        console.error("Error marking notification as read:", err);
        if (err.message === "Unauthorized") {
          return res
            .status(403)
            .json({ message: "Cannot modify others’ notifications" });
        }
        res
          .status(500)
          .json({ message: "Failed to mark notification as read" });
      }
    },
  );

  // Note: Catch-all route removed - Vite handles this in development

  const httpServer = createServer(app);

  // Initialize WebSocket server
  const messagingWS = new MessagingWebSocket(httpServer);

  return httpServer;
}
