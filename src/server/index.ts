import { formatRuntimeMessage, type RuntimeInfo } from '@shared/runtime';

const APP_NAME = 'GAS Vite Template';

const expose = (name: string, value: unknown) => {
  (globalThis as Record<string, unknown>)[name] = value;
};

const renderIndex = () =>
  HtmlService.createTemplateFromFile('index').evaluate().setTitle(APP_NAME);

export const doGet = () => renderIndex();

export const onOpen = () => {
  SpreadsheetApp.getUi()
    .createMenu('Vite GAS')
    .addItem('Open sidebar', 'showSidebar')
    .addSeparator()
    .addItem('Log runtime info', 'logRuntimeInfo')
    .addToUi();
};

export const showSidebar = () => {
  SpreadsheetApp.getUi().showSidebar(renderIndex());
};

export const getRuntimeInfo = (): RuntimeInfo => ({
  appName: APP_NAME,
  generatedAt: new Date().toISOString(),
  locale: Session.getActiveUserLocale(),
  timeZone: Session.getScriptTimeZone(),
});

export const ping = () => {
  const info = getRuntimeInfo();
  return {
    info,
    message: formatRuntimeMessage(info),
  };
};

export const logRuntimeInfo = () => {
  console.log(JSON.stringify(ping()));
};

expose('doGet', doGet);
expose('onOpen', onOpen);
expose('showSidebar', showSidebar);
expose('getRuntimeInfo', getRuntimeInfo);
expose('ping', ping);
expose('logRuntimeInfo', logRuntimeInfo);
