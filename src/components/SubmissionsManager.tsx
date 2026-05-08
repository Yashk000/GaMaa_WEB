import { useState, useEffect } from 'react';
import { useServerFn } from '@tanstack/react-start';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { ChevronLeft, ChevronRight, Mail, Phone } from 'lucide-react';
import { getContactSubmissions, getConsultationSubmissions } from '@/lib/admin-data-fn';

export function SubmissionsManager() {
  const [contactSubmissions, setContactSubmissions] = useState<any[]>([]);
  const [consultationSubmissions, setConsultationSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [contactPage, setContactPage] = useState(1);
  const [consultationPage, setConsultationPage] = useState(1);
  const [contactPages, setContactPages] = useState(1);
  const [consultationPages, setConsultationPages] = useState(1);
  const loadContactSubmissions = useServerFn(getContactSubmissions);
  const loadConsultationSubmissions = useServerFn(getConsultationSubmissions);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      setLoading(false);
      return;
    }

    let mounted = true;

    const fetchData = async () => {
      try {
        const [contactResult, consultationResult] = await Promise.all([
          loadContactSubmissions({ data: { token, page: contactPage, limit: 5 } }),
          loadConsultationSubmissions({ data: { token, page: consultationPage, limit: 5 } }),
        ]);

        if (!mounted) return;

        setContactSubmissions(contactResult.submissions);
        setConsultationSubmissions(consultationResult.submissions);
        setContactPages(contactResult.pages || 1);
        setConsultationPages(consultationResult.pages || 1);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      mounted = false;
    };
  }, [contactPage, consultationPage, loadContactSubmissions, loadConsultationSubmissions]);

  if (loading) {
    return <div>Loading submissions...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-slate-900">Submissions</h2>
        <p className="text-slate-600">Manage contact and consultation form submissions</p>
      </div>

      <Tabs defaultValue="contact" className="w-full">
        <TabsList>
          <TabsTrigger value="contact">Contact Forms</TabsTrigger>
          <TabsTrigger value="consultation">Consultations</TabsTrigger>
        </TabsList>

        <TabsContent value="contact" className="space-y-4">
          <div className="space-y-4">
            {contactSubmissions.map((submission) => (
              <SubmissionCard
                key={submission._id}
                title={`Contact from ${submission.name}`}
                email={submission.email}
                subject={submission.subject}
                message={submission.message}
                date={submission.createdAt}
              />
            ))}
          </div>

          {/* Pagination */}
          <div className="flex justify-between items-center mt-6">
            <Button
              variant="outline"
              size="sm"
              disabled={contactPage === 1}
              onClick={() => setContactPage(contactPage - 1)}
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>
            <span className="text-sm text-slate-600">Page {contactPage}</span>
            <Button
              variant="outline"
              size="sm"
              disabled={contactPage >= contactPages}
              onClick={() => setContactPage(contactPage + 1)}
            >
              Next
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="consultation" className="space-y-4">
          <div className="space-y-4">
            {consultationSubmissions.map((submission) => (
              <Card key={submission._id}>
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-slate-900">{submission.name}</h3>
                        <p className="text-sm text-slate-600">{submission.email}</p>
                      </div>
                              <Badge>{submission.countryCode}</Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-slate-600">Phone</p>
                        <p className="font-medium flex items-center gap-2">
                          <Phone className="w-4 h-4" />
                                  {submission.countryCode} {submission.phone}
                        </p>
                      </div>
                      <div>
                                <p className="text-slate-600">Meeting Date</p>
                        <p className="font-medium">{new Date(submission.meetingDate).toLocaleDateString()}</p>
                      </div>
                      <div className="col-span-2">
                                <p className="text-slate-600">Enquiry</p>
                                <p className="font-medium">{submission.enquiry}</p>
                      </div>
                    </div>

                    <p className="text-xs text-slate-500">
                      {new Date(submission.createdAt).toLocaleString()}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex justify-between items-center mt-6">
            <Button
              variant="outline"
              size="sm"
              disabled={consultationPage === 1}
              onClick={() => setConsultationPage(consultationPage - 1)}
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>
            <span className="text-sm text-slate-600">Page {consultationPage}</span>
            <Button
              variant="outline"
              size="sm"
              disabled={consultationPage >= consultationPages}
              onClick={() => setConsultationPage(consultationPage + 1)}
            >
              Next
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function SubmissionCard({
  title,
  email,
  subject,
  message,
  date,
}: {
  title: string;
  email: string;
  subject: string;
  message: string;
  date: Date;
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-3">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-semibold text-slate-900">{title}</h3>
              <p className="text-sm text-slate-600">{email}</p>
            </div>
            <Badge variant="secondary">{subject}</Badge>
          </div>

          <div className="bg-slate-50 p-3 rounded-lg">
            <p className="text-sm text-slate-700">{message}</p>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-xs text-slate-500">
              {new Date(date).toLocaleString()}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
