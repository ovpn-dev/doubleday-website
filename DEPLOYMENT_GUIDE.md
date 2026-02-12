# Doubleday Expressions Website - Deployment Guide

## Quick Start (5 Minutes)

### Step 1: Extract and Setup
1. Extract all files from the zip
2. Open terminal/command prompt in the project folder
3. Run: `npm install`

### Step 2: Test Locally
```bash
npm run dev
```
Visit: http://localhost:3000

### Step 3: Build for Production
```bash
npm run build
```
This creates a `dist` folder with your website.

---

## Deployment Options

### 🚀 OPTION 1: Vercel (EASIEST - Recommended)

**Free hosting with automatic SSL and global CDN**

1. Go to [vercel.com](https://vercel.com) and sign up
2. Click "Add New" → "Project"
3. Import from Git or drag the project folder
4. Vercel auto-detects Vite settings
5. Click "Deploy"
6. Your site is live in 30 seconds! 🎉

**Custom Domain:**
- Go to project settings → Domains
- Add your domain (e.g., doubledayexpressions.com)
- Follow DNS instructions

---

### 🌐 OPTION 2: Netlify

**Free hosting with continuous deployment**

1. Go to [netlify.com](https://netlify.com) and sign up
2. Drag the `dist` folder to Netlify's deploy area
3. Or connect your Git repository
4. Site is live instantly!

**Build Settings:**
- Build command: `npm run build`
- Publish directory: `dist`

---

### 📦 OPTION 3: Traditional Hosting (cPanel, etc.)

1. Build the project:
```bash
npm run build
```

2. Upload `dist` folder contents to your server:
   - Via FTP (FileZilla, etc.)
   - Via cPanel File Manager
   - Upload to `public_html` or `www` folder

3. Configure `.htaccess` (for Apache servers):
```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

---


### ☁️ OPTION 5: Cloudflare (Pages or Workers Assets)

If you deploy with **Cloudflare Pages**:
- Build command: `npm run build`
- Build output directory: `dist`
- Do **not** set a custom deploy command like `wrangler versions upload` in Pages.

If you deploy with **Wrangler** (Workers Assets):
- Keep `wrangler.jsonc` with `assets.directory` set to `./dist`
- Build first: `npm run build`
- Deploy: `npx wrangler versions upload`

### ☁️ OPTION 4: GitHub Pages

1. Install gh-pages:
```bash
npm install --save-dev gh-pages
```

2. Add to `package.json`:
```json
{
  "scripts": {
    "predeploy": "npm run build",
    "deploy": "gh-pages -d dist"
  },
  "homepage": "https://yourusername.github.io/doubleday-website"
}
```

3. Deploy:
```bash
npm run deploy
```

---

## Custom Domain Setup

### For Vercel/Netlify:
1. Go to project dashboard → Domain settings
2. Add your domain
3. Update DNS records at your domain registrar:
   ```
   Type: A
   Name: @
   Value: [Provided IP]
   
   Type: CNAME
   Name: www
   Value: [Provided domain]
   ```

### For Traditional Hosting:
1. Point your domain's A record to your server IP
2. Add CNAME for www subdomain if needed

---

## SSL Certificate (HTTPS)

- **Vercel/Netlify**: Automatic SSL ✅
- **Traditional Hosting**: 
  - Use Let's Encrypt (free) via cPanel
  - Or use Cloudflare free plan

---

## Post-Deployment Checklist

✅ Test all navigation links
✅ Check mobile responsiveness
✅ Verify contact form/email links work
✅ Test on different browsers
✅ Check page load speed (use PageSpeed Insights)
✅ Submit sitemap to Google Search Console
✅ Verify meta tags with Facebook Sharing Debugger

---

## SEO Setup (After Deployment)

### 1. Google Search Console
1. Go to [search.google.com/search-console](https://search.google.com/search-console)
2. Add your domain
3. Verify ownership
4. Submit sitemap: `https://yourdomain.com/sitemap.xml`

### 2. Google Analytics (Optional)
1. Create account at [analytics.google.com](https://analytics.google.com)
2. Get tracking ID
3. Add to `index.html` before `</head>`:
```html
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

### 3. Create Sitemap
Add to `public/sitemap.xml`:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://yourdomain.com/</loc>
    <lastmod>2024-01-01</lastmod>
    <priority>1.0</priority>
  </url>
</urlset>
```

---

## Maintenance Tips

### Update Content:
1. Edit `src/App.jsx`
2. Run `npm run build`
3. Re-upload `dist` folder (or push to Git for auto-deploy)

### Update Dependencies:
```bash
npm update
```

### Backup:
- Backup entire project folder regularly
- Keep a copy of the `dist` folder
- Version control with Git recommended

---

## Troubleshooting

**Issue: Blank page after deployment**
- Solution: Check browser console for errors
- Ensure all paths are relative (no leading slashes)

**Issue: 404 on refresh**
- Solution: Configure server redirects (see .htaccess above)

**Issue: Styles not loading**
- Solution: Run `npm run build` again
- Clear browser cache

---

## Performance Tips

1. **Enable Compression** (gzip/brotli) on your server
2. **Use Cloudflare** for free CDN and caching
3. **Optimize Images** before adding to site
4. **Enable Browser Caching** via .htaccess

---

## Support

For technical issues:
- Email: doubledayexpressions@gmail.com
- Check README.md for detailed documentation

---

**Your website is production-ready!** 🎉

Choose any deployment option above and your site will be live in minutes.
