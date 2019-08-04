import fs from 'fs';
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
        }))
    `);

    
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

    const dir = './scraper-output';
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
    }
    fs.writeFile(`${ dir }/data.json`, JSON.stringify({ data: [ ...temporaryAuthorizations, ...transactions ]}), err => {
      if (err) return console.error(err)
    });

    await closeBrowser();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
