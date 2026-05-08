import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { motion } from "framer-motion";
import { Calendar, ArrowRight, Clock, Tag } from "lucide-react";
import { getPublishedBlogPosts } from "@/lib/blog-server-fn";

export const Route = createFileRoute("/blog/")({
  head: () => ({
    meta: [
      { title: "Blog - GaMaa Tech" },
      {
        name: "description",
        content:
          "Insights on AI, automation, web development, and IT solutions from the GaMaa Tech team.",
      },
      { property: "og:title", content: "Blog - GaMaa Tech" },
      {
        property: "og:description",
        content: "Insights on AI, automation, web development, and IT solutions.",
      },
    ],
  }),
  component: BlogPage,
});

function BlogPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const loadPosts = useServerFn(getPublishedBlogPosts);

  useEffect(() => {
    let mounted = true;

    const fetchPosts = async () => {
      try {
        const result = await loadPosts();
        if (mounted) {
          setPosts(result);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchPosts();

    return () => {
      mounted = false;
    };
  }, [loadPosts]);

  if (loading) {
    return (
      <div className="min-h-screen pt-24 bg-background">
        <div className="section-padding">
          <div className="mx-auto max-w-7xl text-center text-muted-foreground">Loading blog posts...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 bg-background">
      <div className="section-padding">
        <div className="mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <span className="text-sm font-semibold uppercase tracking-widest text-primary">Our Blog</span>
            <h1 className="mt-3 text-4xl font-bold text-foreground md:text-6xl">
              Latest <span className="text-gradient">Insights</span>
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
              Stay ahead with expert perspectives on technology, innovation, and digital transformation.
            </p>
          </motion.div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post, i) => (
              <motion.article
                key={post.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                whileHover={{ y: -8, scale: 1.02 }}
                className="group flex flex-col overflow-hidden rounded-2xl bg-gradient-card glow-border transition-all duration-300 hover:border-primary/50"
              >
                <div className={`h-48 bg-gradient-to-br ${post.gradient} flex items-center justify-center`}>
                  <Tag className="text-primary/60" size={48} />
                </div>

                <div className="flex flex-1 flex-col p-6">
                  <div className="mb-3 flex items-center gap-3">
                    <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                      {post.category}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock size={12} /> {post.readTime}
                    </span>
                  </div>

                  <h2 className="text-lg font-bold text-foreground leading-snug group-hover:text-primary transition-colors">
                    {post.title}
                  </h2>
                  <p className="mt-3 flex-1 text-sm text-muted-foreground leading-relaxed">
                    {post.excerpt}
                  </p>

                  <div className="mt-5 flex items-center justify-between border-t border-border/50 pt-4">
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Calendar size={12} /> {post.date}
                    </span>
                    <Link
                      to="/blog/$postId"
                      params={{ postId: post.id }}
                      className="flex items-center gap-1 text-sm font-semibold text-primary opacity-0 transition-opacity group-hover:opacity-100"
                    >
                      Read More <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
