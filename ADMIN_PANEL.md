# Admin Panel Documentation

## Overview

GaMaa Web now includes a complete **Admin Panel** for managing content, submissions, and customer interactions.

## Features

### 1. **Admin Authentication**
- Email/password-based login system
- Session management with localStorage tokens
- Secure admin area access control

### 2. **Dashboard**
- Real-time analytics overview
- Key metrics:
  - Contact form submissions count
  - Consultation requests count
  - Approved testimonials count
  - Published blog posts count
- Recent activity timeline

### 3. **Submissions Management**
- **Contact Form Submissions**: View all contact inquiries with:
  - Sender information (name, email, phone)
  - Subject and message content
  - Submission timestamp
  - Pagination support

- **Consultation Requests**: Track consultation inquiries with:
  - Client details
  - Service type requested
  - Budget information
  - Country/location
  - Contact information

### 4. **Testimonials Manager**
- Approve/reject pending testimonials
- View approved testimonials
- Manage customer feedback
- Filter by status (approved/pending)
- Delete unwanted testimonials

### 5. **Blog Post Management**
- Create new blog posts
- Edit existing content
- Publish/unpublish posts
- Delete posts
- Track publication status
- Author and date information

## Access the Admin Panel

### Login
Navigate to: `http://localhost:8081/admin/login`

**Default Admin Credentials** (After first setup):
- Email: `abhi.guptafr@gmail.com`
- Password: `Gamaa@123`

### Admin Routes
- **Dashboard**: `/admin/dashboard` - Overview and analytics
- **Submissions**: `/admin/submissions` - View contact & consultation forms
- **Testimonials**: `/admin/testimonials` - Manage customer testimonials
- **Blog**: `/admin/blog` - Create and manage blog posts

## File Structure

### Components
```
src/components/
├── AdminLogin.tsx              # Login form
├── AdminLayout.tsx             # Main admin layout wrapper
├── AdminDashboard.tsx          # Dashboard/analytics page
├── SubmissionsManager.tsx      # Contact & consultation submissions
├── TestimonialsManager.tsx     # Testimonials management
└── BlogManager.tsx             # Blog CRUD operations
```

### Libraries
```
src/lib/
├── admin-auth.ts               # Authentication utilities
├── admin-operations.ts         # Database operations
└── admin-server-fn.ts          # Server-side functions
```

### Routes
```
src/routes/
├── admin.tsx                   # Admin layout route
├── admin.login.tsx             # Login page
├── admin.dashboard.tsx         # Dashboard route
├── admin.submissions.tsx       # Submissions route
├── admin.testimonials.tsx      # Testimonials route
└── admin.blog.tsx              # Blog management route
```

## Setup Instructions

### 1. Create Admin User
The admin user must be created through the `registerAdmin` function. In production, this should:
- Only be callable once
- Require a setup token
- Have strong password requirements

```typescript
// In a server endpoint or during initial setup
await registerAdmin({
  email: 'admin@gamaa.com',
  password: 'SecurePassword123!',
  name: 'Admin User'
});
```

### 2. Configure Environment Variables
Ensure your `.env.local` includes:
```env
VITE_API_URL=http://localhost:8081
MONGODB_URI=your_mongodb_connection_string
```

### 3. Database Collections
The admin panel uses these MongoDB collections:
- `admin_users` - Admin user accounts
- `contact_submissions` - Contact form data
- `consultation_submissions` - Consultation requests
- `testimonials` - Customer testimonials
- `blog_posts` - Blog post content

## Usage Guide

### Creating a Blog Post
1. Navigate to `/admin/blog`
2. Click "New Post" button
3. Fill in:
   - Title
   - URL slug (auto-generated from title)
   - Excerpt (short summary)
   - Full content (supports Markdown)
   - Author name
4. Click "Create Post"
5. Post is created as draft (not published)
6. Click "Publish" to make it live

### Approving Testimonials
1. Go to `/admin/testimonials`
2. Switch to "Pending" tab
3. Review testimonial text
4. Click "Approve" to publish or "Delete" to reject
5. Approved testimonials appear on the website

### Managing Submissions
1. Navigate to `/admin/submissions`
2. View either "Contact Forms" or "Consultations" tab
3. Review submission details
4. Use pagination to navigate through submissions
5. Export or respond to submissions as needed

## Security Considerations

### Current Implementation
- Basic password hashing using SHA-256
- Token-based session management
- localStorage for client-side token storage

### Recommended Improvements for Production
1. **Implement proper JWT**
   - Use `jsonwebtoken` library
   - Add expiration times
   - Implement refresh tokens

2. **Upgrade Password Hashing**
   - Use bcrypt instead of SHA-256
   - Add salt rounds (10+)
   - Implement password strength requirements

3. **Add HTTPS**
   - Deploy with SSL certificates
   - Use secure cookies for tokens

4. **Environment Variables**
   - Use proper secrets management (Vercel Secrets, AWS Secrets Manager)
   - Never commit credentials

5. **Rate Limiting**
   - Add rate limiting to login endpoint
   - Prevent brute force attacks

6. **Admin User Management**
   - Implement role-based access control (RBAC)
   - Add user invitation system
   - Track admin actions with audit logs

## API Endpoints

### Authentication
- `POST /api/admin/register` - Register new admin user
- `POST /api/admin/login` - Login and get session token
- `POST /api/admin/verify` - Verify session token

### Data Retrieval
- `GET /api/admin/submissions` - Get contact submissions
- `GET /api/admin/consultations` - Get consultation requests
- `GET /api/admin/testimonials` - Get testimonials
- `GET /api/admin/blog` - Get blog posts
- `GET /api/admin/stats` - Get dashboard statistics

### Content Management
- `POST /api/admin/blog` - Create blog post
- `PUT /api/admin/blog/:id` - Update blog post
- `DELETE /api/admin/blog/:id` - Delete blog post
- `POST /api/admin/testimonials/:id/approve` - Approve testimonial
- `DELETE /api/admin/testimonials/:id` - Reject testimonial

## Deployment to Vercel

The admin panel works seamlessly with your existing Vercel deployment:

1. Admin routes are client-side only
2. No additional serverless functions needed (for basic functionality)
3. MongoDB connection works from client-side functions
4. Token storage in localStorage persists across sessions

### Vercel Configuration
No changes needed to `vercel.json` - admin panel uses existing setup.

## Troubleshooting

### Login Not Working
- Check browser console for errors
- Verify MongoDB connection
- Ensure admin user exists in database
- Clear localStorage and try again

### Routes Not Found
- Run `npm run build` to regenerate route tree
- Check that all route files are in `src/routes/`
- Verify route naming follows TanStack convention

### Data Not Loading
- Check MongoDB connection string
- Verify collections exist in database
- Check browser network tab for API errors
- Review server-side console logs

## Future Enhancements

- [ ] User role-based access control
- [ ] Email notifications for new submissions
- [ ] Advanced search and filtering
- [ ] Data export to CSV/PDF
- [ ] Scheduled automated tasks
- [ ] Activity logging and audit trails
- [ ] Two-factor authentication
- [ ] Admin user invitation system
- [ ] Advanced analytics and reporting
- [ ] Content scheduling for blog posts
