import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { blogPosts as fallbackBlogPosts, type BlogPost as PublicBlogPost } from "@/lib/blog-posts";

export type StoredBlogPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  author: string;
  published: boolean;
  category: string;
  gradient: string;
  createdAt: string;
  updatedAt: string;
};

const storeFilePath = () => path.join(process.cwd(), ".data", "blog-posts.json");

async function ensureStoreDirectory() {
  await mkdir(path.dirname(storeFilePath()), { recursive: true });
}

function seedBlogPosts(): StoredBlogPost[] {
  return fallbackBlogPosts.map((post) => ({
    id: post.id,
    title: post.title,
    slug: post.id,
    excerpt: post.excerpt,
    content: post.content.join("\n\n"),
    author: "GaMaa Team",
    published: true,
    category: post.category,
    gradient: post.gradient,
    createdAt: new Date(post.date).toISOString(),
    updatedAt: new Date(post.date).toISOString(),
  }));
}

async function readStoredBlogPosts() {
  try {
    const raw = await readFile(storeFilePath(), "utf8");
    const parsed = JSON.parse(raw) as StoredBlogPost[];
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      const seeded = seedBlogPosts();
      await ensureStoreDirectory();
      await writeFile(storeFilePath(), JSON.stringify(seeded, null, 2), "utf8");
      return seeded;
    }

    throw error;
  }
}

async function writeStoredBlogPosts(posts: StoredBlogPost[]) {
  await ensureStoreDirectory();
  await writeFile(storeFilePath(), JSON.stringify(posts, null, 2), "utf8");
}

function toPublicBlogPost(post: StoredBlogPost): PublicBlogPost {
  return {
    id: post.slug || post.id,
    title: post.title,
    excerpt: post.excerpt,
    date: new Date(post.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
    readTime: `${Math.max(1, Math.round(post.content.split(/\s+/).filter(Boolean).length / 180))} min read`,
    category: post.category,
    gradient: post.gradient,
    content: post.content.split(/\n\n+/).filter(Boolean),
  };
}

export async function readPublishedBlogPosts() {
  const posts = await readStoredBlogPosts();
  return posts.filter((post) => post.published).map(toPublicBlogPost);
}

export async function readPublishedBlogPostById(postId: string) {
  const posts = await readStoredBlogPosts();
  const post = posts.find((item) => item.slug === postId || item.id === postId);
  return post && post.published ? toPublicBlogPost(post) : null;
}

export async function readAdminBlogPosts() {
  return readStoredBlogPosts();
}

export async function saveBlogPost(input: Omit<StoredBlogPost, "id" | "createdAt" | "updatedAt">) {
  const posts = await readStoredBlogPosts();
  const now = new Date().toISOString();
  const post: StoredBlogPost = {
    id: crypto.randomUUID(),
    ...input,
    createdAt: now,
    updatedAt: now,
  };

  await writeStoredBlogPosts([post, ...posts]);
  return post;
}

export async function updateStoredBlogPost(postId: string, updates: Partial<StoredBlogPost>) {
  const posts = await readStoredBlogPosts();
  const next = posts.map((post) =>
    post.id === postId || post.slug === postId
      ? { ...post, ...updates, updatedAt: new Date().toISOString() }
      : post
  );
  await writeStoredBlogPosts(next);
  return next.find((post) => post.id === postId || post.slug === postId) ?? null;
}

export async function deleteStoredBlogPost(postId: string) {
  const posts = await readStoredBlogPosts();
  const next = posts.filter((post) => post.id !== postId && post.slug !== postId);
  await writeStoredBlogPosts(next);
  return next.length !== posts.length;
}