import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { ObjectId } from 'mongodb';
import { getMongoDb } from '@/server/mongodb';
import { verifyToken } from './admin-auth';
import { readStoredContactSubmissions } from '@/server/contact-submission-store';
import { readStoredConsultationSubmissions } from '@/server/consultation-submission-store';
import { readStoredTestimonials, readLocalPendingTestimonials } from '@/server/testimonial-store';
import {
  readAdminBlogPosts,
  deleteStoredBlogPost,
  saveBlogPost as saveLocalBlogPost,
  updateStoredBlogPost,
} from '@/server/blog-store';

const adminTokenSchema = z.object({
  token: z.string().min(1),
});

const paginationSchema = adminTokenSchema.extend({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(50).default(10),
});

const blogPostSchema = adminTokenSchema.extend({
  title: z.string().trim().min(2).max(200),
  slug: z.string().trim().min(2).max(220),
  excerpt: z.string().trim().min(10).max(400),
  content: z.string().trim().min(20).max(20000),
  author: z.string().trim().min(2).max(80),
});

const blogUpdateSchema = adminTokenSchema.extend({
  postId: z.string().min(1),
  title: z.string().trim().min(2).max(200).optional(),
  slug: z.string().trim().min(2).max(220).optional(),
  excerpt: z.string().trim().min(10).max(400).optional(),
  content: z.string().trim().min(20).max(20000).optional(),
  author: z.string().trim().min(2).max(80).optional(),
  published: z.boolean().optional(),
});

const testimonialActionSchema = adminTokenSchema.extend({
  submissionId: z.string().min(1),
});

function requireAdmin(token: string) {
  const payload = verifyToken(token);
  if (!payload?.email) {
    throw new Error('Unauthorized');
  }

  return payload.email;
}

function toIsoString(value: unknown) {
  if (!value) return new Date().toISOString();
  if (value instanceof Date) return value.toISOString();
  const parsed = new Date(value as string);
  return Number.isNaN(parsed.getTime()) ? new Date().toISOString() : parsed.toISOString();
}

function estimateReadTime(content: string) {
  const words = content.split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.round(words / 180));
  return `${minutes} min read`;
}

function slugToCategory(slug: string) {
  if (slug.includes('security')) return 'Security';
  if (slug.includes('automation')) return 'Automation';
  if (slug.includes('web')) return 'Web Dev';
  if (slug.includes('cloud')) return 'IT Solutions';
  return 'Blog';
}

export const getAdminStats = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) => adminTokenSchema.parse(data))
  .handler(async ({ data }) => {
    requireAdmin(data.token);

    try {
      const db = await getMongoDb();

      const [contactSubmissions, consultationSubmissions, testimonialPublished, testimonialPending, blogPosts] = await Promise.all([
        db.collection('contact_submissions').countDocuments(),
        db.collection('consultation_submissions').countDocuments(),
        db.collection('testimonials_published').countDocuments(),
        db.collection('testimonials_pending').countDocuments(),
        db.collection('blog_posts').countDocuments(),
      ]);

      return {
        contactSubmissions,
        consultationSubmissions,
        testimonials: testimonialPublished + testimonialPending,
        blogPosts,
      };
    } catch {
      const [contactSubmissions, consultationSubmissions, testimonials, blogPosts] = await Promise.all([
        readStoredContactSubmissions(),
        readStoredConsultationSubmissions(),
        Promise.all([readStoredTestimonials(), readLocalPendingTestimonials()]).then(([published, pending]) => published.length + pending.length),
        readAdminBlogPosts(),
      ]);

      return {
        contactSubmissions: contactSubmissions.length,
        consultationSubmissions: consultationSubmissions.length,
        testimonials,
        blogPosts: blogPosts.length,
      };
    }
  });

export const getContactSubmissions = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) => paginationSchema.parse(data))
  .handler(async ({ data }) => {
    requireAdmin(data.token);

    try {
      const db = await getMongoDb();
      const skip = (data.page - 1) * data.limit;

      const total = await db.collection('contact_submissions').countDocuments();
      const submissions = await db
        .collection('contact_submissions')
        .find({})
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(data.limit)
        .toArray();

      return {
        submissions: submissions.map((submission) => ({
          ...submission,
          _id: submission._id.toString(),
          createdAt: toIsoString(submission.createdAt),
        })),
        total,
        pages: Math.ceil(total / data.limit),
      };
    } catch {
      const submissions = await readStoredContactSubmissions();
      const start = (data.page - 1) * data.limit;
      const paged = submissions.slice(start, start + data.limit);

      return {
        submissions: paged.map((submission) => ({
          ...submission,
          _id: submission.id,
          createdAt: submission.createdAt,
        })),
        total: submissions.length,
        pages: Math.ceil(submissions.length / data.limit),
      };
    }
  });

export const getConsultationSubmissions = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) => paginationSchema.parse(data))
  .handler(async ({ data }) => {
    requireAdmin(data.token);

    try {
      const db = await getMongoDb();
      const skip = (data.page - 1) * data.limit;

      const total = await db.collection('consultation_submissions').countDocuments();
      const submissions = await db
        .collection('consultation_submissions')
        .find({})
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(data.limit)
        .toArray();

      return {
        submissions: submissions.map((submission) => ({
          ...submission,
          _id: submission._id.toString(),
          createdAt: toIsoString(submission.createdAt),
        })),
        total,
        pages: Math.ceil(total / data.limit),
      };
    } catch {
      const stored = await readStoredConsultationSubmissions();
      const start = (data.page - 1) * data.limit;
      const paged = stored.slice(start, start + data.limit);

      return {
        submissions: paged.map((submission) => ({
          ...submission,
          _id: submission.id,
          createdAt: submission.createdAt.toISOString(),
        })),
        total: stored.length,
        pages: Math.ceil(stored.length / data.limit),
      };
    }
  });

export const getTestimonials = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) => adminTokenSchema.parse(data))
  .handler(async ({ data }) => {
    requireAdmin(data.token);

    try {
      const db = await getMongoDb();

      const [published, pending] = await Promise.all([
        db.collection('testimonials_published').find({}).sort({ verifiedAt: -1, createdAt: -1 }).toArray(),
        db.collection('testimonials_pending').find({}).sort({ createdAt: -1 }).toArray(),
      ]);

      return {
        published: published.map((testimonial) => ({
          ...testimonial,
          _id: testimonial._id.toString(),
          createdAt: toIsoString(testimonial.createdAt),
          verifiedAt: toIsoString(testimonial.verifiedAt),
          status: 'published' as const,
        })),
        pending: pending.map((testimonial) => ({
          ...testimonial,
          _id: testimonial._id.toString(),
          createdAt: toIsoString(testimonial.createdAt),
          status: 'pending' as const,
        })),
      };
    } catch {
      const published = await readStoredTestimonials();
      const pending = await readLocalPendingTestimonials();
      return {
        published: published.map((testimonial) => ({
          ...testimonial,
          status: 'published' as const,
        })),
        pending: pending.map((testimonial) => ({
          _id: testimonial.id,
          name: testimonial.name,
          email: testimonial.email,
          role: testimonial.role,
          content: testimonial.content,
          rating: testimonial.rating,
          image: testimonial.image,
          createdAt: testimonial.createdAt,
          status: 'pending' as const,
        })),
      };
    }
  });

export const approveTestimonial = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) => testimonialActionSchema.parse(data))
  .handler(async ({ data }) => {
    requireAdmin(data.token);

    try {
      const db = await getMongoDb();

      if (!ObjectId.isValid(data.submissionId)) {
        throw new Error('Invalid testimonial id');
      }

      const pendingCollection = db.collection('testimonials_pending');
      const publishedCollection = db.collection('testimonials_published');
      const pending = await pendingCollection.findOne({ _id: new ObjectId(data.submissionId) });

      if (!pending) {
        throw new Error('Testimonial not found');
      }

      await publishedCollection.insertOne({
        name: pending.name,
        email: pending.email,
        role: pending.role,
        content: pending.content,
        rating: pending.rating,
        image: pending.image,
        createdAt: pending.createdAt,
        verifiedAt: new Date(),
      });

      await pendingCollection.deleteOne({ _id: pending._id });
      return { success: true };
    } catch {
      return { success: false };
    }
  });

export const rejectTestimonial = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) => testimonialActionSchema.parse(data))
  .handler(async ({ data }) => {
    requireAdmin(data.token);

    try {
      const db = await getMongoDb();

      if (!ObjectId.isValid(data.submissionId)) {
        throw new Error('Invalid testimonial id');
      }

      const pendingCollection = db.collection('testimonials_pending');
      const result = await pendingCollection.deleteOne({ _id: new ObjectId(data.submissionId) });

      return { success: result.deletedCount > 0 };
    } catch {
      return { success: false };
    }
  });

export const getBlogPosts = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) => adminTokenSchema.parse(data))
  .handler(async ({ data }) => {
    requireAdmin(data.token);

    try {
      const db = await getMongoDb();

      const posts = await db.collection('blog_posts').find({}).sort({ createdAt: -1 }).toArray();

      return {
        posts: posts.map((post) => ({
          ...post,
          _id: post._id.toString(),
          createdAt: toIsoString(post.createdAt),
          updatedAt: toIsoString(post.updatedAt),
        })),
      };
    } catch {
      const posts = await readAdminBlogPosts();
      return {
        posts: posts.map((post) => ({
          _id: post.id,
          title: post.title,
          slug: post.slug,
          excerpt: post.excerpt,
          content: post.content,
          author: post.author,
          published: post.published,
          createdAt: post.createdAt,
          updatedAt: post.updatedAt,
        })),
      };
    }
  });

export const createBlogPost = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) => blogPostSchema.parse(data))
  .handler(async ({ data }) => {
    requireAdmin(data.token);

    try {
      const db = await getMongoDb();

      const result = await db.collection('blog_posts').insertOne({
        title: data.title,
        slug: data.slug,
        excerpt: data.excerpt,
        content: data.content,
        author: data.author,
        published: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      return { success: true, id: result.insertedId.toString() };
    } catch {
      const saved = await saveLocalBlogPost({
        title: data.title,
        slug: data.slug,
        excerpt: data.excerpt,
        content: data.content,
        author: data.author,
        published: false,
        category: 'Blog',
        gradient: 'from-blue-600/20 to-cyan-500/20',
      });

      return { success: true, id: saved.id };
    }
  });

export const updateBlogPost = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) => blogUpdateSchema.parse(data))
  .handler(async ({ data }) => {
    requireAdmin(data.token);

    try {
      const db = await getMongoDb();

      if (!ObjectId.isValid(data.postId)) {
        throw new Error('Invalid blog post id');
      }

      const { token, postId, ...updates } = data;
      const result = await db.collection('blog_posts').updateOne(
        { _id: new ObjectId(postId) },
        { $set: { ...updates, updatedAt: new Date() } }
      );

      return { success: result.modifiedCount > 0 };
    } catch {
      const updated = await updateStoredBlogPost(data.postId, {
        title: data.title,
        slug: data.slug,
        excerpt: data.excerpt,
        content: data.content,
        author: data.author,
        published: data.published,
      });

      return { success: !!updated };
    }
  });

export const deleteBlogPost = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) => adminTokenSchema.extend({ postId: z.string().min(1) }).parse(data))
  .handler(async ({ data }) => {
    requireAdmin(data.token);

    try {
      const db = await getMongoDb();

      if (!ObjectId.isValid(data.postId)) {
        throw new Error('Invalid blog post id');
      }

      const result = await db.collection('blog_posts').deleteOne({ _id: new ObjectId(data.postId) });
      return { success: result.deletedCount > 0 };
    } catch {
      return { success: await deleteStoredBlogPost(data.postId) };
    }
  });