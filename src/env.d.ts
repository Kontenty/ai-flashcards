/// <reference types="astro/client" />

import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "./db/database.types";

declare global {
  namespace App {
    interface Locals {
      supabase: SupabaseClient<Database>;
      user?: {
        id: string;
        email: string;
      };
    }
  }
}

interface ImportMetaEnv {
  readonly SUPABASE_URL: string;
  readonly SUPABASE_KEY: string;
  readonly OPEN_ROUTER_API_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
