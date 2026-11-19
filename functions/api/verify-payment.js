export async function onRequestPost({request,env}) {
 try {
  if(!env.DB||!env.RAZORPAY_KEY_SECRET)return json({error:"Payment verification is not configured."},503);
  const d=await request.json();
  if(!d.bookingId||!d.razorpay_order_id||!d.razorpay_payment_id||!d.razorpay_signature)return json({error:"Missing payment verification details."},400);
  const booking=await env.DB.prepare("SELECT id,razorpay_order_id,status FROM bookings WHERE id=?").bind(d.bookingId).first();
  if(!booking||booking.razorpay_order_id!==d.razorpay_order_id)return json({error:"Booking/order mismatch."},400);
  if(booking.status==="paid")return json({verified:true});
  const enc=new TextEncoder();
  const key=await crypto.subtle.importKey("raw",enc.encode(env.RAZORPAY_KEY_SECRET),{name:"HMAC",hash:"SHA-256"},false,["sign"]);
  const signature=await crypto.subtle.sign("HMAC",key,enc.encode(`${booking.razorpay_order_id}|${d.razorpay_payment_id}`));
  const expected=[...new Uint8Array(signature)].map(b=>b.toString(16).padStart(2,"0")).join("");
  if(!constantTimeEqual(expected,d.razorpay_signature))return json({error:"Payment signature could not be verified."},400);
  await env.DB.prepare("UPDATE bookings SET status='paid',razorpay_payment_id=?,paid_at=datetime('now') WHERE id=?").bind(d.razorpay_payment_id,d.bookingId).run();
  return json({verified:true});
 }catch(e){return json({error:"Could not verify payment."},500)}
}
function constantTimeEqual(a,b){if(typeof b!=="string"||a.length!==b.length)return false;let x=0;for(let i=0;i<a.length;i++)x|=a.charCodeAt(i)^b.charCodeAt(i);return x===0}
function json(data,status=200){return new Response(JSON.stringify(data),{status,headers:{"content-type":"application/json","cache-control":"no-store"}})}
