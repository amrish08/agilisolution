# Agile Solution website

A responsive Pondicherry computer/laptop repair booking site with Cloudflare Pages Functions, Cloudflare D1 booking storage, and Razorpay Standard Checkout.

## Included
- Six service categories and booking form
- ₹500 booking advance (editable; not a repair quote)
- Server-created Razorpay order and server-side HMAC signature verification
- D1 database for booking records
- Password-protected basic admin bookings view at `/admin.html`

## Important before going live
1. Confirm that you really want to collect a **₹500 booking advance**. Change `BOOKING_ADVANCE_PAISE` if needed (amount in paise; ₹500 = ``50000``). The advance is shown separately from the final repair price.
2. Replace Razorpay test keys with your own Live Mode Key ID and Key Secret only after testing. Never put the Key Secret in browser code or share it in chat.
3. The website does not yet send email/SMS/WhatsApp notifications. Contact customers manually from the admin booking list.
4. This starter records a booking as paid after signature verification. For stronger production reconciliation, configure Razorpay webhooks (`payment.captured`, `order.paid`) and check captured payment status before providing service.

## Deploy free on Cloudflare Pages

### A. Create the D1 database
1. Sign in at https://dash.cloudflare.com/
2. Open **Workers & Pages → D1 SQL Database → Create database**. Name it `agile-solution-db`.
3. Open the database's Console and run all SQL from `schema.sql`.

### B. Create the Pages project
1. Create a GitHub repository and upload the contents of this folder (not the ZIP itself).
2. In Cloudflare, open **Workers & Pages → Create application → Pages → Connect to Git**.
3. Select the repository. Framework preset: **None**. Build command: leave blank. Build output directory: `/` (or the repository root, if prompted).
4. Deploy the project.

### C. Bind D1
In the Pages project open **Settings → Bindings → Add → D1 database**. Set Variable name to `DB` and select `agile-solution-db`. Save and redeploy.

### D. Add secrets and variables
In **Settings → Variables and Secrets**, add these for Production (and Preview if you want):
- `RAZORPAY_KEY_ID` = your Razorpay Key ID
- `RAZORPAY_KEY_SECRET` = your Razorpay Key Secret (**Secret**)
- `ADMIN_PASSWORD` = create a long, unique admin password (**Secret**)
- `BOOKING_ADVANCE_PAISE` = ``50000`` (ordinary variable; optional, defaults to ₹500)

Get API keys from Razorpay Dashboard → Account & Settings → API Keys. Start with Test Mode keys. Do not paste your secret key into public HTML/JavaScript.

### E. Test, then go live
1. Test a booking using Razorpay Test Mode credentials and test payment methods.
2. Check `/admin.html` using your `ADMIN_PASSWORD`.
3. Confirm the booking is shown as `paid` only after payment verification.
4. After your Razorpay account is approved for live payments, add Live Mode Key ID and Key Secret as Cloudflare secrets and redeploy.
5. Configure Razorpay webhook URL as `https://YOUR-SITE-DOMAIN/api/razorpay-webhook` only after adding a webhook handler; this starter does not include that handler yet.

Your free Cloudflare Pages address will look like `https://YOUR-PROJECT.pages.dev`. A custom domain is optional and normally costs extra.

## Security notes
- Never share Razorpay Key Secret or ADMIN_PASSWORD.
- Use HTTPS (Cloudflare Pages provides it).
- Admin endpoint uses a bearer password; choose a strong password and do not expose it.
- Before high-volume production use, add rate limiting, spam protection, webhook reconciliation, and stronger admin authentication.
