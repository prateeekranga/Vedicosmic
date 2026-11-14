import { afterEach, describe, expect, it, vi } from 'vitest';

// The analytics module reads the website ID once at import, so each test imports a fresh copy.
async function loadWith(websiteId: string) {
  vi.resetModules();
  vi.stubEnv('VITE_UMAMI_WEBSITE_ID', websiteId);
  const track = vi.fn();
  vi.stubGlobal('window', { umami: { track } });
  const { trackEvent } = await import('@/lib/analytics');
  return { trackEvent, track };
}

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe('trackEvent', () => {
  it('sends only allow-listed, non-empty properties', async () => {
    const { trackEvent, track } = await loadWith('test-site');
    // Anything that could identify a visitor or their birth details must be dropped.
    const props = { tool: 'astrology', name: 'Asha', dob: '1988-03-20', time: '02:00', place: 'Kolkata', preset: null };
    trackEvent('chart_created', props as Parameters<typeof trackEvent>[1]);
    expect(track).toHaveBeenCalledWith('chart_created', { tool: 'astrology' });
  });

  it('sends the generic tool events with the tool slug only', async () => {
    const { trackEvent, track } = await loadWith('test-site');
    trackEvent('tool_used', { tool: 'loshu-grid', dob: '1990-08-15' } as Parameters<typeof trackEvent>[1]);
    trackEvent('result_viewed', { tool: 'loshu-grid' });
    expect(track).toHaveBeenNthCalledWith(1, 'tool_used', { tool: 'loshu-grid' });
    expect(track).toHaveBeenNthCalledWith(2, 'result_viewed', { tool: 'loshu-grid' });
  });

  it('sends nothing while no website ID is set', async () => {
    const { trackEvent, track } = await loadWith('');
    trackEvent('share_clicked', { channel: 'whatsapp' });
    expect(track).not.toHaveBeenCalled();
  });
});
