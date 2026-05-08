import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { getMongoDb } from '@/server/mongodb';
import { readPublishedBlogPostById, readPublishedBlogPosts } from '@/server/blog-store';

const blogPostParamsSchema = z.object({
  postId: z.string().min(1),
});

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

function mapDbPost(post: any) {
  const slug = post.slug || post._id.toString();
  return {
    id: slug,
    title: post.title,
    excerpt: post.excerpt,
    date: toIsoString(post.createdAt),
    readTime: estimateReadTime(post.content || ''),
    category: post.category || 'Blog',
    gradient: post.gradient || 'from-blue-600/20 to-cyan-500/20',
    content: String(post.content || '')
      .split(/\n\n+/)
      .map((part) => part.trim())
      .filter(Boolean),
  };
}

export const getPublishedBlogPosts = createServerFn({ method: 'GET' }).handler(async () => {
  try {
    const db = await getMongoDb();
    const posts = await db.collection('blog_posts').find({ published: true }).sort({ createdAt: -1 }).toArray();

    if (posts.length > 0) {
      return posts.map(mapDbPost);
    }
  } catch {
    // Fallback to local blog content below.
  }

  return readPublishedBlogPosts();
});

export const getPublishedBlogPostById = createServerFn({ method: 'GET' })
  .inputValidator((data: unknown) => blogPostParamsSchema.parse(data))
  .handler(async ({ data }) => {
    try {
      const db = await getMongoDb();
      const posts = await db.collection('blog_posts').find({ published: true }).toArray();
      const post = posts.find((item) => item.slug === data.postId || item._id.toString() === data.postId);

      if (post) {
        return mapDbPost(post);
      }
    } catch {
      // Fallback below.
    }

    return readPublishedBlogPostById(data.postId);
  });