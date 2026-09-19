import { useState } from "react";
import { ArrowRight, Box, Check, ChevronRight, Layers3, Sparkles, WandSparkles } from "lucide-react";

type Section = "home" | "features" | "studio" | "showcase";

const features = [
  {icon: WandSparkles, title:"AI 3D Generation", text:"Turn natural-language ideas into structured 3D creation jobs."},
  {icon: Layers3, title:"3D Studio", text:"Compose scenes, inspect assets and iterate from one focused workspace."},
  {icon: Box, title:"Asset Library", text:"Organize generated and uploaded assets across every project."},
  {icon: Sparkles, title:"AI Materials", text:"Prepare material and texture workflows for production-ready assets."}
];

function scrollTo(id: Section) {
  document.getElementById(id)?.scrollIntoView({behavior:"smooth"});
}

export default function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [started, setStarted] = useState(false);

  return <main className="app-shell">
    <nav className="nav">
      <button className="brand" onClick={() => scrollTo("home")} aria-label="Go home">
        <span className="brand-mark"><Box size={18}/></span>OMNIFORGE <span>AI</span>
      </button>
      <div className="nav-links">
        <button onClick={() => scrollTo("features")}>Features</button>
        <button onClick={() => scrollTo("studio")}>Studio</button>
        <button onClick={() => scrollTo("showcase")}>Showcase</button>
      </div>
      <button className="nav-cta" onClick={() => {setStarted(true); scrollTo("studio")}}>Start Creating <ArrowRight size={16}/></button>
      <button className="mobile-menu" onClick={() => setMenuOpen(v=>!v)} aria-label="Toggle navigation">☰</button>
      {menuOpen && <div className="mobile-links">
        <button onClick={() => {setMenuOpen(false); scrollTo("features")}}>Features</button>
        <button onClick={() => {setMenuOpen(false); scrollTo("studio")}}>Studio</button>
        <button onClick={() => {setMenuOpen(false); scrollTo("showcase")}}>Showcase</button>
      </div>}
    </nav>

    <section id="home" className="hero">
      <div className="eyebrow"><Sparkles size={15}/> AI-NATIVE 3D CREATION</div>
      <h1>Forge Anything.<br/><em>Build Worlds.</em></h1>
      <p>Turn ideas into 3D reality with an AI-powered creation engine for assets, scenes, materials, animation and digital worlds.</p>
      <div className="hero-actions">
        <button className="primary" onClick={() => {setStarted(true); scrollTo("studio")}}>Start Creating <ArrowRight size={17}/></button>
        <button className="secondary" onClick={() => scrollTo("showcase")}>Explore Showcase</button>
      </div>
      {started && <div className="launch-note"><Check size={15}/> Studio workspace initialized. Generation engine integration comes next.</div>}
    </section>

    <section id="features" className="section">
      <div className="section-heading"><div className="eyebrow">CORE CAPABILITIES</div><h2>Everything you need to forge digital worlds.</h2></div>
      <div className="features">{features.map(({icon:Icon,title,text}) =>
        <article className="feature-card" key={title}><div className="feature-icon"><Icon size={18}/></div><h3>{title}</h3><p>{text}</p><button onClick={()=>scrollTo("studio")}>Explore <ChevronRight size={14}/></button></article>
      )}</div>
    </section>

    <section id="studio" className="section studio-section">
      <div className="studio-copy"><div className="eyebrow">THE OMNIFORGE STUDIO</div><h2>One workspace for the entire 3D pipeline.</h2><p>Generation, scene composition, asset management and export converge in a production-oriented studio.</p><div className="studio-pills"><span>Scene Hierarchy</span><span>Inspector</span><span>Timeline</span><span>Viewport</span></div></div>
      <div className="viewport"><div className="viewport-toolbar"><span>OMNIFORGE / Untitled Scene</span><span>Perspective · 24 FPS</span></div><div className="viewport-grid"/><div className="orb"/><div className="axis"><i/><b/><u/></div></div>
    </section>

    <section id="showcase" className="section showcase"><div className="showcase-card"><div><div className="eyebrow">SHOWCASE</div><h2>Built for ideas that become real.</h2><p>Public showcases will let creators publish assets, scenes and complete worlds from OMNIFORGE.</p></div><button className="secondary" onClick={()=>setStarted(true)}>Enter Studio <ArrowRight size={16}/></button></div></section>

    <footer><span>OMNIFORGE AI</span><span>Foundation v0.2 · Building the creation engine</span></footer>
  </main>;
}
