import fs from 'fs';
import { goTo, closeBrowser } from 'sneaky-puppeteer';
import login from 'puppeteer-login';
import * as Sentry from '@sentry/node';

import navigateToCreditSummary from './commands/navigateToCreditSummary';

Sentry.init({ dsn: 'https://3581fa05cd364e2dbdbc391b08125aba@sentry.io/1541095' });

const delay = (time: number) =>
  new Promise(resolve => setTimeout(resolve, time));

const BANK_URL = 'https://www.wellsfargo.com/';

(async () => {
  try {
    console.log(`Navigating to ${ BANK_URL } ...`);
    const page = await goTo(BANK_URL);

    // Login to the account
    console.log('Logging into account...');
    await login({
      page,
      loginButtonElementSelector: '#btnSignon',
      passwordElementSelector: '#password',
      userIdElementSelector: '#userid'
    });

    // Open the credit card account summary
    console.log('Navigating to credit card account summary...');
    await navigateToCreditSummary(page);

    // Gather transactions
    console.log('Gathering posted transactions...');
    const transactions = await page.evaluate(`
      Array.from(document.querySelectorAll('.detailed-transaction'))
        .map(el => ({
          transDate: $(el).find("td[headers='posted-trans trans-date']")[0].innerText,
          postDate: $(el).find("td[headers='posted-trans post-date']")[0].innerText,
          description: $(el).find("td[headers='posted-trans description']")[0].innerText,
          amount: $(el).find("td[headers='posted-trans amount']")[0].innerText,
          balance: $(el).find("td[headers='posted-trans balance']")[0].innerText,
        }))
    `);

    console.log('Gathering temporary authorizations...');
    await page.click('.temp-auth-ec');
    await delay (1000);
    const temporaryAuthorizations = await page.evaluate(`
      Array.from(document.querySelectorAll('.temporary-authorizations tbody tr'))
        .map(el => {
          var tdList = el.querySelectorAll('td');
          return {
            transDate: tdList[0].textContent.trim(),
            postDate: "",
            description: tdList[1].textContent.trim(),
            amount: tdList[2].textContent.trim(),
            balance: "",
          };
        })
    `);

    console.log('Scraping complete. Dumping output to ./scraper-output/data.json...');
    const dir = './scraper-output';
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
    }
    fs.writeFile(`${ dir }/data.json`, JSON.stringify({ data: [ ...temporaryAuthorizations, ...transactions ]}), err => {
      if (err) return console.error(err)
    });

    console.log('Closing browser...');
    await closeBrowser();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
