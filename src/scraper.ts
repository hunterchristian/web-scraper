import axios from 'axios';

// puppeteer-extra is a drop-in replacement for puppeteer,
// it augments the installed puppeteer with plugin functionality
// @ts-ignore
import puppeteer from "puppeteer-extra";

// add stealth plugin and use defaults (all evasion techniques)
// @ts-ignore
import pluginStealth from "puppeteer-extra-plugin-stealth";
puppeteer.use(pluginStealth())

// Commands
import login from './commands/login';
import navigateToCreditSummary from './commands/navigateToCreditSummary';

const url = 'https://www.wellsfargo.com/';

const delay = (time: number) =>
  new Promise(resolve => setTimeout(resolve, time));

(async () => {
  try {
    const browser = await puppeteer.launch({ headless: false, ignoreDefaultArgs: ['--enable-automation'] });
    const page = await browser.newPage();
    await page.goto(url);

    // Login to the account
    await login(page).execute();
    // Open the credit card account summary
    await navigateToCreditSummary(page).execute();

    // Gather transactions
    const transactions = await page.evaluate(`
      Array.from(document.querySelectorAll('.detailed-transaction'))
        .map(el => ({
          transDate: $(el).find("td[headers='posted-trans trans-date']")[0].innerText,
          postDate: $(el).find("td[headers='posted-trans post-date']")[0].innerText,
          description: $(el).find("td[headers='posted-trans description']")[0].innerText,
          amount: $(el).find("td[headers='posted-trans amount']")[0].innerText,
          balance: $(el).find("td[headers='posted-trans balance']")[0].innerText,
        }))`);

    console.log(`Transactions: ${ JSON.stringify(transactions) }`);

    //await browser.close();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
