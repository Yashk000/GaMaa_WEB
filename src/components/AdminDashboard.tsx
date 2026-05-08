import { useEffect, useState } from 'react';
import { useServerFn } from '@tanstack/react-start';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { MessageSquare, Star, FileText, Users } from 'lucide-react';
import { getAdminStats } from '@/lib/admin-data-fn';

interface Stats {
  contactSubmissions: number;
  consultationSubmissions: number;
  testimonials: number;
  blogPosts: number;
}

export function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const loadStats = useServerFn(getAdminStats);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      setLoading(false);
      return;
    }

    let mounted = true;

    const fetchStats = async () => {
      try {
        const result = await loadStats({ data: { token } });
        if (mounted) {
          setStats(result);
        }
      } catch {
        if (mounted) {
          setStats({
            contactSubmissions: 0,
            consultationSubmissions: 0,
            testimonials: 0,
            blogPosts: 0,
          });
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchStats();

    return () => {
      mounted = false;
    };
  }, [loadStats]);

  if (loading) {
    return <div>Loading dashboard...</div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-slate-900">Dashboard</h2>
        <p className="text-slate-600">Overview of your website activity</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Contact Submissions"
          value={stats?.contactSubmissions || 0}
          icon={<MessageSquare className="w-6 h-6" />}
          color="blue"
        />
        <StatCard
          title="Consultation Requests"
          value={stats?.consultationSubmissions || 0}
          icon={<Users className="w-6 h-6" />}
          color="green"
        />
        <StatCard
          title="Testimonials"
          value={stats?.testimonials || 0}
          icon={<Star className="w-6 h-6" />}
          color="yellow"
        />
        <StatCard
          title="Blog Posts"
          value={stats?.blogPosts || 0}
          icon={<FileText className="w-6 h-6" />}
          color="purple"
        />
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <ActivityItem
              title="New contact submission"
              description="from john@example.com"
              time="2 hours ago"
            />
            <ActivityItem
              title="Testimonial pending approval"
              description="from Sarah Johnson"
              time="4 hours ago"
            />
            <ActivityItem
              title="Blog post published"
              description="Web Development Best Practices"
              time="1 day ago"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
  color,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: 'blue' | 'green' | 'yellow' | 'purple';
}) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    purple: 'bg-purple-50 text-purple-600',
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-600 mb-1">{title}</p>
            <p className="text-3xl font-bold text-slate-900">{value}</p>
          </div>
          <div className={`p-3 rounded-lg ${colorClasses[color]}`}>{icon}</div>
        </div>
      </CardContent>
    </Card>
  );
}

function ActivityItem({
  title,
  description,
  time,
}: {
  title: string;
  description: string;
  time: string;
}) {
  return (
    <div className="flex items-start justify-between py-3 border-b border-slate-200 last:border-0">
      <div>
        <p className="font-medium text-slate-900">{title}</p>
        <p className="text-sm text-slate-600">{description}</p>
      </div>
      <span className="text-xs text-slate-500 whitespace-nowrap ml-4">{time}</span>
    </div>
  );
}
