import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Calendar, Clock, ArrowLeft } from "lucide-react";
import { getPublishedBlogPostById } from "@/lib/blog-server-fn";

export const Route = createFileRoute("/blog/$postId")({
  component: BlogPostPage,
});

function BlogPostPage() {
  const { postId } = Route.useParams();
  const [post, setPost] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const loadPost = useServerFn(getPublishedBlogPostById);

  useEffect(() => {
    let mounted = true;

    const fetchPost = async () => {
      try {
        const result = await loadPost({ data: { postId } });
        if (mounted) {
          setPost(result);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchPost();

    return () => {
      mounted = false;
    };
  }, [loadPost, postId]);

  if (loading) {
    return (
      <div className="min-h-screen pt-24 bg-background">
        <div className="section-padding">
          <div className="mx-auto max-w-3xl text-center text-muted-foreground">Loading post...</div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen pt-24 bg-background">
        <div className="section-padding">
          <div className="mx-auto max-w-3xl rounded-2xl border border-border/50 bg-card p-8 text-center">
            <h1 className="text-2xl font-bold text-foreground">Post not found</h1>
            <p className="mt-3 text-muted-foreground">
              The blog content you are looking for is not available.
            </p>
            <Link
              to="/blog"
              className="mt-6 inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              <ArrowLeft size={14} /> Back to Blog
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 bg-background">
      <div className="section-padding">
        <article className="mx-auto max-w-3xl">
          <Link
            to="/blog"
            className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-primary transition-colors hover:text-primary/80"
          >
            <ArrowLeft size={14} /> Back to Blog
          </Link>

          <header className="rounded-2xl border border-border/50 bg-gradient-card p-8">
            <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              {post.category}
            </span>
            <h1 className="mt-4 text-3xl font-bold leading-tight text-foreground md:text-4xl">
              {post.title}
            </h1>
            <p className="mt-4 text-base text-muted-foreground">{post.excerpt}</p>

            <div className="mt-5 flex flex-wrap items-center gap-5 border-t border-border/50 pt-4 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-2">
                <Calendar size={14} /> {post.date}
              </span>
              <span className="inline-flex items-center gap-2">
                <Clock size={14} /> {post.readTime}
              </span>
            </div>
          </header>

          <div className="mt-8 space-y-5 rounded-2xl border border-border/50 bg-card p-8 text-base leading-8 text-foreground">
            {post.content.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </article>
      </div>
    </div>
  );
}