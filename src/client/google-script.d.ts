declare global {
  type GoogleScriptRun = {
    withSuccessHandler<T>(handler: (value: T) => void): GoogleScriptRun;
    withFailureHandler(handler: (error: Error) => void): GoogleScriptRun;
    [functionName: string]: unknown;
  };

  interface Window {
    google?: {
      script?: {
        run?: GoogleScriptRun;
      };
    };
  }
}

export {};
