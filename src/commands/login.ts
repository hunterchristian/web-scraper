import { Page } from 'puppeteer';

import Command from './Command';
import handleEnvVarNotDefined from '../error-handlers/EnvVarNotDefined';

export default (page: Page) => new Command(async () => {
  const MAYBE_USER_NAME = process.env.USER_NAME;
  const MAYBE_PASSWORD = process.env.PASSWORD;
  if (!MAYBE_USER_NAME) {
    handleEnvVarNotDefined('USER_NAME');
  }
  if (!MAYBE_PASSWORD) {
    handleEnvVarNotDefined('PASSWORD');
  }
  const USER_NAME = MAYBE_USER_NAME as string;
  const PASSWORD = MAYBE_PASSWORD as string;

  await page.type('#userid', USER_NAME);
  await page.type('#password', PASSWORD);
  await page.click('#btnSignon');
});
