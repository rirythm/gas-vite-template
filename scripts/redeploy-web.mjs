import { spawnSync } from 'node:child_process';

const run = (command, args) => {
  const result = spawnSync(command, args, {
    encoding: 'utf8',
    stdio: ['inherit', 'pipe', 'pipe'],
  });

  if (result.stdout) {
    process.stdout.write(result.stdout);
  }

  if (result.stderr) {
    process.stderr.write(result.stderr);
  }

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }

  return result.stdout;
};

const description =
  process.argv.slice(2).join(' ') || process.env.DEPLOY_DESC || `redeploy ${new Date().toISOString()}`;

run('clasp', ['push', '--force']);

const versionOutput = run('clasp', ['version', description]);
const version = versionOutput.match(/Created version (\d+)/)?.[1];

if (!version) {
  throw new Error('Could not determine the created Apps Script version.');
}

const deploymentIds = process.env.DEPLOYMENT_ID
  ? [process.env.DEPLOYMENT_ID]
  : run('clasp', ['deployments'])
      .split('\n')
      .map((line) => line.match(/^- (\S+) @(\S+)(?: - .*)?$/))
      .filter((match) => match && match[2] !== 'HEAD')
      .map((match) => match?.[1])
      .filter(Boolean);

if (deploymentIds.length === 0) {
  throw new Error('No web app deployment found. Run `pnpm deploy:web` first.');
}

if (!process.env.DEPLOYMENT_ID && deploymentIds.length > 1) {
  throw new Error('Multiple web app deployments found. Set DEPLOYMENT_ID to choose one.');
}

const [deploymentId] = deploymentIds;

run('clasp', ['deploy', '-i', deploymentId, '-V', version, '-d', description]);
