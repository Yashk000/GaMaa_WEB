import { useEffect, useState } from 'react';
import { useServerFn } from '@tanstack/react-start';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';
import { getSiteContent, updateSiteContent } from '@/lib/site-server-fn';

export default function AdminSiteManager() {
  const load = useServerFn(getSiteContent);
  const save = useServerFn(updateSiteContent);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [content, setContent] = useState<any>(null);

  useEffect(() => {
    let mounted = true;
    load()
      .then((c) => {
        if (!mounted) return;
        // ensure we always have an object shape
        setContent(c || { hero: {}, trustedPartners: [] });
      })
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, [load]);

  if (loading) return <div>Loading site content...</div>;

  function updateHero(key: string, value: any) {
    setContent((cur: any) => ({ ...cur, hero: { ...(cur?.hero || {}), [key]: value } }));
  }

  function updatePartner(index: number, key: string, value: any) {
    const partners = (content.trustedPartners || []).slice();
    partners[index] = { ...(partners[index] || {}), [key]: value };
    setContent((cur: any) => ({ ...cur, trustedPartners: partners }));
  }

  function addPartner() {
    setContent((cur: any) => ({ ...cur, trustedPartners: [...(cur.trustedPartners || []), { name: '', url: '' }] }));
  }

  async function handleSave() {
    const token = localStorage.getItem('adminToken');
    if (!token) return alert('Not authenticated');
    setSaving(true);
    try {
      const result = await save({ data: { token, content } });
      if (!result.success) alert('Save failed');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-white">Site Content</h2>
        <p className="text-slate-300">Edit hero, CTAs and trusted partners</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Hero</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Input value={content.hero?.title || ''} onChange={(e) => updateHero('title', e.target.value)} placeholder="Title" />
            <Input value={content.hero?.highlight || ''} onChange={(e) => updateHero('highlight', e.target.value)} placeholder="Highlight" />
            <Textarea value={content.hero?.description || ''} onChange={(e) => updateHero('description', e.target.value)} placeholder="Description" rows={3} />
            <Input value={content.hero?.ctaText || ''} onChange={(e) => updateHero('ctaText', e.target.value)} placeholder="CTA Text" />
            <Input value={content.hero?.ctaLink || ''} onChange={(e) => updateHero('ctaLink', e.target.value)} placeholder="CTA Link (e.g. #contact or /contact)" />
            <Input value={content.hero?.image || ''} onChange={(e) => updateHero('image', e.target.value)} placeholder="Hero image URL" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Trusted Partners</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {(content?.trustedPartners || []).map((p: any, i: number) => (
              <div key={i} className="grid grid-cols-3 gap-3">
                <Input value={p.name} onChange={(e) => updatePartner(i, 'name', e.target.value)} placeholder="Name" />
                <Input value={p.url} onChange={(e) => updatePartner(i, 'url', e.target.value)} placeholder="URL (https://...)" />
                <Button variant="destructive" onClick={() => { const partners = (content.trustedPartners||[]).slice(); partners.splice(i,1); setContent((cur:any)=>({...cur, trustedPartners: partners})); }}>Delete</Button>
              </div>
            ))}

            <div>
              <Button onClick={addPartner}>Add Partner</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div>
        <Button onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</Button>
      </div>
    </div>
  );
}
