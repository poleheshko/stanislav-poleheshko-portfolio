import { supabase } from "./supabaseClient";
import { withTimeout } from "./withTimeout";

export async function signInWithPassword(email, password) {
  const { data, error } = await withTimeout(supabase.auth.signInWithPassword({ email, password }));
  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await withTimeout(supabase.auth.signOut());
  if (error) throw error;
}

export async function getSession() {
  const { data, error } = await withTimeout(supabase.auth.getSession());
  if (error) throw error;
  return data.session;
}

// Always re-derived live from Supabase — never cache this across a
// navigation, since it must reflect the *current* enrolled-factor state.
export async function getAssuranceLevel() {
  const { data, error } = await withTimeout(supabase.auth.mfa.getAuthenticatorAssuranceLevel());
  if (error) throw error;
  return data; // { currentLevel, nextLevel, currentAuthenticationMethods }
}

export async function listTotpFactors() {
  const { data, error } = await withTimeout(supabase.auth.mfa.listFactors());
  if (error) throw error;
  return data.totp ?? [];
}

export async function challengeAndVerify(factorId, code) {
  const { data, error } = await withTimeout(supabase.auth.mfa.challengeAndVerify({ factorId, code }));
  if (error) throw error;
  return data;
}

export async function enrollTotp() {
  const { data, error } = await withTimeout(supabase.auth.mfa.enroll({ factorType: "totp" }));
  if (error) throw error;
  return data; // { id, totp: { qr_code, secret, uri } }
}

export async function unenrollFactor(factorId) {
  const { error } = await withTimeout(supabase.auth.mfa.unenroll({ factorId }));
  if (error) throw error;
}
