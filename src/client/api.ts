import type { RuntimeInfo } from '@shared/runtime';

export type PingResponse = {
  info: RuntimeInfo;
  message: string;
};

const mockPing = (): Promise<PingResponse> =>
  Promise.resolve({
    info: {
      appName: 'GAS Vite Template',
      generatedAt: new Date().toISOString(),
      locale: navigator.language,
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
    message: 'GAS Vite Template is running in local preview mode.',
  });

type ScriptRunner = GoogleScriptRun & {
  ping?: () => void;
};

type ServerFunctionName = keyof ScriptRunner & 'ping';

const serverFunctions = {
  ping: true,
} satisfies Record<ServerFunctionName, true>;

const callServer = <Result>(functionName: ServerFunctionName): Promise<Result> => {
  const runner = window.google?.script?.run;

  if (!runner) {
    return mockPing() as Promise<Result>;
  }

  return new Promise((resolve, reject) => {
    const scriptRunner = runner
      .withSuccessHandler<Result>(resolve)
      .withFailureHandler((error) => {
        reject(error instanceof Error ? error : new Error(String(error)));
      }) as ScriptRunner;
    const callable = scriptRunner[functionName];

    if (!serverFunctions[functionName] || typeof callable !== 'function') {
      reject(new Error(`Server function "${functionName}" is not callable.`));
      return;
    }

    callable.call(scriptRunner);
  });
};

export const pingServer = (): Promise<PingResponse> => {
  const runner = window.google?.script?.run;

  if (!runner) {
    return mockPing();
  }

  return callServer<PingResponse>('ping');
};
