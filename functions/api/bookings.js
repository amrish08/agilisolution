export async function onRequestGet({request,env}) {
 if(!env.ADMIN_PASSWORD||!env.DB)return new Response("Admin is not configured.",{status:503});
 const auth=request.headers.get("authorization")||"";
 if(auth!==`Bearer ${env.ADMIN_PASSWORD}`)return new Response("Unauthorized",{status:401});
 const {results=[]}=await env.DB.prepare("SELECT id,service,name,phone,address,preferred_date,preferred_time,issue,amount_paise,status,created_at,paid_at FROM bookings ORDER BY created_at DESC LIMIT 300").all();
 return new Response(JSON.stringify(results),{headers:{"content-type":"application/json","cache-control":"no-store"}});
}
