import { Box, Sparkles, ArrowRight } from "lucide-react";

const features = [
  ["AI 3D Generation","Turn natural-language ideas into structured 3D creation jobs."],
  ["3D Studio","A dedicated workspace for scenes, assets, materials and iteration."],
  ["Asset Library","Organize generated and uploaded assets across projects."],
  ["AI Materials","Prepare material and texture workflows for production assets."]
];

export default function App() {
  return (
    <main className="app-shell">
      <nav className="nav">
        <div className="brand"><span className="brand-mark"><Box size={18}/></span>OMNIFORGE <span>AI</span></div>
        <div className="nav-links"><a href="#features">Features</a><a href="#studio">Studio</a><a href="#showcase">Showcase</a></div>
        <button className="nav-cta">Start Creating <ArrowRight size={16}/></button>
      </nav>

      <section className="hero">
        <div className="eyebrow"><Sparkles size={15}/> AI-NATIVE 3D CREATION</div>
        <h1>Forge Anything.<br/><em>Build Worlds.</em></h1>
        <p>Turn ideas into 3D reality with an AI-powered creation engine for assets, scenes, materials, animation and digital worlds.</p>
        <div className="hero-actions">
          <button className="primary">Start Creating <ArrowRight size={17}/></button>
          <button className="secondary">Explore Showcase</button>
        </div>
      </section>

      <section id="features" className="features">
        {features.map(([title,description]) => (
          <article className="feature-card" key={title}>
            <div className="feature-icon"><Sparkles size={18}/></div>
            <h2>{title}</h2><p>{description}</p>
          </article>
        ))}
      </section>

      <section id="studio" className="studio-preview">
        <div className="studio-copy">
          <div className="eyebrow">THE OMNIFORGE STUDIO</div>
          <h2>One workspace for the entire 3D pipeline.</h2>
          <p>Generation, scene composition, asset management and export will converge in a production-oriented studio.</p>
        </div>
        <div className="viewport"><div className="viewport-grid"/><div className="orb"/></div>
      </section>

      <footer><span>OMNIFORGE AI</span><span>Foundation v0.1</span></footer>
    </main>
  );
}
