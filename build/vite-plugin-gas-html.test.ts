import { randomUUID } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import type { Plugin, ResolvedConfig } from 'vite';
import { gasInlineHtml } from './vite-plugin-gas-html';

const runInlinePlugin = (plugin: Plugin, outDir: string) => {
  const configResolved = plugin.configResolved;
  const closeBundle = plugin.closeBundle;

  if (typeof configResolved !== 'function' || typeof closeBundle !== 'function') {
    throw new Error('Required plugin hooks were not found.');
  }

  (
    configResolved as (this: unknown, config: ResolvedConfig) => void
  ).call({ pluginName: 'gas-inline-html-test' }, {
    root: outDir,
    build: {
      outDir,
    },
  } as ResolvedConfig);
  (closeBundle as (this: unknown) => void).call({ pluginName: 'gas-inline-html-test' });
};

const createTempOutDir = () => {
  const outDir = join(tmpdir(), `gas-inline-html-${randomUUID()}`);
  mkdirSync(join(outDir, 'assets'), { recursive: true });
  return outDir;
};

describe('gasInlineHtml', () => {
  it('inlines local module scripts and stylesheets', () => {
    const outDir = createTempOutDir();

    try {
      writeFileSync(
        join(outDir, 'index.html'),
        [
          '<!doctype html>',
          '<html>',
          '<head>',
          '<script type="module" src="/assets/index.js"></script>',
          '<link rel="stylesheet" href="/assets/index.css">',
          '<script src="https://cdn.example.invalid/app.js"></script>',
          '</head>',
          '<body><div id="app"></div></body>',
          '</html>',
        ].join('\n'),
      );
      writeFileSync(join(outDir, 'assets/index.js'), 'console.log("inline js");');
      writeFileSync(join(outDir, 'assets/index.css'), 'body { color: black; }');

      runInlinePlugin(gasInlineHtml(), outDir);

      const html = readFileSync(join(outDir, 'index.html'), 'utf8');

      expect(html).toContain('<script>\nconsole.log("inline js");\n</script>');
      expect(html).toContain('<style>\nbody { color: black; }\n</style>');
      expect(html).toContain('<script src="https://cdn.example.invalid/app.js"></script>');
      expect(existsSync(join(outDir, 'assets'))).toBe(false);
    } finally {
      rmSync(outDir, { force: true, recursive: true });
    }
  });

  it('does not read assets outside the build output directory', () => {
    const outDir = createTempOutDir();
    const secretPath = join(outDir, '../secret.css');

    try {
      writeFileSync(join(outDir, 'index.html'), '<link rel="stylesheet" href="../secret.css">');
      writeFileSync(secretPath, 'body { color: red; }');

      runInlinePlugin(gasInlineHtml(), outDir);

      const html = readFileSync(join(outDir, 'index.html'), 'utf8');

      expect(html).toContain('<link rel="stylesheet" href="../secret.css">');
      expect(html).not.toContain('body { color: red; }');
    } finally {
      rmSync(outDir, { force: true, recursive: true });
      rmSync(secretPath, { force: true });
    }
  });
});
