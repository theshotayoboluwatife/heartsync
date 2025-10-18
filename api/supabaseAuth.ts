import type { Express, RequestHandler } from "express";
import { supabaseAdmin, getSupabase } from "./db";
import { storage } from "./storage";

export async function setupAuth(app: Express) {
  console.log("Supabase Auth setup completed");
}

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: "Missing or invalid authorization header" });
    }

    const token = authHeader.substring(7);
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }

    req.user = {
      claims: {
        sub: user.id,
        email: user.email,
        first_name: user.user_metadata?.first_name || '',
        last_name: user.user_metadata?.last_name || '',
        profile_image_url: user.user_metadata?.avatar_url || '',
      }
    };
     (req as any).supabaseUser = user;

    // Ensure user exists in database (important for all endpoints to work)
    try {
      await storage.upsertUser({
        id: user.id,
        email: user.email || '',
        firstName: user.user_metadata?.first_name || '',
        lastName: user.user_metadata?.last_name || '',
        profileImageUrl: user.user_metadata?.avatar_url || null,
      });
      console.log('✅ User authenticated and upserted');
    } catch (upsertError) {
      console.error('⚠️ User upsert failed:', upsertError);
      // Continue anyway - don't block the request
    }

    next();
  } catch (error) {
    console.error("Auth error:", error);
    res.status(401).json({ message: "Authentication failed" });
  }
};


