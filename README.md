# Gramin Aarogya Sathi (ग्रामीण आरोग्य साथी)
### Offline-First Smart Rural Healthcare Assistant for Maharashtra

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/RamSriCharan007/SIH)

---

## 🚀 1-Click Free Deployment (with Free HTTPS Domain)

Click the button above or use this link to deploy immediately on Render for free:  
👉 **[Deploy to Render (100% Free Domain)](https://render.com/deploy?repo=https://github.com/RamSriCharan007/SIH)**

- **Free HTTPS Domain:** `https://<your-app-name>.onrender.com`
- **Zero Cost:** $0/month on Render Free Tier
- **Full-Stack:** Express/Node.js + Vite React + PostgreSQL + Standalone Hospital Portal

---

## 🏥 3 Isolated Web Portals

| Portal | URL Path | Intended Audience | Features |
| :--- | :--- | :--- | :--- |
| **Citizen & Patient Portal** | `/` | Rural Citizens & Patients | 108 Emergency calling, bilingual triage, remedies, token booking. |
| **Hospital Command Portal** | `/hospital-portal` | Medical Superintendents & MOs | Live patient queue, bed deduction/restoration, doctor video roster, digital receipts, resource console. |
| **Developer Control Authority** | `/developer-portal` | Master Developer Ram Sri Charan | Hospital credential provisioning, passkey rotation, instant access revocation. |

---

## 🔍 Google Search Recognition & SEO

- **Robots Exclusion:** `/robots.txt` (allows public health indexing, protects medical administrative portals).
- **XML Sitemap:** `/sitemap.xml` (ready for Google Search Console).
- **Schema.org Structured Data:** JSON-LD for `GovernmentService` and `MedicalWebPage`.
- **Search Verification:** Add your code to `<meta name="google-site-verification" content="..." />` in `index.html`.

---

## 🛠️ Quick Local Setup

```bash
# 1. Install dependencies
npm install

# 2. Build production assets
npm run build

# 3. Start full-stack server
npm start
```
- App: `http://localhost:5000/`
- Hospital Portal: `http://localhost:5000/hospital-portal`
- Developer Portal: `http://localhost:5000/developer-portal`
