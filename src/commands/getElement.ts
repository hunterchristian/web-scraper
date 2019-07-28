import { Page } from 'puppeteer';

import Command from './Command';
import handleElementNotFound from '../error-handlers/ElementNotFound';

const DEBUG_FINISHED_VAR = 'window.DEBUG_FINISHED';
const retryIfDebug = async (selector: string, page: Page) => {
  console.error(`Could not locate element in page: ${ selector }`);
  if (process.env.DEBUG) {
    console.log('process.env.DEBUG set to true. Waiting for user input.');
    await page.evaluate(`alert('Could not find element for selector: ${ selector }. Perform any necessary page navigation and then execute debugFinished().'); window.debugFinished = function () { window.DEBUG_FINISHED = true; }`);
    console.log(`Waiting for ${ DEBUG_FINISHED_VAR } to evaluate to true.`);
    await page.waitForFunction(DEBUG_FINISHED_VAR, { timeout: 180000 });
    const elem = await getElementFromDocument(selector, page);
    if (!elem) {
      console.error('Still could not find element in document.');
    }
    console.log(`Value of element: ${ JSON.stringify(elem) }`);

    return elem;
  } else {
    handleElementNotFound(selector); 
  }
};

const getElementFromDocument = (selector: string, page: Page) =>
  page.evaluate(selector => document.querySelector(selector));

export default (selector: string, page: Page) => new Command<HTMLElement>(async () => {
  let elem = await getElementFromDocument(selector, page);
  if(!elem) {
    elem = await retryIfDebug(selector, page);
  }

  return elem;
});
