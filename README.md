# 🏡 Varagam Real Estate

> Tamil Nadu's trusted land marketplace — direct seller to buyer, no commission.

## ✨ Features

- **Buyer Side** — Browse approved listings with search & filter by district, land type, price
- **Seller Portal** — Multi-step listing form with photo upload, map pin, land details
- **Admin Panel** — Review/approve/reject listings, manage inquiries, feature listings
- **Notifications** — WhatsApp deep-link + EmailJS email alerts to admin & sellers
- **PWA** — Installable on mobile & desktop, offline capable
- **SEO** — Meta tags, Open Graph, JSON-LD structured data, robots.txt
- **Geo** — Leaflet map integration for location pinning & display
- **Auth** — Supabase Auth with role-based access (seller / admin)

---

## 🚀 Quick Start

### 1. Clone & Install

```bash
git clone https://github.com/yourname/varagam.git
cd varagam
npm install
```

### 2. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) → New Project
2. Note your **Project URL** and **Anon Key**
3. Go to **SQL Editor** → paste contents of `supabase-schema.sql` → Run

### 3. Configure Environment

```bash
cp .env.example .env
# Edit .env with your actual values
```

Required:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_ADMIN_WHATSAPP=919876543210
VITE_ADMIN_EMAIL=admin@varagam.in
```

### 4. Make Yourself Admin

After signing up, go to Supabase Dashboard → Table Editor → `profiles` → find your row → set `role = 'admin'`

Or run in SQL Editor:
```sql
update public.profiles set role = 'admin' where id = 'YOUR-USER-UUID';
```

### 5. Run Locally

```bash
npm run dev
```

### 6. Build for Production

```bash
npm run build
npm run preview
```

---

## 📁 Project Structure

```
varagam/
├── public/
│   ├── icons/          # PWA icons (generate at realfavicongenerator.net)
│   └── robots.txt
├── src/
│   ├── components/
│   │   ├── buyer/      # ListingCard
│   │   ├── shared/     # PublicLayout, SellerLayout, AdminLayout, PWAInstallBanner
│   │   └── ui/         # MapPicker, ImageUpload
│   ├── hooks/          # usePWAInstall
│   ├── lib/
│   │   ├── supabase.js     # Supabase client + helpers
│   │   ├── notifications.js # WhatsApp + EmailJS
│   │   └── constants.js    # Districts, land types, etc.
│   ├── pages/
│   │   ├── buyer/      # HomePage, ListingsPage, ListingDetail
│   │   ├── seller/     # Dashboard, NewListing, EditListing, MyListings, Profile
│   │   ├── admin/      # Dashboard, Listings, ReviewListing, Inquiries
│   │   ├── LoginPage.jsx
│   │   └── RegisterPage.jsx
│   ├── store/
│   │   ├── authStore.js
│   │   └── listingsStore.js
│   ├── styles/
│   │   └── globals.css
│   ├── App.jsx
│   └── main.jsx
├── supabase-schema.sql
├── vite.config.js
├── tailwind.config.js
└── .env.example
```

---

## 📲 PWA Icons

Generate icons at [realfavicongenerator.net](https://realfavicongenerator.net) and place in `public/icons/`:
- `icon-72.png`, `icon-96.png`, `icon-128.png`, `icon-192.png`, `icon-512.png`

---

## 📧 Email Notifications (EmailJS)

1. Sign up at [emailjs.com](https://emailjs.com) (free: 200 emails/month)
2. Create a service + template
3. Add credentials to `.env`
4. Template variables: `{{to_email}}`, `{{subject}}`, `{{message}}`

---

## 🚢 Deploy (Vercel — recommended)

```bash
npm i -g vercel
vercel
# Set env vars in Vercel dashboard
```

Or Netlify:
```bash
npm run build
# Deploy /dist folder
```

---

## 🔒 Security Notes

- Admin routes protected by Supabase RLS + React route guards
- Sellers can only see/edit their own listings
- Buyers only see `status = 'approved'` listings (enforced at DB level)
- Storage bucket: authenticated upload, public read, owner delete

---

## 📞 Notification Flow

```
Seller submits listing
  → Admin gets WhatsApp notification (wa.me link)
  → Admin gets Email (EmailJS)
  → Admin reviews in panel
    → Approve: Seller gets WhatsApp + in-app notification
    → Reject: Seller gets WhatsApp with reason + in-app notification
Buyer sends inquiry
  → Admin gets WhatsApp notification
  → Seller can be contacted directly
```

---

## 🗺️ Roadmap

- [ ] Seller analytics (views, inquiries per listing)
- [ ] SMS notifications via MSG91 / Twilio
- [ ] Advanced geo search (radius-based)
- [ ] Price history tracking
- [ ] Multi-language (Tamil / English toggle)
- [ ] Payment gateway for premium listings

---

Made with ❤️ for Tamil Nadu farmers and land owners.
