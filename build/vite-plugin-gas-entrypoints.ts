import type { Plugin } from 'vite';

const identifierPattern = /^[A-Za-z_$][\w$]*$/;

const validateEntrypoints = (names: string[]) => {
  const seen = new Set<string>();

  for (const name of names) {
    if (!identifierPattern.test(name)) {
      throw new Error(`Invalid GAS entrypoint name: "${name}"`);
    }

    if (seen.has(name)) {
      throw new Error(`Duplicate GAS entrypoint name: "${name}"`);
    }

    seen.add(name);
  }
};

const renderEntrypoint = (name: string) => `
function ${name}() {
  return AppsScriptBundle.${name}.apply(this, arguments);
}
`;

export const gasEntrypoints = (names: string[]): Plugin => {
  validateEntrypoints(names);

  return {
    name: 'gas-entrypoints',
    apply: 'build',
    enforce: 'post',
    generateBundle(_options, bundle) {
      for (const asset of Object.values(bundle)) {
        if (asset.type !== 'chunk' || asset.fileName !== 'Code.js') {
          continue;
        }

        asset.code += `\n${names.map(renderEntrypoint).join('')}`;
      }
    },
  };
};
