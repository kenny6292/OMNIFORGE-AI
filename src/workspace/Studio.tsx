import { Canvas } from "@react-three/fiber";
import { OrbitControls, Grid, Environment, useGLTF } from "@react-three/drei";
import { ArrowLeft, Box, Layers3, Settings2, Maximize2, Play, Rotate3D, Save, FolderOpen } from "lucide-react";
import { Suspense, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { listProjects } from "../lib/omniforge-db";

function Model({url}:{url:string}) {
  const { scene } = useGLTF(url);
  return <primitive object={scene} />;
}
function DemoObject() {
  return <mesh rotation={[0.25,0.4,0]}><icosahedronGeometry args={[1.35,2]}/><meshStandardMaterial metalness={0.65} roughness={0.28}/></mesh>;
}
export function Studio({onBack}:{onBack:()=>void}) {
 const [assetUrl,setAssetUrl]=useState("");
 const [mode,setMode]=useState("select");
 const [projects,setProjects]=useState<any[]>([]); const [projectId,setProjectId]=useState(""); const [sceneId,setSceneId]=useState(""); const [sceneName,setSceneName]=useState("Untitled Scene"); const [saving,setSaving]=useState(false); const [saved,setSaved]=useState("");
 useEffect(()=>{listProjects().then((p)=>{setProjects(p as any[]);if(p?.[0])setProjectId(p[0].id)}).catch(()=>{});},[]);
 async function saveScene(){if(!supabase||!projectId)return;setSaving(true);setSaved("");try{let id=sceneId;if(!id){const{data,error}=await supabase.from("omniforge_scenes").insert({user_id:(await supabase.auth.getUser()).data.user?.id,project_id:projectId,name:sceneName,scene_data:{assetUrl,mode}}).select("id").single();if(error)throw error;id=data.id;setSceneId(id)}else{const{error}=await supabase.from("omniforge_scenes").update({project_id:projectId,name:sceneName,scene_data:{assetUrl,mode},updated_at:new Date().toISOString()}).eq("id",id);if(error)throw error}setSaved("Scene saved");}catch(e:any){setSaved(e?.message||"Save failed")}finally{setSaving(false)}}
 return <div className="studio-workspace">
  <header className="studio-topbar"><button className="secondary" onClick={onBack}><ArrowLeft size={15}/>Workspace</button><div className="studio-scene-name"><Box size={15}/><input className="studio-scene-input" value={sceneName} onChange={e=>setSceneName(e.target.value)} aria-label="Scene name"/></div><select className="studio-project-select" value={projectId} onChange={e=>setProjectId(e.target.value)}>{projects.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select><button className="icon-button" onClick={saveScene} disabled={saving||!projectId} title="Save scene"><Save size={15}/></button>{saved&&<span className="studio-save-status">{saved}</span>}<div className="studio-top-actions"><button className="icon-button" title="Frame selection"><Maximize2 size={15}/></button><button className="icon-button" title="Play timeline"><Play size={15}/></button></div></header>
  <div className="studio-body">
   <aside className="studio-left"><div className="studio-panel-title">SCENE</div><div className="scene-item active"><Box size={14}/>Scene</div><div className="scene-item"><Box size={14}/>Main Object</div><div className="studio-panel-title">PROJECT</div><div className="scene-item"><FolderOpen size={14}/>{projects.find(p=>p.id===projectId)?.name||"Select project"}</div><div className="studio-panel-title">TOOLS</div>{[["select","Select"],["rotate","Rotate"],["move","Move"],["scale","Scale"]].map(([id,label])=><button className={mode===id?"tool active":"tool"} key={id} onClick={()=>setMode(id)}><Rotate3D size={14}/>{label}</button>)}</aside>
   <main className="studio-viewport"><Canvas camera={{position:[4,3,5],fov:45}} dpr={[1,2]}><color attach="background" args={["#090a0f"]}/><ambientLight intensity={0.8}/><directionalLight position={[4,6,3]} intensity={2}/><Suspense fallback={null}>{assetUrl?<Model url={assetUrl}/>:<DemoObject/>}<Environment preset="city"/></Suspense><Grid infiniteGrid cellSize={0.5} sectionSize={2} fadeDistance={28} fadeStrength={1}/><OrbitControls makeDefault/></Canvas><div className="viewport-status">Perspective · WebGL · {mode}</div></main>
   <aside className="studio-right"><div className="studio-panel-title">INSPECTOR</div><div className="inspector-row"><span>Transform</span><Settings2 size={14}/></div><label>Position<input placeholder="0, 0, 0"/></label><label>Rotation<input placeholder="0°, 0°, 0°"/></label><label>Scale<input placeholder="1, 1, 1"/></label><div className="studio-panel-title">ASSET URL</div><p className="studio-help">Paste a public GLB URL from a completed generation to inspect it in the viewport.</p><input value={assetUrl} onChange={e=>setAssetUrl(e.target.value)} placeholder="https://.../model.glb"/></aside>
  </div>
  <footer className="studio-timeline"><span>TIMELINE</span><span>00:00</span><div className="timeline-track"><i/></div><span>24 FPS</span></footer>
 </div>;
}