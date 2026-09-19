import { Canvas } from "@react-three/fiber";
import { OrbitControls, Grid, Environment, useGLTF } from "@react-three/drei";
import { ArrowLeft, Box, Layers3, Settings2, Maximize2, Play, Rotate3D } from "lucide-react";
import { Suspense, useState } from "react";

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
 return <div className="studio-workspace">
  <header className="studio-topbar"><button className="secondary" onClick={onBack}><ArrowLeft size={15}/>Workspace</button><div className="studio-scene-name"><Box size={15}/>Untitled Scene</div><div className="studio-top-actions"><button className="icon-button" title="Frame selection"><Maximize2 size={15}/></button><button className="icon-button" title="Play timeline"><Play size={15}/></button></div></header>
  <div className="studio-body">
   <aside className="studio-left"><div className="studio-panel-title">SCENE</div><div className="scene-item active"><Box size={14}/>Scene</div><div className="scene-item"><Box size={14}/>Main Object</div><div className="studio-panel-title">TOOLS</div>{[["select","Select"],["rotate","Rotate"],["move","Move"],["scale","Scale"]].map(([id,label])=><button className={mode===id?"tool active":"tool"} key={id} onClick={()=>setMode(id)}><Rotate3D size={14}/>{label}</button>)}</aside>
   <main className="studio-viewport"><Canvas camera={{position:[4,3,5],fov:45}} dpr={[1,2]}><color attach="background" args={["#090a0f"]}/><ambientLight intensity={0.8}/><directionalLight position={[4,6,3]} intensity={2}/><Suspense fallback={null}>{assetUrl?<Model url={assetUrl}/>:<DemoObject/>}<Environment preset="city"/></Suspense><Grid infiniteGrid cellSize={0.5} sectionSize={2} fadeDistance={28} fadeStrength={1}/><OrbitControls makeDefault/></Canvas><div className="viewport-status">Perspective · WebGL · {mode}</div></main>
   <aside className="studio-right"><div className="studio-panel-title">INSPECTOR</div><div className="inspector-row"><span>Transform</span><Settings2 size={14}/></div><label>Position<input placeholder="0, 0, 0"/></label><label>Rotation<input placeholder="0°, 0°, 0°"/></label><label>Scale<input placeholder="1, 1, 1"/></label><div className="studio-panel-title">ASSET URL</div><p className="studio-help">Paste a public GLB URL from a completed generation to inspect it in the viewport.</p><input value={assetUrl} onChange={e=>setAssetUrl(e.target.value)} placeholder="https://.../model.glb"/></aside>
  </div>
  <footer className="studio-timeline"><span>TIMELINE</span><span>00:00</span><div className="timeline-track"><i/></div><span>24 FPS</span></footer>
 </div>;
}