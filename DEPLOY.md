# 🚀 Deploy DevFolio to Vercel (Free) — Step by Step

## What You Need
- GitHub account (free) → github.com
- Vercel account (free) → vercel.com
- Neon account (free) → neon.tech

---

## STEP 1 — Set Up Free Database (Neon)

1. Go to **https://neon.tech** and click **Sign Up** (use GitHub login)
2. Click **"New Project"**
3. Name it: `devfolio` → Region: choose closest to you → Click **Create Project**
4. You'll see a **Connection String** like:
   ```
   postgresql://user:password@ep-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require
   ```
5. **Copy this string** — you'll need it soon

---

## STEP 2 — Upload Code to GitHub

1. Go to **https://github.com** → Click **"New Repository"**
2. Name it `devfolio` → Set to **Public** → Click **Create repository**
3. On your computer, extract the `devfolio-next.zip`
4. Open terminal inside the folder and run:

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/devfolio.git
git push -u origin main
```

> Replace `YOUR_USERNAME` with your GitHub username

---

## STEP 3 — Deploy to Vercel

1. Go to **https://vercel.com** → Click **Sign Up** (use GitHub login)
2. Click **"Add New Project"**
3. Click **"Import"** next to your `devfolio` repository
4. Vercel auto-detects Next.js ✅ — don't change the settings
5. Before clicking Deploy, click **"Environment Variables"** and add these:

| Name | Value |
|------|-------|
| `DATABASE_URL` | Your Neon connection string from Step 1 |
| `JWT_SECRET` | Any random string (e.g. `mySecretKey123!@#xyz`) |
| `ADMIN_USERNAME` | `admin` |
| `ADMIN_PASSWORD` | Choose your own password |

6. Click **"Deploy"** 🎉

Wait ~2 minutes. Vercel gives you a free URL like:
```
https://devfolio-abc123.vercel.app
```

---

## STEP 4 — Initialize the Database (One Time Only)

After deployment, visit this URL **once**:
```
https://your-site.vercel.app/api/init
```

You should see:
```json
{ "success": true, "message": "Database initialized!" }
```

This creates the database tables. **Done!**

---

## STEP 5 — Test Your Site

- **Public site:** `https://your-site.vercel.app`
- **Admin panel:** `https://your-site.vercel.app/admin`
  - Username: whatever you set in `ADMIN_USERNAME`
  - Password: whatever you set in `ADMIN_PASSWORD`

---

## STEP 6 — Custom Domain (Optional, Free)

1. In Vercel dashboard → your project → **Settings → Domains**
2. Add your domain (e.g. `yourname.com`)
3. Update your domain DNS with the values Vercel shows you

Or get a free domain at **freenom.com** (.tk, .ml, .ga domains)

---

## 🔄 How to Update Your Site Later

Just push to GitHub and Vercel auto-deploys:
```bash
git add .
git commit -m "Updated something"
git push
```

Vercel will redeploy automatically in ~1 minute.

---

## 📊 Free Tier Limits

| Service | Free Limit |
|---------|-----------|
| Vercel | 100GB bandwidth/month, unlimited deployments |
| Neon DB | 0.5 GB storage, 1 database |

**More than enough for your freelance portfolio site!**

---

## ❓ Troubleshooting

**Build fails?**
→ Check Environment Variables are set correctly in Vercel dashboard

**Database error?**
→ Make sure you visited `/api/init` after first deploy

**Can't login to admin?**
→ Double-check `ADMIN_USERNAME` and `ADMIN_PASSWORD` in Vercel env vars

**Need help?** Check Vercel docs: https://vercel.com/docs
