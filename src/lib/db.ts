// Loosely-typed supabase access until generated types catch up with the migration.
import { supabase as base } from "@/integrations/supabase/client";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const db = base as any;
