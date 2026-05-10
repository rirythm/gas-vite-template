import { existsSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { isAbsolute, join, resolve, sep } from 'node:path';
import type { Plugin, ResolvedConfig } from 'vite';

const isLocalAsset = (value: string) => !/^(https?:)?\/\//.test(value) && !value.startsWith('data:');

const readBuiltAsset = (outDir: string, url: string) => {
  const normalizedOutDir = resolve(outDir);
  const [pathname = ''] = url.split(/[?#]/);
  let relativePath: string;

  try {
    relativePath = decodeURIComponent(pathname).replace(/^\/+/, '');
  } catch {
    return undefined;
  }

  const assetPath = resolve(normalizedOutDir, relativePath);
  const isInsideOutDir =
    assetPath === normalizedOutDir || assetPath.startsWith(`${normalizedOutDir}${sep}`);

  if (!isInsideOutDir) {
    return undefined;
  }

  return existsSync(assetPath) ? readFileSync(assetPath, 'utf8') : undefined;
};

const moveHeadScriptsToBodyEnd = (html: string) => {
  const bodyStart = html.search(/<body\b/i);

  if (bodyStart === -1) {
    return html;
  }

  const beforeBody = html.slice(0, bodyStart);
  const scripts: string[] = [];
  const withoutHeadScripts = beforeBody.replace(
    /\s*<script\b(?![^>]*\bsrc=)[^>]*>[\s\S]*?<\/script>/gi,
    (script) => {
      scripts.push(script.trimStart());
      return '';
    },
  );

  if (scripts.length === 0) {
    return html;
  }

  return `${withoutHeadScripts}${html.slice(bodyStart)}`.replace(
    /<\/body>/i,
    `${scripts.join('\n')}\n  </body>`,
  );
};

export const gasInlineHtml = (): Plugin => {
  let config: ResolvedConfig | undefined;

  return {
    name: 'gas-inline-html',
    apply: 'build',
    enforce: 'post',
    configResolved(resolvedConfig) {
      config = resolvedConfig;
    },
    closeBundle() {
      if (!config) {
        return;
      }

      const outDir = isAbsolute(config.build.outDir)
        ? config.build.outDir
        : resolve(config.root, config.build.outDir);
      const htmlPath = join(outDir, 'index.html');

      if (!existsSync(htmlPath)) {
        return;
      }

      let html = readFileSync(htmlPath, 'utf8');

      html = html.replace(
        /<script\b([^>]*)\bsrc="([^"]+)"([^>]*)>\s*<\/script>/g,
        (tag, before: string, src: string, after: string) => {
          if (!isLocalAsset(src) || !/\btype="module"/.test(`${before} ${after}`)) {
            return tag;
          }

          const source = readBuiltAsset(outDir, src);
          return source === undefined ? tag : `<script>\n${source}\n</script>`;
        },
      );

      html = html.replace(
        /<link\b([^>]*)\brel="stylesheet"([^>]*)\bhref="([^"]+)"([^>]*)>/g,
        (tag, _before: string, _middle: string, href: string, _after: string) => {
          if (!isLocalAsset(href)) {
            return tag;
          }

          const source = readBuiltAsset(outDir, href);
          return source === undefined ? tag : `<style>\n${source}\n</style>`;
        },
      );

      html = moveHeadScriptsToBodyEnd(html);

      writeFileSync(htmlPath, html);
      rmSync(join(outDir, 'assets'), { force: true, recursive: true });
    },
  };
};
