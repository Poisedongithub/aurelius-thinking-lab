import { supabase } from "@/integrations/supabase/client";

async function getAuthHeaders(): Promise<Record<string, string>> {
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.access_token) {
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.access_token}`,
    };
  }
  return { "Content-Type": "application/json" };
}

export async function apiGet(path: string) {
  const headers = await getAuthHeaders();
  const resp = await fetch(`/api/data/${path}`, { headers });
  if (!resp.ok) throw new Error(`API error: ${resp.status}`);
  return resp.json();
}

export async function apiPost(path: string, body: Record<string, any>) {
  const headers = await getAuthHeaders();
  const resp = await fetch(`/api/data/${path}`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });
  if (!resp.ok) throw new Error(`API error: ${resp.status}`);
  return resp.json();
}

export async function apiPut(path: string, body: Record<string, any>) {
  const headers = await getAuthHeaders();
  const resp = await fetch(`/api/data/${path}`, {
    method: "PUT",
    headers,
    body: JSON.stringify(body),
  });
  if (!resp.ok) throw new Error(`API error: ${resp.status}`);
  return resp.json();
}
