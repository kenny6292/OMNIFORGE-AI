import { FormEvent, useState } from "react";
import { ArrowRight, Loader2, LogIn, UserPlus, X } from "lucide-react";
import { supabase } from "../lib/supabase";

type Mode = "sign-in" | "sign-up";

export function AuthPanel({ onClose }: { onClose: () => void }) {
  const [mode,setMode]=useState<Mode>("sign-in");
  const [email,setEmail]=useState("");
  const [password,setPassword]=useState("");
  const [loading,setLoading]=useState(false);
  const [message,setMessage]=useState("");

  async function submit(e:FormEvent) {
    e.preventDefault(); setMessage("");
    if (!supabase) { setMessage("Authentication is not configured yet. Add the Supabase environment variables."); return; }
    setLoading(true);
    const result = mode==="sign-in"
      ? await supabase.auth.signInWithPassword({email,password})
      : await supabase.auth.signUp({email,password});
    setLoading(false);
    if (result.error) setMessage(result.error.message);
    else setMessage(mode==="sign-up" ? "Account created. Check your email if confirmation is enabled." : "Signed in successfully.");
  }

  return <div className="auth-overlay" role="dialog" aria-modal="true">
    <div className="auth-card">
      <button className="auth-close" onClick={onClose} aria-label="Close"><X size={18}/></button>
      <div className="auth-icon">{mode==="sign-in"?<LogIn size={20}/>:<UserPlus size={20}/>}</div>
      <div className="eyebrow">OMNIFORGE ACCOUNT</div>
      <h2>{mode==="sign-in"?"Welcome back.":"Create your workspace."}</h2>
      <p>{mode==="sign-in"?"Sign in to continue creating.":"Create an account to save projects, assets and generations."}</p>
      <form onSubmit={submit}>
        <label>Email<input type="email" required autoComplete="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com"/></label>
        <label>Password<input type="password" required minLength={6} autoComplete={mode==="sign-in"?"current-password":"new-password"} value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••"/></label>
        {message && <div className="auth-message">{message}</div>}
        <button className="primary auth-submit" disabled={loading}>{loading?<Loader2 className="spin" size={17}/>:<ArrowRight size={17}/>} {mode==="sign-in"?"Sign In":"Create Account"}</button>
      </form>
      <button className="auth-switch" onClick={()=>{setMode(mode==="sign-in"?"sign-up":"sign-in");setMessage("")}}>
        {mode==="sign-in"?"New to OMNIFORGE? Create an account":"Already have an account? Sign in"}
      </button>
    </div>
  </div>;
}
