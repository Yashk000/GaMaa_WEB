import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { readSiteContent, saveSiteContent } from '@/server/site-store';

const updateSchema = z.object({
  token: z.string().min(1),
  content: z.any(),
});

export const getSiteContent = createServerFn({ method: 'GET' }).handler(async () => {
  const content = await readSiteContent();
  return content;
});

export const updateSiteContent = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) => updateSchema.parse(data))
  .handler(async ({ data }) => {
    void data;
    const ok = await saveSiteContent(data.content);
    return { success: !!ok };
  });
