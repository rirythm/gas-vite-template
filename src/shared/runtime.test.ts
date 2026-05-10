import { describe, expect, it } from 'vitest';
import { formatRuntimeMessage, type RuntimeInfo } from './runtime';

describe('formatRuntimeMessage', () => {
  it('includes app and timezone', () => {
    const info: RuntimeInfo = {
      appName: 'GAS Vite Template',
      generatedAt: '2026-05-07T00:00:00.000Z',
      locale: 'ja',
      timeZone: 'Asia/Tokyo',
    };

    expect(formatRuntimeMessage(info)).toBe('GAS Vite Template is running in Asia/Tokyo.');
  });
});
