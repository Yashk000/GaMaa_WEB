import { useEffect, useState } from 'react';
import { useServerFn } from '@tanstack/react-start';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Star, Trash2, Check } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { approveTestimonial, getTestimonials, rejectTestimonial } from '@/lib/admin-data-fn';

interface TestimonialRecord {
  _id: string;
  name: string;
  email?: string;
  role: string;
  content: string;
  rating: number;
  image?: string;
  status: 'published' | 'pending';
  createdAt: string;
  verifiedAt?: string;
}

export function TestimonialsManager() {
  const [publishedTestimonials, setPublishedTestimonials] = useState<TestimonialRecord[]>([]);
  const [pendingTestimonials, setPendingTestimonials] = useState<TestimonialRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const loadTestimonials = useServerFn(getTestimonials);
  const approve = useServerFn(approveTestimonial);
  const reject = useServerFn(rejectTestimonial);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      setLoading(false);
      return;
    }

    let mounted = true;

    const fetchTestimonials = async () => {
      try {
        const result = await loadTestimonials({ data: { token } });
        if (!mounted) return;

        setPublishedTestimonials((result.published ?? []) as TestimonialRecord[]);
        setPendingTestimonials((result.pending ?? []) as TestimonialRecord[]);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchTestimonials();

    return () => {
      mounted = false;
    };
  }, [loadTestimonials]);

  const refreshTestimonials = async () => {
    const token = localStorage.getItem('adminToken');
    if (!token) return;

    const result = await loadTestimonials({ data: { token } });
    setPublishedTestimonials((result.published ?? []) as TestimonialRecord[]);
    setPendingTestimonials((result.pending ?? []) as TestimonialRecord[]);
  };

  const handleApprove = async (id: string) => {
    const token = localStorage.getItem('adminToken');
    if (!token) return;

    await approve({ data: { token, submissionId: id } });
    await refreshTestimonials();
  };

  const handleDelete = async (id: string) => {
    const token = localStorage.getItem('adminToken');
    if (!token) return;

    await reject({ data: { token, submissionId: id } });
    await refreshTestimonials();
  };

  if (loading) {
    return <div>Loading testimonials...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-slate-900">Testimonials</h2>
        <p className="text-slate-600">Manage and approve customer testimonials</p>
      </div>

      <Tabs defaultValue="published" className="w-full">
        <TabsList>
          <TabsTrigger value="published">Published ({publishedTestimonials.length})</TabsTrigger>
          <TabsTrigger value="pending">Pending ({pendingTestimonials.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="published" className="space-y-4 mt-4">
          {publishedTestimonials.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-slate-600 text-center py-8">No published testimonials yet</p>
              </CardContent>
            </Card>
          ) : (
            publishedTestimonials.map((testimonial) => (
              <TestimonialCard
                key={testimonial._id}
                testimonial={testimonial}
                onDelete={handleDelete}
                showApproveBtn={false}
              />
            ))
          )}
        </TabsContent>

        <TabsContent value="pending" className="space-y-4 mt-4">
          {pendingTestimonials.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-slate-600 text-center py-8">
                  No pending testimonials to approve
                </p>
              </CardContent>
            </Card>
          ) : (
            pendingTestimonials.map((testimonial) => (
              <TestimonialCard
                key={testimonial._id}
                testimonial={testimonial}
                onDelete={handleDelete}
                onApprove={handleApprove}
                showApproveBtn={true}
              />
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function TestimonialCard({
  testimonial,
  onDelete,
  onApprove,
  showApproveBtn,
}: {
  testimonial: TestimonialRecord;
  onDelete: (id: string) => void;
  onApprove?: (id: string) => void;
  showApproveBtn?: boolean;
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-semibold text-slate-900">{testimonial.name}</h3>
              <p className="text-sm text-slate-600">{testimonial.role}</p>
              {testimonial.email && <p className="text-xs text-slate-500">{testimonial.email}</p>}
            </div>
            <div className="flex items-center gap-2">
              {Array.from({ length: testimonial.rating }).map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              ))}
            </div>
          </div>

          <p className="text-slate-700 italic">"{testimonial.content}"</p>

          <div className="flex justify-between items-center pt-2 border-t border-slate-200">
            <span className="text-xs text-slate-500">
              {new Date(testimonial.createdAt).toLocaleDateString()}
            </span>

            <div className="flex gap-2">
              {showApproveBtn && onApprove && (
                <Button size="sm" variant="default" onClick={() => onApprove(testimonial._id)}>
                  <Check className="w-4 h-4 mr-2" />
                  Approve
                </Button>
              )}
              <Button size="sm" variant="destructive" onClick={() => onDelete(testimonial._id)}>
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
