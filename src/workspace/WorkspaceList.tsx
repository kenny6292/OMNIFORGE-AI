import { useEffect, useState } from "react";
import { ArrowLeft, Box, FolderKanban, Loader2, WandSparkles } from "lucide-react";
import { listProjects, listGenerations } from "../lib/omniforge-db";

export function WorkspaceList({ kind, onBack, onCreate }: { kind:"projects"|"generations"; onBack:()=>void; onCreate:()=>void }) {
  const [items,setItems]=useState<any[]>([]);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState("");
  useEffect(()=>{(async()=>{try{setItems(kind==="projects"?await listProjects():await listGenerations())}catch(e:any){setError(e?.message||"Unable to load data.")}finally{setLoading(false)}})()},[kind]);
  const title=kind==="projects"?"Projects":"Generation History";
  return <div className="workspace workspace-list-page">
    <header className="creation-header"><button className="secondary" onClick={onBack}><ArrowLeft size={15}/>Workspace</button><div className="creation-title"><div className="eyebrow">{kind==="projects"?<FolderKanban size={14}/>:<WandSparkles size={14}/>} WORKSPACE</div><h1>{title}</h1><p>{kind==="projects"?"Manage your 3D projects in one place.":"Review every AI generation job and its current status."}</p></div><button className="primary" onClick={onCreate}>{kind==="projects"?"New Project":"Create with AI"}</button></header>
    <section className="workspace-main list-main">{loading?<div className="empty-workspace"><Loader2 className="spin" size={22}/>Loading…</div>:error?<div className="workspace-error">{error}</div>:items.length===0?<div className="empty-workspace"><div className="empty-icon">{kind==="projects"?<FolderKanban size={22}/>:<WandSparkles size={22}/>}</div><h3>No {kind==="projects"?"projects":"generations"} yet</h3><p>{kind==="projects"?"Create your first project to organize assets and scenes.":"Start your first AI generation to see it here."}</p><button className="primary" onClick={onCreate}>{kind==="projects"?"Create Project":"Start Generation"}</button></div>:<div className="project-grid">{items.map(item=><article className="project-card" key={item.id}><div className="project-thumb">{kind==="projects"?<Box size={24}/>:<WandSparkles size={24}/>}</div><div className="project-meta"><span>{kind==="projects"?item.project_type:item.generation_type||"3D Generation"}</span><small>{item.status||"queued"}</small></div><h3>{item.name||item.prompt||"Untitled generation"}</h3><p>{item.description||item.error_message||"No additional details."}</p></article>)}</div>}
    </section>
  </div>;
}