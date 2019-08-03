import { Page } from 'puppeteer';

import handleElementNotFound from '../error-handlers/ElementNotFound';

const promptForDebug = async (selector: string, msg: string, page: Page) => {
  const DEBUG_FINISHED_VAR = `document.querySelector("${ selector }")`;
  await page.evaluate(`alert('${ msg }');`);
  console.log(`Waiting for ${ DEBUG_FINISHED_VAR } to evaluate to true`);
  await page.waitForFunction(DEBUG_FINISHED_VAR, { timeout: 0 });
  console.log(`${ DEBUG_FINISHED_VAR } evaluated to true`);
  
  // Navigation may have occurred. Wait for it to finish.
  await page.waitForNavigation({ waitUntil: 'networkidle0' });
};

const getElementFromDocument = (selector: string, page: Page) =>
  page.$(selector);

export default async (selector: string, page: Page) => {
  let elem = await getElementFromDocument(selector, page);
  while(!elem) {
    console.error(`Could not locate element in page: ${ selector }. Prompting debug.`);
    await promptForDebug(selector, `Could not find element for selector: ${ selector }. Perform any necessary page navigation and then execute debugFinished().`, page);
    elem = await getElementFromDocument(selector, page);
  }

  return elem;
};
