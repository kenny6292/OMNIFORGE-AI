import { supabase } from "./supabase";

export async function createProject(input: { name: string; description?: string; projectType?: string }) {
  if (!supabase) throw new Error("Supabase is not configured.");
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("You must be signed in.");
  return supabase.from("omniforge_projects").insert({
    user_id: user.id,
    name: input.name,
    description: input.description ?? "",
    project_type: input.projectType ?? "Game"
  }).select().single();
}

export async function listProjects() {
  if (!supabase) throw new Error("Supabase is not configured.");
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  const { data, error } = await supabase.from("omniforge_projects")
    .select("*").eq("user_id", user.id).order("updated_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}
