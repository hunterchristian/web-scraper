import axios from 'axios';
import puppeteer from 'puppeteer';

const url = 'https://www.wellsfargo.com/';

const MAYBE_USER_NAME = process.env.USER_NAME;
const MAYBE_PASSWORD = process.env.PASSWORD;
if (!MAYBE_USER_NAME) {
  console.error('process.env.USER_NAME is undefined. USER_NAME must be declared as an environment variable.');
  process.exit(1);
}
if (!MAYBE_PASSWORD) {
  console.error('process.env.PASSWORD is undefined. PASSWORD must be declared as an environment variable.');
  process.exit(1);
}
const USER_NAME = MAYBE_USER_NAME as string;
const PASSWORD = MAYBE_PASSWORD as string;

const delay = (time: number) =>
  new Promise(resolve => setTimeout(resolve, time));

(async () => {
  try {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    await page.goto(url);

    await page.type('#userid', USER_NAME);
    await page.type('#password', PASSWORD);
    await page.screenshot({ path: 'screenshots/login.jpg' });

    await delay(2000);
    await page.click('#btnSignon');
    await delay(2000);

    await page.screenshot({ path: 'screenshots/account_summary.jpg' });

    await browser.close();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
