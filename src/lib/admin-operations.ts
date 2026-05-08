import { db } from './mongodb';
import { verifyToken } from './admin-auth';
import type { AdminUser } from './admin-auth';

// Middleware to verify admin token
export function verifyAdminToken(token: string | undefined): string | null {
  if (!token) return null;
  const payload = verifyToken(token);
  if (!payload) return null;
  return payload.email;
}

// Get submissions statistics
export async function getAdminStats(email: string) {
  const adminDb = db();
  if (!adminDb) throw new Error('Database not initialized');

  try {
    const contactSubmissions = await adminDb
      .collection('contact_submissions')
      .countDocuments();
    const consultationSubmissions = await adminDb
      .collection('consultation_submissions')
      .countDocuments();
    const testimonials = await adminDb
      .collection('testimonials')
      .countDocuments();
    const blogPosts = await adminDb
      .collection('blog_posts')
      .countDocuments();

    return {
      contactSubmissions,
      consultationSubmissions,
      testimonials,
      blogPosts,
    };
  } catch (error) {
    console.error('Error fetching stats:', error);
    throw error;
  }
}

// Get paginated contact submissions
export async function getContactSubmissions(
  email: string,
  page: number = 1,
  limit: number = 10
) {
  const adminDb = db();
  if (!adminDb) throw new Error('Database not initialized');

  try {
    const skip = (page - 1) * limit;
    const total = await adminDb
      .collection('contact_submissions')
      .countDocuments();
    const submissions = await adminDb
      .collection('contact_submissions')
      .find({})
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    return {
      submissions: submissions.map((s) => ({
        ...s,
        _id: s._id.toString(),
      })),
      total,
      pages: Math.ceil(total / limit),
    };
  } catch (error) {
    console.error('Error fetching contact submissions:', error);
    throw error;
  }
}

// Get paginated consultation submissions
export async function getConsultationSubmissions(
  email: string,
  page: number = 1,
  limit: number = 10
) {
  const adminDb = db();
  if (!adminDb) throw new Error('Database not initialized');

  try {
    const skip = (page - 1) * limit;
    const total = await adminDb
      .collection('consultation_submissions')
      .countDocuments();
    const submissions = await adminDb
      .collection('consultation_submissions')
      .find({})
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    return {
      submissions: submissions.map((s) => ({
        ...s,
        _id: s._id.toString(),
      })),
      total,
      pages: Math.ceil(total / limit),
    };
  } catch (error) {
    console.error('Error fetching consultation submissions:', error);
    throw error;
  }
}

// Get testimonials with approval status
export async function getTestimonials(
  email: string,
  page: number = 1,
  limit: number = 10
) {
  const adminDb = db();
  if (!adminDb) throw new Error('Database not initialized');

  try {
    const skip = (page - 1) * limit;
    const total = await adminDb.collection('testimonials').countDocuments();
    const testimonials = await adminDb
      .collection('testimonials')
      .find({})
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    return {
      testimonials: testimonials.map((t) => ({
        ...t,
        _id: t._id.toString(),
      })),
      total,
      pages: Math.ceil(total / limit),
    };
  } catch (error) {
    console.error('Error fetching testimonials:', error);
    throw error;
  }
}

// Approve testimonial
export async function approveTestimonial(email: string, testimonialId: string) {
  const adminDb = db();
  if (!adminDb) throw new Error('Database not initialized');

  try {
    const { ObjectId } = await import('mongodb');
    const result = await adminDb
      .collection('testimonials')
      .updateOne(
        { _id: new ObjectId(testimonialId) },
        { $set: { approved: true, approvedAt: new Date() } }
      );

    return result.modifiedCount > 0;
  } catch (error) {
    console.error('Error approving testimonial:', error);
    throw error;
  }
}

// Reject testimonial
export async function rejectTestimonial(email: string, testimonialId: string) {
  const adminDb = db();
  if (!adminDb) throw new Error('Database not initialized');

  try {
    const { ObjectId } = await import('mongodb');
    const result = await adminDb
      .collection('testimonials')
      .deleteOne({ _id: new ObjectId(testimonialId) });

    return result.deletedCount > 0;
  } catch (error) {
    console.error('Error rejecting testimonial:', error);
    throw error;
  }
}

// Blog post CRUD operations
export async function getBlogPosts(
  email: string,
  page: number = 1,
  limit: number = 10
) {
  const adminDb = db();
  if (!adminDb) throw new Error('Database not initialized');

  try {
    const skip = (page - 1) * limit;
    const total = await adminDb.collection('blog_posts').countDocuments();
    const posts = await adminDb
      .collection('blog_posts')
      .find({})
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    return {
      posts: posts.map((p) => ({
        ...p,
        _id: p._id.toString(),
      })),
      total,
      pages: Math.ceil(total / limit),
    };
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    throw error;
  }
}

export async function createBlogPost(
  email: string,
  post: {
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    author: string;
  }
) {
  const adminDb = db();
  if (!adminDb) throw new Error('Database not initialized');

  try {
    const result = await adminDb.collection('blog_posts').insertOne({
      ...post,
      published: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return {
      _id: result.insertedId.toString(),
      ...post,
      published: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  } catch (error) {
    console.error('Error creating blog post:', error);
    throw error;
  }
}

export async function updateBlogPost(
  email: string,
  postId: string,
  updates: Partial<{
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    author: string;
    published: boolean;
  }>
) {
  const adminDb = db();
  if (!adminDb) throw new Error('Database not initialized');

  try {
    const { ObjectId } = await import('mongodb');
    const result = await adminDb.collection('blog_posts').updateOne(
      { _id: new ObjectId(postId) },
      {
        $set: {
          ...updates,
          updatedAt: new Date(),
        },
      }
    );

    return result.modifiedCount > 0;
  } catch (error) {
    console.error('Error updating blog post:', error);
    throw error;
  }
}

export async function deleteBlogPost(email: string, postId: string) {
  const adminDb = db();
  if (!adminDb) throw new Error('Database not initialized');

  try {
    const { ObjectId } = await import('mongodb');
    const result = await adminDb
      .collection('blog_posts')
      .deleteOne({ _id: new ObjectId(postId) });

    return result.deletedCount > 0;
  } catch (error) {
    console.error('Error deleting blog post:', error);
    throw error;
  }
}
