# Secure Uplink — Contact Form Backend

A small Express server that receives your portfolio's contact form
submissions and emails them to you. This replaces the placeholder
"queued" message in the frontend with a real send.

## 1. Install

```bash
cd backend
npm install
```

## 2. Configure

```bash
cp .env.example .env
```

Then edit `.env`:
- `SMTP_USER` / `SMTP_PASS` — your email + an **App Password** (for Gmail:
  turn on 2-Step Verification, then generate one at
  https://myaccount.google.com/apppasswords). Never use your real password here.
- `RECEIVING_EMAIL` — where you want messages delivered
  (defaults to `karunyasharma60@gmail.com`).
- `ALLOWED_ORIGIN` — set this to your live site's URL once deployed
  (e.g. `https://karunyasharma.dev`). Leave as `*` only while testing locally.

## 3. Run it

```bash
npm start
```

You should see:
```
Secure Uplink backend running on http://localhost:5000
```

Test it's alive: open `http://localhost:5000/api/health` — should return `{"status":"ok"}`.

## 4. Point the frontend at it

In `portfolio.html`, the contact form JS calls a `BACKEND_URL` constant.
Set it to:
- `http://localhost:5000/api/contact` while developing locally
- your deployed backend URL once it's hosted (e.g. Render, Railway, Fly.io)
  + `/api/contact`

## 5. Deploy

This is a plain Node/Express app — it runs anywhere Node runs. Free-tier
friendly options: **Render**, **Railway**, or **Fly.io**. Whichever you pick:
1. Push this `backend/` folder to its own repo (or a subfolder of your main repo).
2. Set the same environment variables from `.env` in the host's dashboard —
   never upload your `.env` file itself.
3. Update `ALLOWED_ORIGIN` to your real portfolio domain so only your site
   can call this API.
4. Update `BACKEND_URL` in `portfolio.html` to the deployed URL.

## Built-in protections
- **Rate limiting** — max 5 submissions per 15 minutes per IP.
- **Honeypot field** — a hidden `website` field catches simple bots
  (real visitors never fill it in; the frontend already omits it, so add
  it if you want bot protection — see note in `server.js`).
- **Input validation** — requires name/email/message and checks email format.
- **CORS lock-down** — only your configured origin can call the API once
  you set `ALLOWED_ORIGIN`.
