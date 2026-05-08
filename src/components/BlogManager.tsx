import { useEffect, useState } from 'react';
import { useServerFn } from '@tanstack/react-start';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Edit2, Trash2, Plus, Eye } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import { createBlogPost, deleteBlogPost, getBlogPosts, updateBlogPost } from '@/lib/admin-data-fn';

interface BlogPost {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  author: string;
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export function BlogManager() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    author: 'GaMaa Team',
  });
  const loadBlogPosts = useServerFn(getBlogPosts);
  const createPost = useServerFn(createBlogPost);
  const updatePost = useServerFn(updateBlogPost);
  const removePost = useServerFn(deleteBlogPost);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      setLoading(false);
      return;
    }

    let mounted = true;

    const fetchPosts = async () => {
      try {
        const result = await loadBlogPosts({ data: { token } });
        if (!mounted) return;
        setPosts((result.posts || []).map((post: any) => ({
          _id: post._id,
          title: post.title,
          slug: post.slug,
          excerpt: post.excerpt,
          content: post.content,
          author: post.author,
          published: !!post.published,
          createdAt: new Date(post.createdAt),
          updatedAt: new Date(post.updatedAt),
        })));
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
  }, [loadBlogPosts]);

  function handleCreate() {
    setEditingPost(null);
    setFormData({
      title: '',
      slug: '',
      excerpt: '',
      content: '',
      author: 'GaMaa Team',
    });
    setIsDialogOpen(true);
  }

  function handleEdit(post: BlogPost) {
    setEditingPost(post);
    setFormData({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      content: post.content,
      author: post.author,
    });
    setIsDialogOpen(true);
  }

  function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this post?')) return;

    const token = localStorage.getItem('adminToken');
    if (!token) return;

    removePost({ data: { token, postId: id } }).then(() => {
      setPosts((current) => current.filter((p) => p._id !== id));
    });
  }

  function handleSave() {
    const token = localStorage.getItem('adminToken');
    if (!token) return;

    const action = editingPost
      ? updatePost({
          data: {
            token,
            postId: editingPost._id,
            title: formData.title,
            slug: formData.slug,
            excerpt: formData.excerpt,
            content: formData.content,
            author: formData.author,
          },
        })
      : createPost({
          data: {
            token,
            title: formData.title,
            slug: formData.slug,
            excerpt: formData.excerpt,
            content: formData.content,
            author: formData.author,
          },
        });

    action.then(() => {
      setIsDialogOpen(false);
      return loadBlogPosts({ data: { token } }).then((result) => {
        setPosts((result.posts || []).map((post: any) => ({
          _id: post._id,
          title: post.title,
          slug: post.slug,
          excerpt: post.excerpt,
          content: post.content,
          author: post.author,
          published: !!post.published,
          createdAt: new Date(post.createdAt),
          updatedAt: new Date(post.updatedAt),
        })));
      });
    });
  }

  function handlePublish(id: string) {
    const token = localStorage.getItem('adminToken');
    if (!token) return;

    const post = posts.find((item) => item._id === id);
    if (!post) return;

    updatePost({
      data: {
        token,
        postId: id,
        published: !post.published,
      },
    }).then(() => {
      setPosts((current) =>
        current.map((item) =>
          item._id === id
            ? { ...item, published: !item.published, updatedAt: new Date() }
            : item
        )
      );
    });
  }

  if (loading) {
    return <div>Loading blog posts...</div>;
  }

  const published = posts.filter((p) => p.published);
  const draft = posts.filter((p) => !p.published);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Blog Posts</h2>
          <p className="text-slate-600">Create and manage your blog content</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleCreate}>
              <Plus className="w-4 h-4 mr-2" />
              New Post
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingPost ? 'Edit Post' : 'Create New Post'}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="Post title"
                />
              </div>

              <div>
                <Label htmlFor="slug">Slug</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) =>
                    setFormData({ ...formData, slug: e.target.value })
                  }
                  placeholder="post-slug"
                />
              </div>

              <div>
                <Label htmlFor="excerpt">Excerpt</Label>
                <Textarea
                  id="excerpt"
                  value={formData.excerpt}
                  onChange={(e) =>
                    setFormData({ ...formData, excerpt: e.target.value })
                  }
                  placeholder="Brief summary of the post"
                  rows={2}
                />
              </div>

              <div>
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) =>
                    setFormData({ ...formData, content: e.target.value })
                  }
                  placeholder="Full post content (supports Markdown)"
                  rows={8}
                />
              </div>

              <div>
                <Label htmlFor="author">Author</Label>
                <Input
                  id="author"
                  value={formData.author}
                  onChange={(e) =>
                    setFormData({ ...formData, author: e.target.value })
                  }
                  placeholder="Author name"
                />
              </div>

              <Button onClick={handleSave} className="w-full">
                {editingPost ? 'Update Post' : 'Create Post'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="published" className="w-full">
        <TabsList>
          <TabsTrigger value="published">Published ({published.length})</TabsTrigger>
          <TabsTrigger value="drafts">Drafts ({draft.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="published" className="space-y-4 mt-4">
          {published.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-slate-600 text-center py-8">No published posts yet</p>
              </CardContent>
            </Card>
          ) : (
            published.map((post) => (
              <BlogPostCard
                key={post._id}
                post={post}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onPublish={handlePublish}
              />
            ))
          )}
        </TabsContent>

        <TabsContent value="drafts" className="space-y-4 mt-4">
          {draft.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-slate-600 text-center py-8">No draft posts yet</p>
              </CardContent>
            </Card>
          ) : (
            draft.map((post) => (
              <BlogPostCard
                key={post._id}
                post={post}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onPublish={handlePublish}
              />
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function BlogPostCard({
  post,
  onEdit,
  onDelete,
  onPublish,
}: {
  post: BlogPost;
  onEdit: (post: BlogPost) => void;
  onDelete: (id: string) => void;
  onPublish: (id: string) => void;
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-3">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h3 className="font-semibold text-slate-900 text-lg">{post.title}</h3>
              <p className="text-sm text-slate-600 mt-1">{post.excerpt}</p>
            </div>
            {post.published && <Badge variant="default">Published</Badge>}
            {!post.published && <Badge variant="secondary">Draft</Badge>}
          </div>

          <div className="flex items-center justify-between text-sm text-slate-600 pt-2 border-t border-slate-200">
            <div className="space-y-1">
              <p>By {post.author}</p>
              <p>{new Date(post.createdAt).toLocaleDateString()}</p>
            </div>

            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => onPublish(post._id)}
              >
                <Eye className="w-4 h-4 mr-2" />
                {post.published ? 'Unpublish' : 'Publish'}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onEdit(post)}
              >
                <Edit2 className="w-4 h-4 mr-2" />
                Edit
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => onDelete(post._id)}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
