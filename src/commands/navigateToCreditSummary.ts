import { Page } from 'puppeteer';

import getElement from './getElement';

export default async (page: Page) => {
  console.log('Navigating to credit card account summary');
  await getElement('a > .icon.acct-tile.credit', page);

  await Promise.all([
    page.waitForNavigation({ waitUntil: 'networkidle0' }),
    page.evaluate('document.querySelector("a > .icon.acct-tile.credit").parentElement.click()'),
  ]);
};
