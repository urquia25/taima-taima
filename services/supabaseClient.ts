
import { createClient } from 'https://esm.sh/@supabase/supabase-js@^2.48.1';

const supabaseUrl = "https://cxlvzohdcxefmayjdmwm.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN4bHZ6b2hkY3hlZm1heWpkbXdtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY3NTMyNDMsImV4cCI6MjA4MjMyOTI0M30.u0upQf2VIjuVLhDbngqMlGGsrVAY2jBNUZy7IPUoTF0";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
