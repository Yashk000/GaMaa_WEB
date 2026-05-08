# Complete Setup Guide: GaMaa Web with Admin Panel, Database & Hosting

This guide covers everything needed to host GaMaa Web with a fully functional admin panel, database storage for forms, and cloud hosting.

---

## Phase 1: Local Development Setup

### Prerequisites
- Node.js 18+ installed
- MongoDB Atlas account (free tier available)
- Git (for version control)
- VS Code or any code editor

---

## Phase 2: MongoDB Atlas Setup (FREE)

### Step 1: Create MongoDB Atlas Account
1. Go to https://www.mongodb.com/cloud/atlas
2. Click "Sign Up" (or use Google/GitHub to sign up)
3. Create a free account

### Step 2: Create a Database
1. After login, click "Create a Deployment"
2. Choose **M0 Cluster (Free Tier)** - gives you 512MB free storage
3. Select your preferred region (e.g., Mumbai for India, N. Virginia for US)
4. Click "Create Deployment"
5. Wait 2-3 minutes for cluster to be ready

### Step 3: Create Database User
1. Go to "Database Access" in the left sidebar
2. Click "Add New Database User"
3. Choose "Password" authentication
4. Create username: `gamaa_admin`
5. Create password: `Generate secure password` (copy this)
6. Click "Add User"

### Step 4: Configure IP Whitelist
1. Go to "Network Access" in left sidebar
2. Click "Add IP Address"
3. Choose "Allow access from anywhere" (add `0.0.0.0/0`)
   - ⚠️ For production, only add your hosting provider's IP
4. Click "Confirm"

### Step 5: Get Connection String
1. Go back to "Clusters" 
2. Click "Connect" on your cluster
3. Choose "Drivers" → Node.js
4. Copy the connection string
5. It looks like: `mongodb+srv://gamaa_admin:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority`
6. **Replace `<password>` with the password you created in Step 3**

---

## Phase 3: Local Environment Configuration

### Step 1: Create `.env.local` File
In the `GaMaa Web` folder, create a file named `.env.local`:

```env
# MongoDB Configuration
MONGODB_URI=mongodb+srv://gamaa_admin:YOUR_PASSWORD_HERE@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
MONGODB_DB_NAME=gamaa_tech_hub

# Admin Credentials
ADMIN_EMAIL=abhi.guptafr@gmail.com
ADMIN_PASSWORD=Gamaa@123

# Optional: Google Sheets Integration (for contact forms)
GOOGLE_SHEETS_WEBHOOK_URL=your_webhook_url_here
```

**Replace:**
- `YOUR_PASSWORD_HERE` with your MongoDB user password
- `cluster0.xxxxx` with your actual cluster address

### Step 2: Install Dependencies
```bash
npm install
# or
bun install
```

### Step 3: Start Development Server
```bash
npm run dev
# Server runs at http://localhost:8080
```

---

## Phase 4: Test Everything Locally

### Test Contact Form
1. Go to http://localhost:8080
2. Scroll to "Contact Us" section
3. Fill the form and submit
4. Check MongoDB Atlas → Collections → `contact_submissions` to verify data was saved

### Test Admin Panel
1. Go to http://localhost:8080/admin/login
2. Login with:
   - Email: `abhi.guptafr@gmail.com`
   - Password: `Gamaa@123`
3. Navigate to "Submissions" tab
4. You should see the contact form submission you just created

### What Saves to Database
- ✅ Contact form submissions → `contact_submissions` collection
- ✅ Consultation requests → `consultation_submissions` collection (auto-saved)
- ✅ Testimonials → `testimonials` collection
- ✅ Admin credentials → `admin_users` collection
- ✅ Blog posts → `blog_posts` collection

---

## Phase 5: Customize Content in Admin Panel

### Edit Everything from Admin
The admin panel (`/admin/dashboard`) lets you:

1. **Dashboard** - View all statistics
2. **Submissions** - See all contact & consultation form submissions
3. **Testimonials** - Approve/reject customer testimonials
4. **Blog** - Create, edit, publish, delete blog posts

### Creating a Blog Post
1. Go to `/admin/blog`
2. Click "New Post"
3. Fill: Title, Excerpt, Content, Author
4. Click "Create Post"
5. Click "Publish" to make it live on your website

---

## Phase 6: Deployment to Vercel (FREE HOSTING)

### Step 1: Create Vercel Account
1. Go to https://vercel.com
2. Sign up with GitHub/GitLab/Bitbucket
3. Connect your repository

### Step 2: Push Code to GitHub
```bash
# If not already done
git init
git add .
git commit -m "Initial commit with admin panel and database"
git remote add origin https://github.com/YOUR_USERNAME/gamaa-tech-hub.git
git branch -M main
git push -u origin main
```

### Step 3: Deploy on Vercel
1. Go to https://vercel.com/new
2. Import your GitHub repository
3. Select `GaMaa Web` folder as root directory
4. Click "Environment Variables"
5. Add these environment variables:

```
MONGODB_URI = mongodb+srv://gamaa_admin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
MONGODB_DB_NAME = gamaa_tech_hub
ADMIN_EMAIL = abhi.guptafr@gmail.com
ADMIN_PASSWORD = Gamaa@123
```

6. Click "Deploy"
7. Wait 2-5 minutes for deployment to complete
8. Your site will be live at: `https://your-project-name.vercel.app`

### Step 4: Update MongoDB IP Whitelist
1. In MongoDB Atlas, go to "Network Access"
2. You already allowed `0.0.0.0/0` so Vercel can connect ✅

---

## Phase 7: Custom Domain (Optional but Recommended)

### Add Your Domain to Vercel
1. Go to Vercel Dashboard → Select your project
2. Go to "Settings" → "Domains"
3. Enter your custom domain (e.g., `gamaatech.com`)
4. Update your domain's DNS settings according to Vercel's instructions
5. Usually takes 24 hours to fully propagate

---

## Phase 8: Editable Content - Quick Reference

Everything is editable from the admin panel:

### Content You Can Edit:
- ✏️ **Blog Posts** - Write, schedule, publish articles
- ✏️ **Testimonials** - Approve customer feedback
- ✏️ **Services** - Update service descriptions in config
- ✏️ **Admin Users** - Add more admin users (if implemented)

### Content Stored in Database:
- 📊 All form submissions (contact, consultation)
- 📝 All blog posts
- ⭐ All testimonials
- 👥 Admin accounts

---

## Phase 9: Security Best Practices

### Before Going Live
1. **Change Admin Password** in `/src/lib/admin-server-fn.ts`
2. **Restrict MongoDB IP** to only Vercel in production
3. **Enable MongoDB IP Whitelist** instead of allowing all IPs
4. **Use Strong Passwords** - at least 12 characters with symbols

### Production Checklist
- [ ] MongoDB credentials secured in environment variables
- [ ] Admin password changed from default
- [ ] HTTPS enabled (Vercel does this automatically)
- [ ] Contact forms saving to database
- [ ] Admin panel accessible only to authorized users
- [ ] Regular database backups enabled (MongoDB Atlas does this)

---

## Phase 10: Troubleshooting

### Contact Form Not Saving
**Solution:**
1. Check MongoDB connection string in `.env.local`
2. Verify database user password is correct
3. Check browser console for errors
4. Verify `contact_submissions` collection exists in MongoDB

### Admin Login Not Working
**Solution:**
1. Clear browser cookies and localStorage
2. Verify email and password in `.env.local`
3. Check if both values match credentials in `admin-server-fn.ts`
4. Try incognito/private browser mode

### Submissions Not Showing in Admin
**Solution:**
1. Refresh the admin page
2. Check MongoDB connection in server logs
3. Verify the collection name is `contact_submissions`
4. Check database access permissions

### Deployment Fails
**Solution:**
1. Check that all environment variables are set in Vercel
2. Verify MongoDB URI is correct (with password)
3. Check Vercel build logs for errors
4. Ensure `package.json` has all required dependencies

---

## Phase 11: Scaling & Advanced Features

### Future Enhancements
- [ ] Email notifications when forms are submitted
- [ ] SMS notifications via Twilio
- [ ] Payment processing (Stripe integration)
- [ ] User accounts for clients
- [ ] Email verification for submissions
- [ ] Automated backups to cloud storage
- [ ] Search functionality in submissions
- [ ] Data export to CSV/PDF

### Adding More Admins
To add more admin users, create a server endpoint or use MongoDB Atlas UI:
1. Go to MongoDB Atlas → Collections → `admin_users`
2. Insert new document with:
```json
{
  "email": "newadmin@example.com",
  "passwordHash": "sha256_hashed_password",
  "name": "Admin Name",
  "role": "admin",
  "createdAt": new Date(),
  "lastLogin": null
}
```

---

## Quick Commands Reference

```bash
# Local development
npm run dev           # Start dev server
npm run build         # Build for production
npm run preview       # Preview production build

# Database
# MongoDB Atlas UI: https://cloud.mongodb.com

# Deployment
# Vercel Dashboard: https://vercel.com/dashboard
```

---

## Contact & Support Files

- **Main Docs:** `ADMIN_PANEL.md`
- **Setup Guide:** `SETUP_GUIDE.md` (this file)
- **Admin Config:** `src/lib/admin-server-fn.ts`
- **Database:** `src/server/mongodb.ts`

---

## Final Checklist

- [ ] MongoDB Atlas account created
- [ ] Database user created
- [ ] IP whitelist configured
- [ ] Connection string copied
- [ ] `.env.local` file created with MongoDB URI
- [ ] Local server tested (npm run dev)
- [ ] Contact form tested and data saved to DB
- [ ] Admin login tested
- [ ] GitHub repository created
- [ ] Vercel account created
- [ ] Project deployed to Vercel
- [ ] Environment variables set in Vercel
- [ ] Live website tested at Vercel URL
- [ ] Custom domain configured (if applicable)

---

## Support Resources

- **MongoDB Docs:** https://docs.mongodb.com/
- **Vercel Docs:** https://vercel.com/docs
- **TanStack Router:** https://tanstack.com/router/latest
- **React Documentation:** https://react.dev

---

**Last Updated:** May 7, 2026

For questions or issues, check the troubleshooting section or review the error logs in your browser console and server logs.
