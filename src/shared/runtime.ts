export type RuntimeInfo = {
  appName: string;
  generatedAt: string;
  locale: string;
  timeZone: string;
};

export const formatRuntimeMessage = (info: RuntimeInfo) => {
  return `${info.appName} is running in ${info.timeZone}.`;
};
