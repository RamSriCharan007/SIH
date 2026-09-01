# Full-Stack Deployment & Google Search Recognition Guide
**Project:** Gramin Aarogya Sathi (ग्रामीण आरोग्य साथी)  
**Author:** Ram Sri Charan  

---

## 1. Where to Launch so Google Recognizes the App

To ensure **Googlebot and Google Search immediately recognize, index, and surface** your full-stack application, here are the top recommended deployment platforms:

### Option A: Google Cloud Run (Recommended #1 for Maximum Google Recognition)
**Why Google Cloud Run:**
- Hosted directly on **Google Cloud Platform (GCP)** infrastructure.
- Automatic Google-managed SSL/TLS certificates, HTTP/2, and global CDN.
- Native Google ecosystem integration: instant priority indexing via Google Search Console.
- **Free Tier:** 2 million requests/month, 360,000 GB-seconds memory completely free every month.
- Supports our multi-stage `Dockerfile`.

**Step-by-Step Google Cloud Run Deployment:**
1. Install [Google Cloud CLI (`gcloud`)](https://cloud.google.com/sdk/docs/install) if not installed.
2. Login to your Google Cloud account:
   ```bash
   gcloud auth login
   gcloud config set project <YOUR_GCP_PROJECT_ID>
   ```
3. Deploy directly from the project directory:
   ```bash
   gcloud run deploy gramin-aarogya-sathi \
     --source . \
     --platform managed \
     --region asia-south1 \
     --allow-unauthenticated \
     --port 5000 \
     --set-env-vars="NODE_ENV=production,DEV_ADMIN_PASS=Ram001301@"
   ```
4. Cloud Run will build the Docker container and output your live Google URL:
   `https://gramin-aarogya-sathi-xxxxxxxx-el.a.run.app`

---

### Option B: Render.com (Easiest 1-Click GitHub Full-Stack Deployment)
**Why Render:**
- Zero-config deployment directly from your GitHub repository.
- Free managed PostgreSQL database + Free Web Service with automatic HTTPS.
- Automatic redeployment whenever you push changes to GitHub.

**Step-by-Step Render Deployment:**
1. Push your repository to GitHub.
2. Log into [Render.com](https://render.com).
3. Click **"New"** -> **"Blueprint"** -> Select your GitHub repository.
4. Render automatically reads our included [render.yaml](file:///d:/SIH/render.yaml) and provisions:
   - The Node.js Express & Vite web service.
   - The PostgreSQL database.
5. Click **"Apply"** -> Your app is live with a `https://<app-name>.onrender.com` domain.

---

### Option C: Railway.app
1. Push code to GitHub.
2. Go to [Railway.app](https://railway.app) -> **"New Project"** -> **"Deploy from GitHub repo"**.
3. Add a PostgreSQL database service.
4. Set environment variable `PORT=5000` and `DEV_ADMIN_PASS=Ram001301@`.
5. Railway automatically builds and deploys using the [Dockerfile](file:///d:/SIH/Dockerfile).

---

## 2. How to Get Google to Recognize & Index Your App

We have configured enterprise-grade Search Engine Optimization (SEO) inside the repository:

### Assets Configured in Codebase:
1. **Robots.txt** ([public/robots.txt](file:///d:/SIH/public/robots.txt)):
   - Allows Googlebot to crawl and index public citizen healthcare services (`/`, `/remedies`, `/emergency`, `/triage`).
   - Protects administrative portals (`Disallow: /developer-portal/`, `Disallow: /hospital-portal/`) to comply with healthcare security standards.
   - Declares the Sitemap location: `https://<your-domain>/sitemap.xml`.
2. **Sitemap.xml** ([public/sitemap.xml](file:///d:/SIH/public/sitemap.xml)):
   - Declares all public routes, update frequency (`daily`/`weekly`), and page priority (`1.0`, `0.9`).
3. **Structured Data (Schema.org)** in [index.html](file:///d:/SIH/index.html):
   - JSON-LD structured data for `GovernmentService` and `MedicalWebPage`.
   - Enables Google to render **Rich Health Snippets** in search results.
4. **OpenGraph & Twitter Cards**:
   - Generates preview cards with thumbnails when links are shared on Google, WhatsApp, Facebook, or Twitter.

### 3 Steps to Verify with Google Search Console:
1. Open [Google Search Console](https://search.google.com/search-console).
2. Click **"Add Property"** -> Enter your deployed URL (e.g. `https://your-app.run.app` or your custom domain).
3. Choose **HTML tag** verification method:
   - Copy the verification code (e.g., `google-site-verification=abc123xyz...`).
   - Paste it into line 19 of `index.html`:
     ```html
     <meta name="google-site-verification" content="abc123xyz..." />
     ```
   - Deploy/Push and click **"Verify"** in Search Console.
4. Go to **"Sitemaps"** in the Search Console sidebar -> Enter `sitemap.xml` -> Click **"Submit"**.
5. Googlebot will crawl and index your application within 24 to 48 hours!

---

## 3. Dedicated Portal Separation (URL Architecture)

Your application is organized into 3 isolated, standalone web portals:

| Portal | URL Path | Intended Audience | Description |
| :--- | :--- | :--- | :--- |
| **Citizen & Patient Portal** | `/` | Rural citizens, patients, ASHA workers | 108 emergency calling, bilingual triage, remedies, offline token booking. Hospital controls are completely removed. |
| **Hospital & MO Command Portal** | `/hospital-portal` | Medical Superintendents, on-duty doctors | Standalone executive portal for live triage queue, bed allocation, doctor video roster, prescription receipts, and live resources. |
| **Developer Control Authority** | `/developer-portal` | Master Developer Ram Sri Charan | Provision hospital credentials, rotate passkeys, toggle access status, and view security audits. |
| **Robots Exclusion File** | `/robots.txt` | Googlebot, web crawlers | Governs search engine indexing and protects administrative interfaces. |
| **XML Sitemap** | `/sitemap.xml` | Google Search Console | Guides Googlebot to index all public healthcare tools. |
