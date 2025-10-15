import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  integer,
  decimal,
  boolean,
  serial,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);



export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  profileImagePath: varchar("profile_image_path"),
  stripeCustomerId: varchar("stripe_customer_id"),
  stripeSubscriptionId: varchar("stripe_subscription_id"),
  subscriptionStatus: varchar("subscription_status").default("free"), // free, trialing, active, past_due, canceled
  isPremium: boolean("is_premium").default(false), // Add this - it's in your DB
  hasUsedFreeTrial: boolean("has_used_free_trial").default(false),
  trialStartDate: timestamp("trial_start_date", { withTimezone: true }),
  trialEndDate: timestamp("trial_end_date", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

// User profiles with additional dating app information
export const profiles = pgTable("profiles", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  age: integer("age").notNull(),
  gender: varchar("gender").notNull(), // 'male' or 'female'
  occupation: varchar("occupation"),
  bio: text("bio"),
  location: varchar("location"),
  profileImageUrl: varchar("profile_image_url"),
  profileImageThumbnailUrl: varchar("profile_image_thumbnail_url"),
  isProfileImageVerified: boolean("is_profile_image_verified").default(false),
  profileImageVerificationStatus: varchar("profile_image_verification_status").default("no_profile"), // pending, approved, rejected
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Honesty ratings given by women to men
export const ratings = pgTable("ratings", {
  id: serial("id").primaryKey(),
  raterId: varchar("rater_id").references(() => users.id).notNull(), // Woman giving the rating
  ratedUserId: varchar("rated_user_id").references(() => users.id).notNull(), // Man being rated
  score: decimal("score", { precision: 3, scale: 1 }).notNull(), // 1.0 to 5.0
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Matches between users
export const matches = pgTable("matches", {
  id: serial("id").primaryKey(),
  user1Id: varchar("user1_id").references(() => users.id).notNull(),
  user2Id: varchar("user2_id").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// User swipes/interactions
export const swipes = pgTable("swipes", {
  id: serial("id").primaryKey(),
  swiperId: varchar("swiper_id").references(() => users.id).notNull(),
  swipedUserId: varchar("swiped_user_id").references(() => users.id).notNull(),
  liked: boolean("liked").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Mini-challenges for conversation starters
export const miniChallenges = pgTable("mini_challenges", {
  id: serial("id").primaryKey(),
  title: varchar("title").notNull(),
  description: text("description").notNull(),
  category: varchar("category").notNull(), // 'this_or_that', 'quick_question', 'fun_fact', 'preference'
  options: jsonb("options"), // For multiple choice questions
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// User responses to mini-challenges
export const challengeResponses = pgTable("challenge_responses", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  challengeId: integer("challenge_id").references(() => miniChallenges.id).notNull(),
  response: text("response").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Match conversations with mini-challenges
export const matchConversations = pgTable("match_conversations", {
  id: serial("id").primaryKey(),
  matchId: varchar("match_id").notNull(), // Composite key of user IDs
  challengeId: integer("challenge_id").references(() => miniChallenges.id),
  initiatorId: varchar("initiator_id").references(() => users.id).notNull(),
  status: varchar("status").default("active"), // active, completed, skipped
  createdAt: timestamp("created_at").defaultNow(),
});

// Real-time messages between matched users
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  matchId: varchar("match_id").notNull(), // Composite key of user IDs
  senderId: varchar("sender_id").references(() => users.id).notNull(),
  recipientId: varchar("recipient_id").references(() => users.id).notNull(),
  content: text("content").notNull(),
  messageType: varchar("message_type").default("text"), // text, image, emoji
  isRead: boolean("is_read").default(false),
  readAt: timestamp("read_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Message reactions (like, love, laugh, etc.)
export const messageReactions = pgTable("message_reactions", {
  id: serial("id").primaryKey(),
  messageId: integer("message_id").references(() => messages.id).notNull(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  reactionType: varchar("reaction_type").notNull(), // like, love, laugh, wow, sad, angry
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  profile: one(profiles, { fields: [users.id], references: [profiles.userId] }),
  ratingsGiven: many(ratings, { relationName: "ratingsGiven" }),
  ratingsReceived: many(ratings, { relationName: "ratingsReceived" }),
  swipesGiven: many(swipes, { relationName: "swipesGiven" }),
  swipesReceived: many(swipes, { relationName: "swipesReceived" }),
  achievements: many(userAchievements),
  messagesSent: many(messages, { relationName: "messagesSent" }),
  messagesReceived: many(messages, { relationName: "messagesReceived" }),
  messageReactions: many(messageReactions),
}));

export const profilesRelations = relations(profiles, ({ one }) => ({
  user: one(users, { fields: [profiles.userId], references: [users.id] }),
}));

export const ratingsRelations = relations(ratings, ({ one }) => ({
  rater: one(users, { fields: [ratings.raterId], references: [users.id], relationName: "ratingsGiven" }),
  ratedUser: one(users, { fields: [ratings.ratedUserId], references: [users.id], relationName: "ratingsReceived" }),
}));

export const swipesRelations = relations(swipes, ({ one }) => ({
  swiper: one(users, { fields: [swipes.swiperId], references: [users.id], relationName: "swipesGiven" }),
  swipedUser: one(users, { fields: [swipes.swipedUserId], references: [users.id], relationName: "swipesReceived" }),
}));

export const miniChallengesRelations = relations(miniChallenges, ({ many }) => ({
  responses: many(challengeResponses),
  conversations: many(matchConversations),
}));

export const challengeResponsesRelations = relations(challengeResponses, ({ one }) => ({
  user: one(users, { fields: [challengeResponses.userId], references: [users.id] }),
  challenge: one(miniChallenges, { fields: [challengeResponses.challengeId], references: [miniChallenges.id] }),
}));

export const matchConversationsRelations = relations(matchConversations, ({ one }) => ({
  challenge: one(miniChallenges, { fields: [matchConversations.challengeId], references: [miniChallenges.id] }),
  initiator: one(users, { fields: [matchConversations.initiatorId], references: [users.id] }),
}));

export const messagesRelations = relations(messages, ({ one, many }) => ({
  sender: one(users, { fields: [messages.senderId], references: [users.id], relationName: "messagesSent" }),
  recipient: one(users, { fields: [messages.recipientId], references: [users.id], relationName: "messagesReceived" }),
  reactions: many(messageReactions),
}));

export const messageReactionsRelations = relations(messageReactions, ({ one }) => ({
  message: one(messages, { fields: [messageReactions.messageId], references: [messages.id] }),
  user: one(users, { fields: [messageReactions.userId], references: [users.id] }),
}));

// Achievement system tables
export const achievements = pgTable("achievements", {
  id: serial("id").primaryKey(),
  key: varchar("key").notNull().unique(),
  title: varchar("title").notNull(),
  description: text("description").notNull(),
  icon: varchar("icon").notNull(),
  category: varchar("category").notNull(),
  points: integer("points").default(10),
  condition: jsonb("condition").notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
}); 

export const userAchievements = pgTable("user_achievements", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  achievementId: integer("achievement_id").references(() => achievements.id),
  unlockedAt: timestamp("unlocked_at").defaultNow(),
  progress: integer("progress").default(0),
  maxProgress: integer("max_progress").default(1),
  isCompleted: boolean("is_completed").default(false),
}, (table) => [
  index("idx_user_achievements_user_id").on(table.userId),
  index("idx_user_achievements_completed").on(table.isCompleted),
]);


export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  type: text("type").notNull(), // 'message', 'friend_request', etc.
  content: text("content").notNull(),
  relatedId: integer("related_id"), // ID of related message, friend request, etc.
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Achievement relations
export const achievementsRelations = relations(achievements, ({ many }) => ({
  userAchievements: many(userAchievements),
}));

export const userAchievementsRelations = relations(userAchievements, ({ one }) => ({
  user: one(users, { fields: [userAchievements.userId], references: [users.id] }),
  achievement: one(achievements, { fields: [userAchievements.achievementId], references: [achievements.id] }),
}));

// Zod schemas
export const insertProfileSchema = createInsertSchema(profiles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertRatingSchema = createInsertSchema(ratings).omit({
  id: true,
  createdAt: true,
});

export const insertSwipeSchema = createInsertSchema(swipes).omit({
  id: true,
  createdAt: true,
});

export const insertMiniChallengeSchema = createInsertSchema(miniChallenges).omit({
  id: true,
  createdAt: true,
});

export const insertChallengeResponseSchema = createInsertSchema(challengeResponses).omit({
  id: true,
  createdAt: true,
});

export const insertMatchConversationSchema = createInsertSchema(matchConversations).omit({
  id: true,
  createdAt: true,
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  createdAt: true,
  isRead: true,
  readAt: true,
});

export const insertMessageReactionSchema = createInsertSchema(messageReactions).omit({
  id: true,
  createdAt: true,
});

export const insertAchievementSchema = createInsertSchema(achievements).omit({
  id: true,
  createdAt: true,
});

export const insertUserAchievementSchema = createInsertSchema(userAchievements).omit({
  id: true,
  unlockedAt: true,
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
  isRead: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type Profile = typeof profiles.$inferSelect;
export type InsertProfile = z.infer<typeof insertProfileSchema>;
export type Rating = typeof ratings.$inferSelect;
export type InsertRating = z.infer<typeof insertRatingSchema>;
export type Swipe = typeof swipes.$inferSelect;
export type InsertSwipe = z.infer<typeof insertSwipeSchema>;
export type MiniChallenge = typeof miniChallenges.$inferSelect;
export type InsertMiniChallenge = z.infer<typeof insertMiniChallengeSchema>;
export type ChallengeResponse = typeof challengeResponses.$inferSelect;
export type InsertChallengeResponse = z.infer<typeof insertChallengeResponseSchema>;
export type MatchConversation = typeof matchConversations.$inferSelect;
export type InsertMatchConversation = z.infer<typeof insertMatchConversationSchema>;

export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;

export type MessageReaction = typeof messageReactions.$inferSelect;
export type InsertMessageReaction = z.infer<typeof insertMessageReactionSchema>;
export type Achievement = typeof achievements.$inferSelect;
export type InsertAchievement = z.infer<typeof insertAchievementSchema>;
export type UserAchievement = typeof userAchievements.$inferSelect;
export type InsertUserAchievement = z.infer<typeof insertUserAchievementSchema>;

// Extended types for UI
export type ProfileWithUser = Profile & {
  user: User;
  averageRating?: number;
  ratingCount?: number;
  recentRatings?: (Rating & { rater: User })[];
  isOnline?: boolean;
};

export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type Notification = typeof notifications.$inferSelect;