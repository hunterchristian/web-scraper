import { Page } from 'puppeteer';

import Command from './Command';
import getElement from './getElement';

export default (page: Page) => new Command(async () => {
  let link = await getElement('a > .icon.acct-tile.credit', page).execute();
  if (link.parentElement) {
    link.parentElement.click();
  }
});
