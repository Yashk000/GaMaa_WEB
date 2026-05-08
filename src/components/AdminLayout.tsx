import { useState, useEffect } from 'react';
import { useNavigate, Outlet } from '@tanstack/react-router';
import { useServerFn } from '@tanstack/react-start';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { BarChart3, FileText, MessageSquare, Star, Users, LogOut } from 'lucide-react';
import { verifyAdminToken } from '@/lib/admin-server-fn';

interface AdminUser {
  email: string;
  name: string;
  role: string;
}

export function AdminLayout() {
  const navigate = useNavigate();
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const verifyToken = useServerFn(verifyAdminToken);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('adminToken');
    if (!token) {
      setLoading(false);
      navigate({ to: '/admin/login' });
    } else {
      const run = async () => {
        try {
          const result = await verifyToken({ data: { token } });
          if (!result.valid || !result.admin) {
            localStorage.removeItem('adminToken');
            navigate({ to: '/admin/login' });
            return;
          }

          setAdmin(result.admin);
        } catch {
          localStorage.removeItem('adminToken');
          navigate({ to: '/admin/login' });
        } finally {
          setLoading(false);
        }
      };

      run();
    }
  }, [navigate, verifyToken]);

  function handleLogout() {
    localStorage.removeItem('adminToken');
    navigate({ to: '/admin/login' });
  }

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <div className="admin-surface min-h-screen bg-slate-950 text-slate-100">
      {/* Header */}
      <header className="bg-slate-900/90 border-b border-slate-800 sticky top-0 z-50 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-white">GaMaa Admin</h1>
            <p className="text-sm text-slate-300">{admin?.name}</p>
          </div>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Navigation Tabs */}
        <div className="mb-8 flex gap-2 overflow-x-auto pb-4">
          <NavLink to="/admin/dashboard" icon={<BarChart3 className="w-4 h-4" />}>
            Dashboard
          </NavLink>
          <NavLink to="/admin/submissions" icon={<MessageSquare className="w-4 h-4" />}>
            Submissions
          </NavLink>
          <NavLink to="/admin/testimonials" icon={<Star className="w-4 h-4" />}>
            Testimonials
          </NavLink>
          <NavLink to="/admin/blog" icon={<FileText className="w-4 h-4" />}>
            Blog Posts
          </NavLink>
          <NavLink to="/admin/site" icon={<Users className="w-4 h-4" />}>
            Site Content
          </NavLink>
        </div>

        {/* Main Content */}
        <Outlet />
      </div>
    </div>
  );
}

function NavLink({
  to,
  icon,
  children,
}: {
  to: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <a
      href={to}
      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-100 font-medium transition-colors whitespace-nowrap"
    >
      {icon}
      {children}
    </a>
  );
}
