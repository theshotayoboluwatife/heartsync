import {
  users,
  profiles,
  ratings,
  swipes,
  matches,
  miniChallenges,
  challengeResponses,
  matchConversations,
  messages,
  messageReactions,
  achievements,
  userAchievements,
  type User,
  type UpsertUser,
  type Profile,
  type InsertProfile,
  type Rating,
  type InsertRating,
  type Swipe,
  type InsertSwipe,
  type MiniChallenge,
  type InsertMiniChallenge,
  type ChallengeResponse,
  type InsertChallengeResponse,
  type MatchConversation,
  type InsertMatchConversation,
  type Message,
  type InsertMessage,
  type MessageReaction,
  type InsertMessageReaction,
  type Achievement,
  type InsertAchievement,
  type UserAchievement,
  type InsertUserAchievement,
  type ProfileWithUser,
} from "@shared/schema";
import { db } from "./db";
import { notificationService } from "./notification_service";

import { eq, and, ne, notInArray, desc, avg, count, inArray } from "drizzle-orm";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  getUserByStripeCustomerId(stripeCustomerId: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUser(userId: string, updates: Partial<UpsertUser>): Promise<User>;
  updateUserStripeInfo(userId: string, stripeCustomerId: string, stripeSubscriptionId: string): Promise<User>;
  
  // Profile operations
  getProfile(userId: string): Promise<Profile | undefined>;
  createProfile(profile: InsertProfile): Promise<Profile>;
  updateProfile(userId: string, profile: Partial<InsertProfile>): Promise<Profile>;
  
  // Discovery operations
  getDiscoverableProfiles(userId: string, limit?: number): Promise<ProfileWithUser[]>;
  getProfileWithDetails(userId: string): Promise<ProfileWithUser | undefined>;
  
  // Rating operations
  createRating(rating: InsertRating): Promise<Rating>;
  getRatingsForUser(userId: string): Promise<(Rating & { rater: User })[]>;
  getUserRatings(userId: string): Promise<Rating[]>;
  getAverageRating(userId: string): Promise<{ average: number; count: number }>;
  
  // Swipe operations
  createSwipe(swipe: InsertSwipe): Promise<Swipe>;
  getSwipesBetweenUsers(user1Id: string, user2Id: string): Promise<Swipe[]>;
  hasUserSwiped(swiperId: string, swipedUserId: string): Promise<boolean>;
  
  // Match operations
  createMatch(user1Id: string, user2Id: string): Promise<void>;
  getUserMatches(userId: string): Promise<ProfileWithUser[]>;
  
  // Mini-challenge operations
  getMiniChallenges(category?: string): Promise<MiniChallenge[]>;
  createChallengeResponse(response: InsertChallengeResponse): Promise<ChallengeResponse>;
  getUserChallengeResponses(userId: string): Promise<(ChallengeResponse & { challenge: MiniChallenge })[]>;
  getRandomChallenge(excludeAnswered?: string[]): Promise<MiniChallenge | null>;
  createMatchConversation(conversation: InsertMatchConversation): Promise<MatchConversation>;
  getMatchConversations(matchId: string): Promise<(MatchConversation & { challenge: MiniChallenge })[]>;
  
  // Messaging operations
  sendMessage(message: InsertMessage): Promise<Message>;
  getMessages(matchId: string, limit?: number): Promise<(Message & { sender: User; recipient: User })[]>;
  markMessageAsRead(messageId: number, userId: string): Promise<void>;
  getUnreadMessageCount(userId: string): Promise<number>;
  deleteMessage(messageId: number, userId: string): Promise<void>;
  
  // Message reactions
  addMessageReaction(reaction: InsertMessageReaction): Promise<MessageReaction>;
  removeMessageReaction(messageId: number, userId: string): Promise<void>;
  getMessageReactions(messageId: number): Promise<(MessageReaction & { user: User })[]>;
  
  // Achievement operations
  getAchievements(): Promise<Achievement[]>;
  createAchievement(achievement: InsertAchievement): Promise<Achievement>;
  getUserAchievements(userId: string): Promise<(UserAchievement & { achievement: Achievement })[]>;
  updateUserAchievementProgress(userId: string, achievementId: number, progress: number): Promise<UserAchievement>;
  unlockAchievement(userId: string, achievementId: number): Promise<UserAchievement>;
  getProfileCompletionScore(userId: string): Promise<{ score: number; maxScore: number; percentage: number }>;
  checkAndUpdateAchievements(userId: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByStripeCustomerId(stripeCustomerId: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.stripeCustomerId, stripeCustomerId));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async updateUser(userId: string, updates: Partial<UpsertUser>): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }



  // Profile operations
  async getProfile(userId: string): Promise<Profile | undefined> {
    const [profile] = await db
      .select()
      .from(profiles)
      .where(eq(profiles.userId, userId));
    return profile;
  }

  async createProfile(profile: InsertProfile): Promise<Profile> {
    const [newProfile] = await db
      .insert(profiles)
      .values(profile)
      .returning();
    return newProfile;
  }

  async updateProfile(userId: string, profileData: Partial<InsertProfile>): Promise<Profile> {
    const [updatedProfile] = await db
      .update(profiles)
      .set({ ...profileData, updatedAt: new Date() })
      .where(eq(profiles.userId, userId))
      .returning();
    return updatedProfile;
  }

  // Discovery operations
  async getDiscoverableProfiles(userId: string, limit = 10): Promise<ProfileWithUser[]> {
    const userProfile = await this.getProfile(userId);
    if (!userProfile) return [];

    // Get users already swiped on
    const swipedUsers = await db
      .select({ swipedUserId: swipes.swipedUserId })
      .from(swipes)
      .where(eq(swipes.swiperId, userId));

    const swipedUserIds = swipedUsers.map(s => s.swipedUserId);

    // Get profiles of opposite gender that haven't been swiped on
    const profilesQuery = db
      .select()
      .from(profiles)
      .innerJoin(users, eq(profiles.userId, users.id))
      .where(
        and(
          ne(profiles.userId, userId),
          eq(profiles.gender, userProfile.gender === 'male' ? 'female' : 'male'),
          eq(profiles.isActive, true),
          swipedUserIds.length > 0 ? notInArray(profiles.userId, swipedUserIds) : undefined
        )
      )
      .limit(limit);

    const profilesWithUsers = await profilesQuery;

    // Get ratings for each profile
    const result: ProfileWithUser[] = [];
    for (const item of profilesWithUsers) {
      const avgRating = await this.getAverageRating(item.profiles.userId);
      const recentRatings = await db
        .select()
        .from(ratings)
        .innerJoin(users, eq(ratings.raterId, users.id))
        .where(eq(ratings.ratedUserId, item.profiles.userId))
        .orderBy(desc(ratings.createdAt))
        .limit(3);

      result.push({
        ...item.profiles,
        user: item.users,
        averageRating: avgRating.average,
        ratingCount: avgRating.count,
        recentRatings: recentRatings.map(r => ({ ...r.ratings, rater: r.users })),
        isOnline: Math.random() > 0.3, // Mock online status
      });
      console.log('ths is result:', result);
    }

    return result;
  }

  async getProfileWithDetails(userId: string): Promise<ProfileWithUser | undefined> {
    const [profileWithUser] = await db
      .select()
      .from(profiles)
      .innerJoin(users, eq(profiles.userId, users.id))
      .where(eq(profiles.userId, userId));

    if (!profileWithUser) return undefined;

    const avgRating = await this.getAverageRating(userId);
    const recentRatings = await db
      .select()
      .from(ratings)
      .innerJoin(users, eq(ratings.raterId, users.id))
      .where(eq(ratings.ratedUserId, userId))
      .orderBy(desc(ratings.createdAt))
      .limit(5);

    return {
      ...profileWithUser.profiles,
      user: profileWithUser.users,
      averageRating: avgRating.average,
      ratingCount: avgRating.count,
      recentRatings: recentRatings.map(r => ({ ...r.ratings, rater: r.users })),
      isOnline: Math.random() > 0.3, // Mock online status
    };
  }

  // Rating operations
  async createRating(rating: InsertRating): Promise<Rating> {
    const [newRating] = await db
      .insert(ratings)
      .values(rating)
      .returning();
    return newRating;
  }

  async getRatingsForUser(userId: string): Promise<(Rating & { rater: User })[]> {
    const result = await db
      .select()
      .from(ratings)
      .innerJoin(users, eq(ratings.raterId, users.id))
      .where(eq(ratings.ratedUserId, userId))
      .orderBy(desc(ratings.createdAt));

    return result.map(r => ({ ...r.ratings, rater: r.users }));
  }

  async getUserRatings(userId: string): Promise<Rating[]> {
    return await db
      .select()
      .from(ratings)
      .where(eq(ratings.raterId, userId))
      .orderBy(desc(ratings.createdAt));
  }

  async getAverageRating(userId: string): Promise<{ average: number; count: number }> {
    const [result] = await db
      .select({
        average: avg(ratings.score),
        count: count(),
      })
      .from(ratings)
      .where(eq(ratings.ratedUserId, userId));

    return {
      average: result.average ? parseFloat(result.average) : 0,
      count: result.count || 0,
    };
  }

  // Swipe operations
  async createSwipe(swipe: InsertSwipe): Promise<Swipe> {
    const [newSwipe] = await db
      .insert(swipes)
      .values(swipe)
      .returning();
    return newSwipe;
  }

  async getSwipesBetweenUsers(user1Id: string, user2Id: string): Promise<Swipe[]> {
    return await db
      .select()
      .from(swipes)
      .where(
        and(
          eq(swipes.swiperId, user1Id),
          eq(swipes.swipedUserId, user2Id)
        )
      );
  }

  async hasUserSwiped(swiperId: string, swipedUserId: string): Promise<boolean> {
    const [swipe] = await db
      .select()
      .from(swipes)
      .where(
        and(
          eq(swipes.swiperId, swiperId),
          eq(swipes.swipedUserId, swipedUserId)
        )
      );
    return !!swipe;
  }

  // Match operations
  async createMatch(user1Id: string, user2Id: string): Promise<void> {
    await db.insert(matches).values({
      user1Id,
      user2Id,
    });
  }

  async getUserMatches(userId: string): Promise<ProfileWithUser[]> {
    const matchesResult = await db
      .select()
      .from(matches)
      .where(
        and(
          eq(matches.user1Id, userId)
        )
      );

    const matchedUserIds = matchesResult.map(m => m.user2Id);
    if (matchedUserIds.length === 0) return [];

    const matchedProfiles = await db
      .select()
      .from(profiles)
      .innerJoin(users, eq(profiles.userId, users.id))
      .where(inArray(profiles.userId, matchedUserIds));

    const result: ProfileWithUser[] = [];
    for (const item of matchedProfiles) {
      const avgRating = await this.getAverageRating(item.profiles.userId);
      result.push({
        ...item.profiles,
        user: item.users,
        averageRating: avgRating.average,
        ratingCount: avgRating.count,
        isOnline: Math.random() > 0.3, // Mock online status
      });
    }

    return result;
  }

  async updateUserStripeInfo(userId: string, stripeCustomerId: string, stripeSubscriptionId: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({
        stripeCustomerId,
        stripeSubscriptionId,
        subscriptionStatus: 'active',
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  // Mini-challenge operations
  async getMiniChallenges(category?: string): Promise<MiniChallenge[]> {
    const query = db
      .select()
      .from(miniChallenges)
      .where(eq(miniChallenges.isActive, true));
    
    if (category) {
      query.where(eq(miniChallenges.category, category));
    }
    
    return await query;
  }

  async createChallengeResponse(response: InsertChallengeResponse): Promise<ChallengeResponse> {
    const [challengeResponse] = await db
      .insert(challengeResponses)
      .values(response)
      .returning();
    return challengeResponse;
  }

  async getUserChallengeResponses(userId: string): Promise<(ChallengeResponse & { challenge: MiniChallenge })[]> {
    return await db
      .select({
        id: challengeResponses.id,
        userId: challengeResponses.userId,
        challengeId: challengeResponses.challengeId,
        response: challengeResponses.response,
        createdAt: challengeResponses.createdAt,
        challenge: miniChallenges,
      })
      .from(challengeResponses)
      .innerJoin(miniChallenges, eq(challengeResponses.challengeId, miniChallenges.id))
      .where(eq(challengeResponses.userId, userId))
      .orderBy(desc(challengeResponses.createdAt));
  }

  async getRandomChallenge(excludeAnswered?: string[]): Promise<MiniChallenge | null> {
    let query = db
      .select()
      .from(miniChallenges)
      .where(eq(miniChallenges.isActive, true));
    
    if (excludeAnswered && excludeAnswered.length > 0) {
      query = query.where(notInArray(miniChallenges.id, excludeAnswered.map(id => parseInt(id))));
    }
    
    const challenges = await query;
    
    if (challenges.length === 0) return null;
    
    // Return a random challenge
    const randomIndex = Math.floor(Math.random() * challenges.length);
    return challenges[randomIndex];
  }

  async createMatchConversation(conversation: InsertMatchConversation): Promise<MatchConversation> {
    const [matchConversation] = await db
      .insert(matchConversations)
      .values(conversation)
      .returning();
    return matchConversation;
  }

  async getMatchConversations(matchId: string): Promise<(MatchConversation & { challenge: MiniChallenge })[]> {
    return await db
      .select({
        id: matchConversations.id,
        matchId: matchConversations.matchId,
        challengeId: matchConversations.challengeId,
        initiatorId: matchConversations.initiatorId,
        status: matchConversations.status,
        createdAt: matchConversations.createdAt,
        challenge: miniChallenges,
      })
      .from(matchConversations)
      .innerJoin(miniChallenges, eq(matchConversations.challengeId, miniChallenges.id))
      .where(eq(matchConversations.matchId, matchId))
      .orderBy(desc(matchConversations.createdAt));
  }

  // Achievement operations
  async getAchievements(): Promise<Achievement[]> {
    return await db
      .select()
      .from(achievements)
      .where(eq(achievements.isActive, true))
      .orderBy(achievements.category, achievements.points);
  }

  async createAchievement(achievement: InsertAchievement): Promise<Achievement> {
    const [result] = await db
      .insert(achievements)
      .values(achievement)
      .returning();
    return result;
  }

  async getUserAchievements(userId: string): Promise<(UserAchievement & { achievement: Achievement })[]> {
    return await db
      .select({
        id: userAchievements.id,
        userId: userAchievements.userId,
        achievementId: userAchievements.achievementId,
        unlockedAt: userAchievements.unlockedAt,
        progress: userAchievements.progress,
        maxProgress: userAchievements.maxProgress,
        isCompleted: userAchievements.isCompleted,
        achievement: {
          id: achievements.id,
          key: achievements.key,
          title: achievements.title,
          description: achievements.description,
          icon: achievements.icon,
          category: achievements.category,
          points: achievements.points,
          condition: achievements.condition,
          isActive: achievements.isActive,
          createdAt: achievements.createdAt,
        },
      })
      .from(userAchievements)
      .innerJoin(achievements, eq(userAchievements.achievementId, achievements.id))
      .where(eq(userAchievements.userId, userId))
      .orderBy(desc(userAchievements.unlockedAt));
  }

  async updateUserAchievementProgress(userId: string, achievementId: number, progress: number): Promise<UserAchievement> {
    const [existing] = await db
      .select()
      .from(userAchievements)
      .where(and(
        eq(userAchievements.userId, userId),
        eq(userAchievements.achievementId, achievementId)
      ));

    if (existing) {
      const [updated] = await db
        .update(userAchievements)
        .set({
          progress,
          isCompleted: progress >= existing.maxProgress
        })
        .where(eq(userAchievements.id, existing.id))
        .returning();
      return updated;
    } else {
      const [created] = await db
        .insert(userAchievements)
        .values({
          userId,
          achievementId,
          progress,
          maxProgress: 1,
          isCompleted: progress >= 1
        })
        .returning();
      return created;
    }
  }

  async unlockAchievement(userId: string, achievementId: number): Promise<UserAchievement> {
    const [existing] = await db
      .select()
      .from(userAchievements)
      .where(and(
        eq(userAchievements.userId, userId),
        eq(userAchievements.achievementId, achievementId)
      ));

    // Fetch the achievement name for the notification message
    const [achievement] = await db
      .select()
      .from(achievements)
      .where(eq(achievements.id, achievementId));

    if (existing && !existing.isCompleted) {
      const [updated] = await db
        .update(userAchievements)
        .set({
          progress: existing.maxProgress,
          isCompleted: true,
          unlockedAt: new Date()
        })
        .where(eq(userAchievements.id, existing.id))
        .returning();

      // 🔔 Send notification
      await notificationService.createNotification({
        userId,
        type: "achievement_unlocked",
        content: `You unlocked the “${achievement?.title || "an achievement"}” achievement!`,
        relatedId: achievementId,
        payload: { achievementKey: achievement?.key },
      });

      return updated;
    } else if (!existing) {
      const [created] = await db
        .insert(userAchievements)
        .values({
          userId,
          achievementId,
          progress: 1,
          maxProgress: 1,
          isCompleted: true,
          unlockedAt: new Date()
        })
        .returning();

      // 🔔 Send notification for new achievement
      await notificationService.createNotification({
        userId,
        type: "achievement_unlocked",
        content: `You unlocked the “${achievement?.title || "an achievement"}” achievement!`,
        relatedId: achievementId,
        payload: { achievementKey: achievement?.key },
      });

      return created;
    }

    return existing;
  }


  async checkAndUpdateAchievements(userId: string): Promise<void> {
    const allAchievements = await this.getAchievements();
    const userAchievements = await this.getUserAchievements(userId);
    const completedAchievementIds = new Set(
      userAchievements.filter(ua => ua.isCompleted).map(ua => ua.achievementId)
    );

    for (const achievement of allAchievements) {
      if (completedAchievementIds.has(achievement.id)) continue;

      const condition = achievement.condition as any;
      let shouldUnlock = false;

      switch (achievement.key) {
        case 'profile_complete':
          const completion = await this.getProfileCompletionScore(userId);
          shouldUnlock = completion.percentage >= 100;
          console.log('should unlock profileComplete achievement', shouldUnlock);
          break;

        case 'first_photo':
          const [userProfile] = await db
            .select()
            .from(profiles)
            .where(eq(profiles.userId, userId));

          shouldUnlock = !!userProfile?.profileImageUrl;
          break;

        case 'bio_writer':
          const [profile] = await db.select().from(profiles).where(eq(profiles.userId, userId));
          shouldUnlock = !!(profile?.bio && profile.bio.trim().length > 20);
          break;

        case 'challenge_participant':
          const responses = await db
            .select({ count: count() })
            .from(challengeResponses)
            .where(eq(challengeResponses.userId, userId));
          shouldUnlock = responses[0]?.count >= 1;
          break;

        case 'social_butterfly':
          const challengeCount = await db
            .select({ count: count() })
            .from(challengeResponses)
            .where(eq(challengeResponses.userId, userId));
          shouldUnlock = challengeCount[0]?.count >= 5;
          break;

        case 'honest_reviewer':
          const ratingsGiven = await db
            .select({ count: count() })
            .from(ratings)
            .where(eq(ratings.raterId, userId));
          shouldUnlock = ratingsGiven[0]?.count >= 3;
          break;
      }

      if (shouldUnlock) {
        await this.unlockAchievement(userId, achievement.id);
      }
    }
  }


  async getProfileCompletionScore(userId: string): Promise<{ score: number; maxScore: number; percentage: number }> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId));

    const [profile] = await db
      .select()
      .from(profiles)
      .where(eq(profiles.userId, userId));

    if (!user) {
      return { score: 0, maxScore: 100, percentage: 0 };
    }

    let score = 0;
    const maxScore = 100;

    // Basic info (30 points)
    if (user.email) score += 10;
    if (user.firstName) score += 10;
    if (profile.profileImageUrl) score += 10;

    // Profile info (70 points)
    if (profile) {
      if (profile.age && profile.age > 0) score += 15;
      if (profile.gender) score += 15;
      if (profile.bio && profile.bio.trim().length > 20) score += 20;
      if (profile.location) score += 10;
      if (profile.occupation) score += 10;
    }

    const percentage = Math.round((score / maxScore) * 100);
    return { score, maxScore, percentage };
  }


  // Messaging operations
  async sendMessage(message: InsertMessage): Promise<Message> {
    const [sentMessage] = await db
      .insert(messages)
      .values(message)
      .returning();
    return sentMessage;
  }

  async getMessages(matchId: string, limit = 50): Promise<(Message & { sender: User; recipient: User })[]> {
    const messagesWithSender = await db
      .select({
        id: messages.id,
        matchId: messages.matchId,
        senderId: messages.senderId,
        recipientId: messages.recipientId,
        content: messages.content,
        messageType: messages.messageType,
        isRead: messages.isRead,
        readAt: messages.readAt,
        createdAt: messages.createdAt,
        sender: users,
      })
      .from(messages)
      .innerJoin(users, eq(messages.senderId, users.id))
      .where(eq(messages.matchId, matchId))
      .orderBy(desc(messages.createdAt))
      .limit(limit);

    // Get recipients for each message
    const recipientIds = [...new Set(messagesWithSender.map(m => m.recipientId))];
    const recipients = await db
      .select()
      .from(users)
      .where(inArray(users.id, recipientIds));

    // Map recipients to messages
    const recipientMap = new Map(recipients.map(r => [r.id, r]));
    
    return messagesWithSender.map(msg => ({
      ...msg,
      recipient: recipientMap.get(msg.recipientId)!,
    }));
  }

  async markMessageAsRead(messageId: number, userId: string): Promise<void> {
    await db
      .update(messages)
      .set({ 
        isRead: true, 
        readAt: new Date() 
      })
      .where(
        and(
          eq(messages.id, messageId),
          eq(messages.recipientId, userId)
        )
      );
  }

  async getUnreadMessageCount(userId: string): Promise<number> {
    const result = await db
      .select({ count: count() })
      .from(messages)
      .where(
        and(
          eq(messages.recipientId, userId),
          eq(messages.isRead, false)
        )
      );
    return result[0]?.count || 0;
  }

  async deleteMessage(messageId: number, userId: string): Promise<void> {
    await db
      .delete(messages)
      .where(
        and(
          eq(messages.id, messageId),
          eq(messages.senderId, userId)
        )
      );
  }

  // Message reactions
  async addMessageReaction(reaction: InsertMessageReaction): Promise<MessageReaction> {
    const [messageReaction] = await db
      .insert(messageReactions)
      .values(reaction)
      .returning();
    return messageReaction;
  }

  async removeMessageReaction(messageId: number, userId: string): Promise<void> {
    await db
      .delete(messageReactions)
      .where(
        and(
          eq(messageReactions.messageId, messageId),
          eq(messageReactions.userId, userId)
        )
      );
  }

  async getMessageReactions(messageId: number): Promise<(MessageReaction & { user: User })[]> {
    return await db
      .select({
        id: messageReactions.id,
        messageId: messageReactions.messageId,
        userId: messageReactions.userId,
        reactionType: messageReactions.reactionType,
        createdAt: messageReactions.createdAt,
        user: users,
      })
      .from(messageReactions)
      .innerJoin(users, eq(messageReactions.userId, users.id))
      .where(eq(messageReactions.messageId, messageId))
      .orderBy(desc(messageReactions.createdAt));
  }
}

export const storage = new DatabaseStorage();
