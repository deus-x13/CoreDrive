import { createBrowserClient } from "@supabase/ssr"

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn("Supabase environment variables not found. Authentication features will be disabled.")

    // Return a mock client that prevents runtime errors
    return {
      auth: {
        getSession: () => Promise.resolve({ data: { session: null }, error: null }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
        signUp: () =>
          Promise.resolve({
            data: null,
            error: {
              message: "Authentication is not available in preview mode. Please deploy to use authentication features.",
            },
          }),
        signInWithPassword: () =>
          Promise.resolve({
            data: null,
            error: {
              message: "Authentication is not available in preview mode. Please deploy to use authentication features.",
            },
          }),
        signOut: () => Promise.resolve({ error: null }),
        resetPasswordForEmail: () =>
          Promise.resolve({
            error: {
              message: "Authentication is not available in preview mode. Please deploy to use authentication features.",
            },
          }),
      },
      from: () => ({
        select: () => Promise.resolve({ data: [], error: null }),
        insert: () =>
          Promise.resolve({ data: null, error: { message: "Database features not available in preview mode" } }),
        update: () =>
          Promise.resolve({ data: null, error: { message: "Database features not available in preview mode" } }),
        delete: () =>
          Promise.resolve({ data: null, error: { message: "Database features not available in preview mode" } }),
      }),
    } as any
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}
