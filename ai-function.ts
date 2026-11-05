// Supabase > Edge Functions > Create (이름: ai) 에 붙여넣고 Deploy
const cors={'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'authorization, x-client-info, apikey, content-type'};
Deno.serve(async(req)=>{
  if(req.method==='OPTIONS')return new Response('ok',{headers:cors});
  try{
    const {prompt,pdf}=await req.json();
    const content:any[]=[];
    if(pdf)content.push({type:'document',source:{type:'base64',media_type:'application/pdf',data:pdf}});
    content.push({type:'text',text:String(prompt).slice(0,20000)});
    const r=await fetch('https://api.anthropic.com/v1/messages',{method:'POST',
      headers:{'content-type':'application/json','x-api-key':Deno.env.get('ANTHROPIC_API_KEY')!,'anthropic-version':'2023-06-01'},
      body:JSON.stringify({model:'claude-sonnet-5-5',max_tokens:4000,messages:[{role:'user',content}]})});
    const j=await r.json();
    if(!r.ok)throw new Error(j.error?.message||'API error');
    const t=(j.content||[]).map((c:any)=>c.text||'').join('').replace(/```json|```/g,'').trim();
    return new Response(JSON.stringify(JSON.parse(t)),{headers:{...cors,'content-type':'application/json'}});
  }catch(e){return new Response(JSON.stringify({error:String(e.message||e)}),{status:500,headers:{...cors,'content-type':'application/json'}})}
});
