import { goTo, closeBrowser } from 'sneaky-puppeteer';
import login from 'puppeteer-login';

// Commands
import navigateToCreditSummary from './commands/navigateToCreditSummary';

const delay = (time: number) =>
  new Promise(resolve => setTimeout(resolve, time));

(async () => {
  try {
    const page = await goTo('https://www.wellsfargo.com/');

    // Login to the account
    await login({
      page,
      loginButtonElementSelector: '#btnSignon',
      passwordElementSelector: '#password',
      userIdElementSelector: '#userid'
    });

    // Open the credit card account summary
    await navigateToCreditSummary(page);

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

    await closeBrowser();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
