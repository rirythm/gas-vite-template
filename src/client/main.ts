import { pingServer, type PingResponse } from './api';
import './styles.css';

const escapeHtml = (value: unknown) =>
  String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');

const render = (
  app: HTMLDivElement,
  response?: PingResponse,
  loading = false,
  error?: string,
) => {
  const info = response?.info;
  const generatedAt = info ? new Date(info.generatedAt).toLocaleString() : '-';
  const heading = error ?? response?.message ?? 'Waiting for Apps Script runtime...';

  app.innerHTML = `
    <section class="shell">
      <header class="topbar">
        <div>
          <p class="eyebrow">Google Apps Script / Vite</p>
          <h1>GAS Vite Template</h1>
        </div>
        <button class="button" data-action="refresh" ${loading ? 'disabled' : ''}>
          ${loading ? 'Loading' : 'Refresh'}
        </button>
      </header>

      <section class="status">
        <div>
          <span class="label">Status</span>
          <strong>${error ? 'Error' : loading ? 'Connecting' : 'Ready'}</strong>
        </div>
        <div>
          <span class="label">Runtime</span>
          <strong>${escapeHtml(info?.timeZone ?? 'Local preview')}</strong>
        </div>
        <div>
          <span class="label">Locale</span>
          <strong>${escapeHtml(info?.locale ?? navigator.language)}</strong>
        </div>
      </section>

      <section class="panel">
        <h2>${escapeHtml(heading)}</h2>
        <dl>
          <div>
            <dt>App</dt>
            <dd>${escapeHtml(info?.appName ?? 'GAS Vite Template')}</dd>
          </div>
          <div>
            <dt>Generated</dt>
            <dd>${escapeHtml(generatedAt)}</dd>
          </div>
        </dl>
      </section>
    </section>
  `;
};

const refresh = async () => {
  const app = document.querySelector<HTMLDivElement>('#app');

  if (!app) {
    throw new Error('App root was not found.');
  }

  render(app, undefined, true);

  try {
    render(app, await pingServer());
  } catch (error) {
    render(app, undefined, false, error instanceof Error ? error.message : String(error));
  }
};

const start = () => {
  const app = document.querySelector<HTMLDivElement>('#app');

  if (!app) {
    throw new Error('App root was not found.');
  }

  app.addEventListener('click', (event) => {
    const target = event.target;

    if (target instanceof HTMLElement && target.dataset.action === 'refresh') {
      void refresh();
    }
  });

  void refresh();
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', start, { once: true });
} else {
  start();
}
