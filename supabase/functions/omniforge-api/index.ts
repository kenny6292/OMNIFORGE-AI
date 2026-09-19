import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
const cors={"Access-Control-Allow-Origin":"*","Access-Control-Allow-Headers":"content-type,x-api-key,authorization,apikey"};
const out=(body:any,status=200)=>new Response(JSON.stringify(body),{status,headers:{"Content-Type":"application/json",...cors}});
async function sha(v:string){const b=await crypto.subtle.digest("SHA-256",new TextEncoder().encode(v));return Array.from(new Uint8Array(b)).map(x=>x.toString(16).padStart(2,"0")).join("")}
function admin(){const keys=JSON.parse(Deno.env.get("SUPABASE_SECRET_KEYS")||"{}");const key=keys.default||Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");if(!key)throw new Error("Supabase server secret is unavailable.");return createClient(Deno.env.get("SUPABASE_URL")!,key,{auth:{persistSession:false,autoRefreshToken:false}})}
Deno.serve(async(req)=>{
 if(req.method==="OPTIONS")return new Response("ok",{headers:cors});
 try{
  const raw=req.headers.get("x-api-key")||"";if(!raw.startsWith("of_live_"))return out({error:"Valid x-api-key required."},401);
  const db=admin(),hash=await sha(raw);
  const {data:key,error:ke}=await db.from("omniforge_api_keys").select("id,user_id,name,revoked_at").eq("key_hash",hash).maybeSingle();
  if(ke||!key||key.revoked_at)return out({error:"API key is invalid or revoked."},401);
  await db.from("omniforge_api_keys").update({last_used_at:new Date().toISOString()}).eq("id",key.id);
  const body=await req.json().catch(()=>({})),action=body.action||"list_assets";
  if(action==="list_projects"){const{data,error}=await db.from("omniforge_projects").select("id,name,description,project_type,status,updated_at").eq("user_id",key.user_id).order("updated_at",{ascending:false}).limit(100);if(error)throw error;return out({data:data||[]})}
  if(action==="list_assets"){const{data,error}=await db.from("omniforge_assets").select("id,name,asset_type,status,source_url,storage_path,project_id,metadata,created_at").eq("user_id",key.user_id).order("created_at",{ascending:false}).limit(100);if(error)throw error;return out({data:data||[]})}
  if(action==="export_asset"){
   const id=String(body.assetId||""),format=String(body.format||"glb").toLowerCase();if(!id)return out({error:"assetId is required."},400);
   if(!["glb","gltf","obj","fbx","usdz"].includes(format))return out({error:"Unsupported export format."},400);
   const{data:asset,error:ae}=await db.from("omniforge_assets").select("*").eq("id",id).eq("user_id",key.user_id).single();if(ae||!asset)return out({error:"Asset not found."},404);
   let url=asset.source_url||null,expiresAt=new Date(Date.now()+3600_000).toISOString();
   if(asset.storage_path){const signed=await db.storage.from("omniforge-assets").createSignedUrl(asset.storage_path,3600);if(signed.error)throw signed.error;url=signed.data.signedUrl}
   if(!url)return out({error:"Asset has no exportable file URL."},409);
   const{data:exp,error:ee}=await db.from("omniforge_exports").insert({user_id:key.user_id,asset_id:id,format,status:"ready",download_url:url,expires_at:expiresAt}).select().single();if(ee)throw ee;
   return out({exportId:exp.id,assetId:id,format,downloadUrl:url,expiresAt})
  }
  return out({error:"Unknown action. Use list_projects, list_assets, or export_asset."},400);
 }catch(e:any){return out({error:e?.message||"Unexpected error."},500)}
});