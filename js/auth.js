import { supabase } from './supabase.js';

/**
 * Sign in with email and password
 */
export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

/**
 * Sign out
 */
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

/**
 * Get current session
 */
export async function getSession() {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) throw error;
  return session;
}

/**
 * Check if current user is admin
 */
export async function checkAdmin() {
  const session = await getSession();
  if (!session) return false;
  
  const { data, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', session.user.id)
    .single();
  
  if (error) {
    console.error("Supabase Profile Error:", error);
    // Jika tidak ketemu row (PGRST116), kembalikan false. Jika error lain, throw.
    if (error.code === 'PGRST116') return false;
    throw new Error("Gagal membaca profil: " + error.message);
  }
  
  if (!data) return false;
  return data.role === 'admin';
}

/**
 * Redirect to login if not admin
 */
export async function requireAdmin() {
  const isAdmin = await checkAdmin();
  if (!isAdmin) {
    window.location.href = '/pages/admin/login.html';
    return false;
  }
  return true;
}
