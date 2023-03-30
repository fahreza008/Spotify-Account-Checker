const puppeteer = require('puppeteer');
const fs = require('fs');
const readline = require('readline');
const chalk = require('chalk'); // Import chalk library

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question('Input your account file (ex: list.txt) : ', (fileName) => {
  rl.close();

  const accounts = fs.readFileSync(fileName, 'utf8').split('\n');

  (async () => {
    for (let i = 0; i < accounts.length; i++) {
      const [email, password] = accounts[i].split('|');
      let loggedIn = false;

      while (!loggedIn) {
        // Launch a new browser instance
        const browser = await puppeteer.launch({
          headless: false,
          defaultViewport: null,
          args: ['--window-size=1200,800'],
        });

        // Create a new page instance
        const page = await browser.newPage();

        // Go to the Spotify login page
        await page.goto('https://accounts.spotify.com/en/login');

        // Fill in the login form and submit
        await page.type('#login-username', email);
        await page.type('#login-password', password);
        await page.click('#login-button');

        // Wait for the login error message
        await page.waitForSelector('.Message-sc-15vkh7g-0.dHbxKh', { timeout: 3000 }).catch(() => {});

        // Check if login was successful
        const loginError = await page.$('.Message-sc-15vkh7g-0.dHbxKh');

        if (loginError) {
          console.log(chalk.red(`Login failed with email ${email}`)); // Output in red color
          await browser.close();
          break; // Move to the next account
        } else {
          loggedIn = true;
          console.log(chalk.green(`Login successful with email ${email}`)); // Output in green color

          // Do whatever you need to do with the logged-in user here

          // Close the browser instance
          await browser.close();
        }
      }
    }
  })();
});
