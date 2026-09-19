import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
const cors={"Access-Control-Allow-Origin":"*","Access-Control-Allow-Headers":"authorization, x-client-info, apikey, content-type"};
const json=(body,status=200)=>new Response(JSON.stringify(body),{status,headers:{"Content-Type":"application/json",...cors}});
const headers=(key)=>({"Authorization":"Bearer "+key});
Deno.serve(async(req)=>{
 if(req.method==="OPTIONS")return new Response("ok",{headers:cors});
 try{
  const auth=req.headers.get("Authorization")||""; if(!auth.startsWith("Bearer "))return json({error:"Authentication required"},401);
  const supabase=createClient(Deno.env.get("SUPABASE_URL")!,Deno.env.get("SUPABASE_PUBLISHABLE_KEY")!,{global:{headers:{Authorization:auth}}});
  const {data:{user},error:ue}=await supabase.auth.getUser(); if(ue||!user)return json({error:"Invalid session"},401);
  const body=await req.json(), action=body.action||"create";
  const key=Deno.env.get("MESHY_API_KEY");
  if(!key)return json({error:"MESHY_API_KEY is not configured in Supabase Edge Function secrets."},503);
  if(action==="create"){
   const prompt=String(body.prompt||"").trim(); if(!prompt||prompt.length>800)return json({error:"Prompt is required and must be 800 characters or less."},400);
   const params=body.parameters||{}, generationType=String(body.generationType||"3D Model");
   const {data:g,error:ie}=await supabase.from("omniforge_generations").insert({user_id:user.id,project_id:body.projectId||null,prompt,generation_type:generationType,provider:"meshy",model:"latest",status:"processing",parameters:{...params,provider:"meshy",phase:"preview"}}).select().single();
   if(ie)return json({error:ie.message},400);
   const target=String(params.format||"GLB").toLowerCase(), payload={mode:"preview",prompt,ai_model:"latest",model_type:params.polycount==="Low"?"smart-topology":"standard",target_formats:[target==="gltf"?"glb":target]};
   const r=await fetch("https://api.meshy.ai/openapi/v2/text-to-3d",{method:"POST",headers:{"Authorization":"Bearer "+key,"Content-Type":"application/json"},body:JSON.stringify(payload)}), result=await r.json();
   if(!r.ok){await supabase.from("omniforge_generations").update({status:"failed",error_message:result?.message||"Meshy task creation failed."}).eq("id",g.id);return json({error:result?.message||"Meshy task creation failed.",generationId:g.id},502);}
   await supabase.from("omniforge_generations").update({parameters:{...params,provider:"meshy",phase:"preview",provider_task_id:result.result}}).eq("id",g.id);
   return json({generationId:g.id,providerTaskId:result.result,status:"processing"});
  }
  if(action==="status"){
   const generationId=String(body.generationId||"");
   const {data:g,error}=await supabase.from("omniforge_generations").select("*").eq("id",generationId).eq("user_id",user.id).single(); if(error||!g)return json({error:"Generation not found"},404);
   const params=g.parameters||{}, taskId=params.provider_task_id, phase=params.phase||"preview"; if(!taskId)return json({generation:g});
   const r=await fetch("https://api.meshy.ai/openapi/v2/text-to-3d/"+taskId,{headers:headers(key)}), task=await r.json(); if(!r.ok)return json({error:task?.message||"Meshy status request failed."},502);
   if(task.status==="FAILED"){await supabase.from("omniforge_generations").update({status:"failed",error_message:task.task_error?.message||"Meshy generation failed."}).eq("id",g.id);return json({status:"failed",generationId:g.id});}
   if(task.status==="SUCCEEDED"&&phase==="preview"){
    const refine=await fetch("https://api.meshy.ai/openapi/v2/text-to-3d",{method:"POST",headers:{"Authorization":"Bearer "+key,"Content-Type":"application/json"},body:JSON.stringify({mode:"refine",preview_task_id:task.id,texture_resolution:params.textureResolution==="4K"?"4k":"2k",enable_pbr:true,target_formats:[String(params.format||"GLB").toLowerCase()==="gltf"?"glb":String(params.format||"GLB").toLowerCase()]})}), rr=await refine.json();
    if(!refine.ok){await supabase.from("omniforge_generations").update({status:"failed",error_message:rr?.message||"Meshy refine task failed."}).eq("id",g.id);return json({error:rr?.message||"Refine failed."},502);}
    await supabase.from("omniforge_generations").update({parameters:{...params,phase:"refine",preview_task_id:task.id,provider_task_id:rr.result}}).eq("id",g.id);
    return json({status:"processing",phase:"refine",generationId:g.id});
   }
   if(task.status==="SUCCEEDED"&&phase==="refine"){
    const urls=task.model_urls||{}, sourceUrl=urls.glb||urls.fbx||urls.obj||null;
    const {data:asset,error:ae}=await supabase.from("omniforge_assets").insert({user_id:user.id,project_id:g.project_id,name:g.prompt.slice(0,80),asset_type:g.generation_type,status:"ready",source_url:sourceUrl,metadata:{provider:"meshy",task_id:task.id,thumbnail_url:task.thumbnail_url||null,model_urls:urls}}).select().single();
    if(ae)return json({error:ae.message},500);
    await supabase.from("omniforge_generations").update({status:"completed",result_asset_id:asset.id,completed_at:new Date().toISOString()}).eq("id",g.id);
    return json({status:"completed",generationId:g.id,asset});
   }
   return json({status:"processing",phase,generationId:g.id,providerStatus:task.status,progress:task.progress??0});
  }
  return json({error:"Unknown action"},400);
 }catch(e){return json({error:e instanceof Error?e.message:"Unexpected error"},500)}
});