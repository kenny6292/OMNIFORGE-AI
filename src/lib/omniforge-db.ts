import { supabase } from "./supabase";

export async function createProject(input: { name: string; description?: string; projectType?: string }) {
  if (!supabase) throw new Error("Supabase is not configured.");
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("You must be signed in.");
  const { data, error } = await supabase.from("omniforge_projects").insert({
    user_id: user.id, name: input.name, description: input.description ?? "", project_type: input.projectType ?? "Game"
  }).select().single();
  if (error) throw error;
  return data;
}
export async function listProjects() {
  if (!supabase) throw new Error("Supabase is not configured.");
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  const { data, error } = await supabase.from("omniforge_projects").select("*").eq("user_id", user.id).order("updated_at",{ascending:false});
  if (error) throw error; return data ?? [];
}
export async function createGeneration(input:{prompt:string;generationType:string;projectId?:string;parameters?:Record<string,unknown>}) {
  if (!supabase) throw new Error("Supabase is not configured.");
  const { data:{user} }=await supabase.auth.getUser();
  if(!user) throw new Error("You must be signed in.");
  const {data,error}=await supabase.from("omniforge_generations").insert({
    user_id:user.id, project_id:input.projectId || null, prompt:input.prompt,
    generation_type:input.generationType, provider:"pending", model:null, status:"queued",
    parameters:input.parameters ?? {}
  }).select().single();
  if(error) throw error; return data;
}
export async function listGenerations() {
  if (!supabase) throw new Error("Supabase is not configured.");
  const {data:{user}}=await supabase.auth.getUser(); if(!user)return [];
  const {data,error}=await supabase.from("omniforge_generations").select("*").eq("user_id",user.id).order("created_at",{ascending:false});
  if(error)throw error; return data ?? [];
}