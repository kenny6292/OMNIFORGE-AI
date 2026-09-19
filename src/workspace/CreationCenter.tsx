import { useEffect, useState } from "react";
import { ArrowLeft, Box, ChevronDown, Loader2, Sparkles, WandSparkles } from "lucide-react";
import { createGeneration, listProjects } from "../lib/omniforge-db";

const types=["3D Model","Character","Environment","Prop","Vehicle","Building","Material","Texture","Animation","Concept"];
const formats=["GLB","GLTF","OBJ"];
const styles=["Realistic","Stylized","Low Poly","Cinematic","Sci-Fi","Fantasy"];

export function CreationCenter({ onBack }: { onBack:()=>void }) {
  const [projects,setProjects]=useState<any[]>([]);
  const [prompt,setPrompt]=useState("");
  const [type,setType]=useState("3D Model");
  const [style,setStyle]=useState("Realistic");
  const [quality,setQuality]=useState("Production");
  const [polycount,setPolycount]=useState("Medium");
  const [texture,setTexture]=useState("2K");
  const [format,setFormat]=useState("GLB");
  const [variations,setVariations]=useState("1");
  const [projectId,setProjectId]=useState("");
  const [creating,setCreating]=useState(false);
  const [message,setMessage]=useState("");

  useEffect(()=>{listProjects().then(setProjects).catch(()=>{});},[]);

  async function submit(e:React.FormEvent) {
    e.preventDefault();
    if (!prompt.trim()) return;
    setCreating(true); setMessage("");
    try {
      await createGeneration({
        prompt:prompt.trim(), generationType:type, projectId:projectId || undefined,
        parameters:{style,quality,polycount,textureResolution:texture,format,variations:Number(variations)}
      });
      setMessage("Generation job queued. The real AI provider will process it once connected.");
      setPrompt("");
    } catch(e:any) { setMessage(e?.message ?? "Could not create generation job."); }
    finally { setCreating(false); }
  }

  const SelectField=({label,value,onChange,options}:{label:string;value:string;onChange:(v:string)=>void;options:string[]})=>
    <label className="creation-field"><span>{label}</span><select value={value} onChange={e=>onChange(e.target.value)}>{options.map(x=><option key={x}>{x}</option>)}</select><ChevronDown size={14}/></label>;

  return <div className="creation-page">
    <header className="creation-header"><button className="secondary" onClick={onBack}><ArrowLeft size={15}/>Workspace</button><div className="creation-title"><div className="eyebrow"><WandSparkles size={14}/>AI CREATION CENTER</div><h1>Forge your next asset.</h1><p>Describe what you want to create. OMNIFORGE stores the job and its generation parameters for the real provider layer.</p></div><div/></header>
    <form className="creation-layout" onSubmit={submit}>
      <section className="creation-panel creation-prompt"><div className="panel-top"><span>01 · PROMPT</span><span>{prompt.length}/2000</span></div><textarea maxLength={2000} value={prompt} onChange={e=>setPrompt(e.target.value)} placeholder="A cinematic sci-fi dropship with modular wings, worn titanium panels, blue emissive details and realistic cockpit glass..." required/><div className="prompt-hints"><button type="button" onClick={()=>setPrompt("A futuristic modular exploration rover with realistic materials and functional mechanical details.")}>Use example</button><span>Be specific about form, materials, scale and visual style.</span></div></section>
      <section className="creation-panel"><div className="panel-top"><span>02 · OUTPUT</span></div><div className="type-grid">{types.map(x=><button type="button" className={type===x?"type-option active":"type-option"} key={x} onClick={()=>setType(x)}><Sparkles size={14}/>{x}</button>)}</div></section>
      <section className="creation-panel settings-panel"><div className="panel-top"><span>03 · GENERATION SETTINGS</span></div><div className="settings-grid">
        <SelectField label="Style" value={style} onChange={setStyle} options={styles}/>
        <SelectField label="Quality" value={quality} onChange={setQuality} options={["Draft","Standard","Production"]}/>
        <SelectField label="Polycount" value={polycount} onChange={setPolycount} options={["Low","Medium","High"]}/>
        <SelectField label="Texture" value={texture} onChange={setTexture} options={["1K","2K","4K"]}/>
        <SelectField label="Format" value={format} onChange={setFormat} options={formats}/>
        <SelectField label="Variations" value={variations} onChange={setVariations} options={["1","2","3","4"]}/>
      </div><SelectField label="Project" value={projectId} onChange={setProjectId} options={["",...projects.map(p=>p.id)]}/></section>
      {message && <div className="creation-message">{message}</div>}
      <button className="primary creation-submit" disabled={creating || !prompt.trim()}>{creating?<><Loader2 size={17} className="spin"/>Queueing job…</>:<><Sparkles size={17}/>Queue Generation</>}</button>
    </form>
  </div>;
}