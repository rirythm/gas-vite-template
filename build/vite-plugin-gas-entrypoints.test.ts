import { describe, expect, it } from 'vitest';
import type { Plugin } from 'vite';
import { gasEntrypoints } from './vite-plugin-gas-entrypoints';

type MinimalChunk = {
  type: 'chunk';
  fileName: string;
  code: string;
};

type MinimalBundle = Record<string, MinimalChunk>;

const runGenerateBundle = (plugin: Plugin, bundle: MinimalBundle) => {
  const generateBundle = plugin.generateBundle;

  if (typeof generateBundle !== 'function') {
    throw new Error('generateBundle hook was not found.');
  }

  (generateBundle as (options: unknown, bundle: unknown, isWrite: boolean) => void)({}, bundle, false);
};

describe('gasEntrypoints', () => {
  it('appends GAS top-level wrapper functions to Code.js', () => {
    const plugin = gasEntrypoints(['doGet', 'ping']);
    const bundle: MinimalBundle = {
      'Code.js': {
        type: 'chunk',
        fileName: 'Code.js',
        code: 'var AppsScriptBundle = {};',
      },
    };

    runGenerateBundle(plugin, bundle);

    const code = bundle['Code.js'];

    expect(code?.type).toBe('chunk');
    expect(code?.code).toContain('function doGet()');
    expect(code?.code).toContain('return AppsScriptBundle.ping.apply(this, arguments);');
  });

  it('rejects invalid entrypoint names', () => {
    expect(() => gasEntrypoints(['do-get'])).toThrow('Invalid GAS entrypoint name: "do-get"');
  });

  it('rejects duplicate entrypoint names', () => {
    expect(() => gasEntrypoints(['ping', 'ping'])).toThrow(
      'Duplicate GAS entrypoint name: "ping"',
    );
  });
});
