import { createRoot } from 'react-dom/client';
import { toBlob } from 'html-to-image';
import { supabase } from '@/lib/supabaseClient';
import { OgCardVisual } from '@/components/blog/OgCardVisual';
import type { BlogCategoryId } from '@/types/blog.types';
import { createElement } from 'react';

/** Renders OgCardVisual off-screen, rasterizes it with html-to-image, and uploads the PNG to the
 *  `blog-images` storage bucket — replaces the old server-side @resvg/resvg-js render. Runs entirely
 *  in the admin's browser at save time, so no server-side rendering step is needed. */
export async function generateHeroImage(input: { slug: string; title: string; category: BlogCategoryId }): Promise<string> {
  const host = document.createElement('div');
  host.style.position = 'fixed';
  host.style.left = '-9999px';
  host.style.top = '0';
  host.style.width = '1200px';
  host.style.height = '630px';
  document.body.appendChild(host);

  const root = createRoot(host);
  try {
    await new Promise<void>((resolve) => {
      root.render(createElement(OgCardVisual, { title: input.title, category: input.category }));
      // Two rAFs: one for React to commit, one for the browser to paint before we rasterize.
      requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
    });
    if (document.fonts?.ready) await document.fonts.ready;

    const node = host.firstElementChild as HTMLElement;
    const blob = await toBlob(node, { width: 1200, height: 630, pixelRatio: 1 });
    if (!blob) throw new Error('Failed to rasterize hero image');

    const path = `${input.slug}-${Date.now()}.png`;
    const { error: uploadError } = await supabase.storage
      .from('blog-images')
      .upload(path, blob, { contentType: 'image/png', cacheControl: '31536000' });
    if (uploadError) throw new Error(`Hero image upload failed: ${uploadError.message}`);

    const { data } = supabase.storage.from('blog-images').getPublicUrl(path);
    return data.publicUrl;
  } finally {
    root.unmount();
    host.remove();
  }
}
