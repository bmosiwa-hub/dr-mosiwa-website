# Deployment Guide — Dr. Benjamin Mosiwa Consulting Website

## Prerequisites

You need Node.js (v18+) installed. If not installed:
→ Download from: https://nodejs.org/en/download

---

## Step 1: Install Dependencies

Open a terminal in this project folder and run:

```bash
npm install
```

This installs Next.js, Tailwind CSS, Framer Motion, and all other dependencies.

---

## Step 2: Run Locally (Development)

```bash
npm run dev
```

Open your browser at: http://localhost:3000

---

## Step 3: Build for Production

```bash
npm run build
npm start
```

---

## Step 4: Deploy to Vercel (Recommended — Free)

### Option A: Vercel CLI

```bash
npm install -g vercel
vercel
```

Follow the prompts. Your site will be live at a `.vercel.app` URL within minutes.

### Option B: Vercel Dashboard (No CLI needed)

1. Go to https://vercel.com and sign in with GitHub
2. Push this project folder to a GitHub repository
3. Click "New Project" on Vercel → import your GitHub repo
4. Click "Deploy" — Vercel auto-detects Next.js

**Custom Domain:** In Vercel → Project Settings → Domains, add your domain (e.g. `drmosiwa.com`)

---

## Step 5: Connect Contact Form to Email

The contact form currently simulates submission. To make it actually send emails, choose one:

### Option A: Formspree (Easiest — No Backend)
1. Go to https://formspree.io and create a free account
2. Create a new form, copy your form ID (e.g. `xpwrjkzn`)
3. In `src/components/ContactForm.tsx`, replace the simulate block:

```typescript
// Replace the simulation lines with:
const res = await fetch("https://formspree.io/f/YOUR_FORM_ID", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(data),
});
if (!res.ok) throw new Error("Failed");
setFormState("success");
```

### Option B: Resend (Professional Email API)
1. Sign up at https://resend.com (free tier: 3,000 emails/month)
2. Create `src/app/api/contact/route.ts` (Next.js API route)
3. Send emails via the Resend SDK

---

## Project Structure

```
src/
├── app/
│   ├── layout.tsx          ← Root layout (header + footer + fonts)
│   ├── page.tsx            ← Home page
│   ├── about/page.tsx      ← About page
│   ├── services/page.tsx   ← Services page
│   ├── experience/page.tsx ← Portfolio / Experience page
│   ├── publications/page.tsx ← Publications & Insights
│   ├── clients/page.tsx    ← Clients & Partners
│   └── contact/page.tsx    ← Contact page
├── components/
│   ├── Header.tsx          ← Sticky navbar
│   ├── Footer.tsx          ← Site footer
│   └── ContactForm.tsx     ← Contact form with validation
└── lib/
    └── data.ts             ← ALL CV content (edit this to update content)
```

---

## Updating Content

All website content lives in **`src/lib/data.ts`**. Edit this file to:
- Update the profile summary, contact info, or tagline
- Add new projects/case studies
- Add publications or presentations
- Add/remove clients and partners

---

## Adding a CV Download Button

1. Place your CV PDF in `public/cv/Dr-Benjamin-Mosiwa-CV.pdf`
2. Add this anywhere in your pages:

```tsx
<a
  href="/cv/Dr-Benjamin-Mosiwa-CV.pdf"
  download
  className="btn-navy"
>
  Download CV (PDF)
</a>
```

---

## SEO

- Page titles and descriptions are set per-page using Next.js `metadata` exports
- Update `src/app/layout.tsx` to change global keywords and OpenGraph settings
- Add Google Analytics by installing `@next/third-parties` and using `GoogleAnalytics` component

---

## Support

For help with deployment or customisation, reach out to your developer.
