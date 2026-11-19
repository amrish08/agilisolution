export async function onRequestPost({request,env}) {
  try {
    if (!env.RAZORPAY_KEY_ID || !env.RAZORPAY_KEY_SECRET || !env.DB) return json({error:"Payment service is not configured yet. Please contact the business."},503);
    const d=await request.json();
    const required=["service","name","phone","address","date","time"];
    for (const k of required) if (!String(d[k]||"").trim()) return json({error:`Please provide ${k}.`},400);
    if (!/^[0-9+() -]{8,16}$/.test(d.phone)) return json({error:"Please enter a valid phone number."},400);
    const allowed=["Laptop repair","Desktop repair","Windows installation","Software installation","Virus removal","Data recovery"];
    if (!allowed.includes(d.service)) return json({error:"Invalid service selected."},400);
    const bookingId="AS"+Date.now().toString(36).toUpperCase();
    const amount=Number(env.BOOKING_ADVANCE_PAISE||50000);
    if (!Number.isInteger(amount)||amount<100) return json({error:"Booking advance amount is misconfigured."},500);
    await env.DB.prepare(`INSERT INTO bookings (id,service,name,phone,address,preferred_date,preferred_time,issue,amount_paise,status,created_at) VALUES (?,?,?,?,?,?,?,?,?,'payment_pending',datetime('now'))`)
      .bind(bookingId,d.service,d.name.trim(),d.phone.trim(),d.address.trim(),d.date,d.time,(d.issue||"").trim(),amount).run();
    const auth=btoa(`${env.RAZORPAY_KEY_ID}:${env.RAZORPAY_KEY_SECRET}`);
    const orderRes=await fetch("https://api.razorpay.com/v1/orders",{method:"POST",headers:{Authorization:`Basic ${auth}`,"Content-Type":"application/json"},body:JSON.stringify({amount,currency:"INR",receipt:bookingId,notes:{booking_id:bookingId,service:d.service}})});
    const order=await orderRes.json();
    if(!orderRes.ok) throw new Error(order.error?.description||"Razorpay order creation failed.");
    await env.DB.prepare("UPDATE bookings SET razorpay_order_id=? WHERE id=?").bind(order.id,bookingId).run();
    return json({keyId:env.RAZORPAY_KEY_ID,orderId:order.id,amount,bookingId});
  } catch(e){return json({error:e.message||"Unable to start payment."},500);}
}
function json(data,status=200){return new Response(JSON.stringify(data),{status,headers:{"content-type":"application/json","cache-control":"no-store"}})}
