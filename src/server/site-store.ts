import fs from 'fs/promises';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), '.data', 'site.json');

async function ensureDataDir() {
  const dir = path.dirname(DATA_FILE);
  try {
    await fs.mkdir(dir, { recursive: true });
  } catch {}
}

const defaultSite = {
  hero: {
    title: 'Smarter Cloud',
    highlight: 'Operations at Scale',
    description:
      "Simplify infrastructure, hosting, and workflows with secure, connected, and cloud-native systems built for growth.",
    ctaText: 'Free Consultation',
    ctaLink: '#contact',
    image: null,
  },
  trustedPartners: [
    { name: 'ATJVP Foundation', url: '' },
    { name: 'SRG Enterprises', url: '' },
    { name: 'Everantra', url: '' },
  ],
};

export async function readSiteContent() {
  try {
    const raw = await fs.readFile(DATA_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return defaultSite;
  }
}

export async function saveSiteContent(content: any) {
  try {
    await ensureDataDir();
    await fs.writeFile(DATA_FILE, JSON.stringify(content, null, 2), 'utf-8');
    return true;
  } catch (err) {
    return false;
  }
}

export async function readAdminSiteContent() {
  return readSiteContent();
}
