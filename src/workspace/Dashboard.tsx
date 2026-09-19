import { useEffect, useState } from "react";
import { Box, FolderKanban, Layers3, LogOut, Plus, Sparkles, WandSparkles, KeyRound } from "lucide-react";
import { supabase } from "../lib/supabase";
import { createProject, listProjects } from "../lib/omniforge-db";

type Project = { id:string; name:string; description:string; project_type:string; status:string; updated_at:string };

export function Dashboard({ user, onSignOut, onCreate, onStudio, onAssets, onMaterials, onCharacters, onDeveloper }: { user:any; onSignOut:()=>Promise<void>; onCreate:()=>void; onStudio:()=>void; onAssets:()=>void; onMaterials:()=>void; onCharacters:()=>void; onDeveloper:()=>void }) {
  const [projects,setProjects]=useState<Project[]>([]);
  const [assetCount,setAssetCount]=useState(0);
  const [generationCount,setGenerationCount]=useState(0);
  const [credits,setCredits]=useState(0);
  const [loading,setLoading]=useState(true);
  const [showCreate,setShowCreate]=useState(false);
  const [name,setName]=useState("");
  const [type,setType]=useState("Game");
  const [error,setError]=useState("");
  const [saving,setSaving]=useState(false);

  async function load() {
    if (!supabase) return;
    setLoading(true); setError("");
    try {
      const [projectRows, assets, generations, creditRows] = await Promise.all([
        listProjects(),
        supabase.from("omniforge_assets").select("id", { count:"exact", head:true }),
        supabase.from("omniforge_generations").select("id", { count:"exact", head:true }),
        supabase.from("omniforge_credits").select("balance").maybeSingle()
      ]);
      if (assets.error) throw assets.error;
      if (generations.error) throw generations.error;
      if (creditRows.error) throw creditRows.error;
      setProjects(projectRows as Project[]);
      setAssetCount(assets.count ?? 0);
      setGenerationCount(generations.count ?? 0);
      setCredits(creditRows.data?.balance ?? 0);
    } catch (e:any) {
      setError(e?.message ?? "Unable to load workspace data.");
    } finally { setLoading(false); }
  }

  useEffect(()=>{ load(); },[]);

  async function addProject(e:React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true); setError("");
    try {
      await createProject({name:name.trim(), projectType:type});
      setName(""); setShowCreate(false); await load();
    } catch (e:any) { setError(e?.message ?? "Could not create project."); }
    finally { setSaving(false); }
  }

  return <div className="workspace">
    <aside className="workspace-sidebar">
      <button className="workspace-brand"><span className="brand-mark"><Box size={17}/></span>OMNIFORGE <span>AI</span></button>
      <div className="workspace-nav">
        <button className="active"><Sparkles size={16}/>Overview</button>
        <button><FolderKanban size={16}/>Projects</button>
        <button onClick={onAssets}><Box size={16}/>Assets</button>
        <button><WandSparkles size={16}/>Generations</button>
        <button onClick={onStudio}><Layers3 size={16}/>Studio</button><button onClick={onDeveloper}><KeyRound size={16}/>Developer</button><button onClick={onMaterials}><Sparkles size={16}/>Materials</button><button onClick={onCharacters}><WandSparkles size={16}/>Characters</button>
      </div>
      <div className="workspace-user">
        <div className="user-avatar">{(user.email?.[0] ?? "U").toUpperCase()}</div>
        <div><strong>{user.email?.split("@")[0] ?? "Creator"}</strong><small>{user.email}</small></div>
        <button onClick={onSignOut} title="Sign out" aria-label="Sign out"><LogOut size={16}/></button>
      </div>
    </aside>
    <section className="workspace-main">
      <header className="workspace-header"><div><div className="eyebrow">CREATOR WORKSPACE</div><h1>Welcome back.</h1><p>Your OMNIFORGE projects, assets and generation history in one place.</p></div><button className="primary" onClick={onCreate}><WandSparkles size={17}/>Create with AI</button><button className="primary" onClick={()=>setShowCreate(true)}><Plus size={17}/>New Project</button></header>
      {error && <div className="workspace-error">{error}</div>}
      <div className="stats-grid">
        <div className="stat-card"><FolderKanban size={18}/><span>Projects</span><strong>{loading?"—":projects.length}</strong></div>
        <div className="stat-card"><Box size={18}/><span>Assets</span><strong>{loading?"—":assetCount}</strong></div>
        <div className="stat-card"><WandSparkles size={18}/><span>Generations</span><strong>{loading?"—":generationCount}</strong></div>
        <div className="stat-card"><Sparkles size={18}/><span>Credits</span><strong>{loading?"—":credits}</strong></div>
      </div>
      <div className="workspace-section-title"><div><h2>Recent projects</h2><p>Start a project and build your first world.</p></div><button className="text-button" onClick={()=>setShowCreate(true)}>Create project <Plus size={14}/></button></div>
      {loading ? <div className="empty-workspace">Loading workspace…</div> : projects.length===0 ? <div className="empty-workspace"><div className="empty-icon"><FolderKanban size={22}/></div><h3>No projects yet</h3><p>Create your first OMNIFORGE project to begin organizing assets and scenes.</p><button className="primary" onClick={()=>setShowCreate(true)}><Plus size={16}/>Create your first project</button></div> :
        <div className="project-grid">{projects.map(p=><article className="project-card" key={p.id}><div className="project-thumb"><Box size={24}/></div><div className="project-meta"><span>{p.project_type}</span><small>{p.status}</small></div><h3>{p.name}</h3><p>{p.description || "No description yet."}</p></article>)}</div>}
    </section>
    {showCreate && <div className="project-modal" role="dialog" aria-modal="true"><form onSubmit={addProject} className="project-form"><button type="button" className="auth-close" onClick={()=>setShowCreate(false)}>×</button><div className="eyebrow">NEW PROJECT</div><h2>Create a project</h2><p>Set up a workspace for your next digital world.</p><label>Project name<input autoFocus required value={name} onChange={e=>setName(e.target.value)} placeholder="My first world"/></label><label>Project type<select value={type} onChange={e=>setType(e.target.value)}>{["Game","Film","Animation","Architecture","Product Design","VR","AR","Concept Art","Other"].map(x=><option key={x}>{x}</option>)}</select></label><button className="primary auth-submit" disabled={saving}>{saving?"Creating…":"Create Project"}</button></form></div>}
  </div>;
}