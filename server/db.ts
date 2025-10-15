import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { createClient } from '@supabase/supabase-js';
import {
  createServerClient,
  parseCookieHeader,
  serializeCookieHeader,
} from "@supabase/ssr";

const connectionString = process.env.DATABASE_URL!;

const client = postgres(connectionString, { 
  prepare: false,
  ssl: { rejectUnauthorized: false },
  transform: undefined,
  types: {}
});

export const db = drizzle(client);

if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is required");
}

if (!process.env.SUPABASE_URL) {
  throw new Error("SUPABASE_URL environment variable is required");
}

if (!process.env.SUPABASE_ANON_KEY) {
  throw new Error("SUPABASE_ANON_KEY environment variable is required");
}

if (!process.env.SUPABASE_SERVICE_KEY) {
  throw new Error("SUPABASE_SERVICE_KEY environment variable is required");
}


// Create Supabase client for client-side auth (frontend operations)
export const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY, // Use anon key for client-side auth
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    }
  }
);

// Create Supabase admin client for server-side operations (backend token validation)
export const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY, // Use service key for backend operations
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

export function getSupabase(req: Request, res: Response) {
  return createServerClient(  process.env.SUPABASE_URL,  process.env.SUPABASE_SERVICE_KEY, {
    cookies: {
      getAll() {
        return parseCookieHeader(req.headers.cookie ?? "");
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) =>
          res.append("Set-Cookie", serializeCookieHeader(name, value, options)),
        );
      },
    },
  });
}


export const createSupabaseDatabase = () => db;