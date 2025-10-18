import type { Request, Response } from "express";
import { getSupabase, supabaseAdmin } from "./db";
import type { InsertNotification, Notification } from "@shared/schema";

export const notificationService = {
  /** Create a new notification */
  createNotification: async (
    notification: InsertNotification,
  ): Promise<Notification> => {
    // const supabase = getSupabase(req, res);
    try {
      console.debug("createNotification called with:", notification);

      const { data, error } = await supabaseAdmin
        .from("notifications")
        .insert({
          user_id: notification.userId,
          type: notification.type,
          content: notification.content,
          relatedId: notification.relatedId,
          payload: notification.payload,
          is_read: false,
          created_at: new Date().toISOString(),
        })
        .select("id, user_id, type, content, payload, is_read, created_at")
        .single();

      if (error) {
        console.error("Supabase error in createNotification:", error);
        throw error;
      }
      if (!data) {
        console.error("No data returned from createNotification.insert");
        throw new Error("Failed to create notification: no data returned");
      }

      console.debug("createNotification succeeded:", data);

      return {
        id: data.id,
        userId: data.user_id,
        type: data.type,
        content: data.content,
        payload: data.payload,
        relatedId: data.relatedId,
        isRead: data.is_read,
        createdAt: data.created_at,
      };
    } catch (err: any) {
      console.error("Error in notificationService.createNotification:", err);
      throw err;
    }
  },

  /** Fetch all notifications for the current user, newest first */
  async getNotifications(req: Request, res: Response): Promise<Notification[]> {
    const supabase = getSupabase(req, res);
    const userId = (req as any).supabaseUser.id;

    const { data, error } = await supabase
      .from("notifications")
      .select(
        "id, user_id, type, payload, is_read, content, relatedId, created_at",
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return data.map((n) => ({
      id: n.id,
      userId: n.user_id,
      type: n.type,
      relatedId: n.relatedId,
      content: n.content,
      payload: n.payload,
      isRead: n.is_read,
      createdAt: n.created_at,
    }));
  },

  /** Return a count of unread notifications */
  async getUnreadNotificationsCount(
    req: Request,
    res: Response,
  ): Promise<number> {
    const supabase = getSupabase(req, res);
    const userId = (req as any).supabaseUser.id;

    const { count, error } = await supabase
      .from("notifications")
      .select("id", { head: true, count: "exact" })
      .eq("user_id", userId)
      .eq("is_read", false);

    if (error) throw error;
    return count ?? 0;
  },

  /** Mark a single notification as read, return it or null if not found */
  async markNotificationAsRead(
    req: Request,
    res: Response,
    notificationId: number,
  ): Promise<Notification | null> {
    const supabase = getSupabase(req, res);
    const userId = (req as any).supabaseUser.id;

    // ensure ownership
    const { data: existing, error: fetchErr } = await supabase
      .from("notifications")
      .select("user_id")
      .eq("id", notificationId)
      .single();

    if (fetchErr) {
      if (fetchErr.code === "PGRST116") return null;
      throw fetchErr;
    }
    if (existing.user_id !== userId) {
      throw new Error("Unauthorized");
    }

    const { data, error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("id", notificationId)
      .select("id, user_id, type, payload, is_read, relatedId, created_at")
      .single();

    if (error) throw error;
    return {
      id: data.id,
      userId: data.user_id,
      type: data.type,
      payload: data.payload,
      relatedId: data.relatedId,
      isRead: data.is_read,
      createdAt: data.created_at,
    };
  },

  /** Mark all of this user’s notifications as read */
  async markAllNotificationsAsRead(req: Request, res: Response): Promise<void> {
    const supabase = getSupabase(req, res);
    const userId = (req as any).supabaseUser.id;

    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", userId)
      .eq("is_read", false);

    if (error) throw error;
  },

  /**
   * Fetch all notifications for a user filtered by type and relatedId, newest first.
   * @param req Express request (for RLS)
   * @param res Express response
   * @param params Object containing userId, type, and relatedId
   */
  getNotificationsByTypeAndRelatedId: async (params: {
    userId: string;
    type: string;
    relatedId: number;
  }): Promise<Notification[]> => {
    try {
      const { userId, type, relatedId } = params;
      console.debug("getNotificationsByTypeAndRelatedId called with:", params);
      //const supabase = getSupabase(req, res);

      const { data, error } = await supabaseAdmin
        .from<Notification>("notifications")
        .select(
          "id, user_id, type, content, payload, is_read, created_at, relatedId",
        )
        .eq("user_id", userId)
        .eq("type", type)
        .eq("relatedId", relatedId);

      if (error) {
        console.error(
          "Supabase error in getNotificationsByTypeAndRelatedId:",
          error,
        );
        throw new Error(error.message);
      }

      const sorted = (data || []).sort((a, b) => {
        return (
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      });

      console.debug(
        "getNotificationsByTypeAndRelatedId result count:",
        sorted.length,
      );
      return sorted;
    } catch (err: any) {
      console.error(
        "Error in notificationService.getNotificationsByTypeAndRelatedId:",
        err,
      );
      throw err;
    }
  },
};
