const axios = require('axios');
const cheerio = require('cheerio');
const cron = require('node-cron');

// List of Twitter accounts to scrape
const twitterAccounts = [
  'Mr_Derivatives',
  'warrior_0719',
  'ChartingProdigy',
  'allstarcharts',
  'yuriymatso',
  'TriggerTrades',
  'AdamMancini4',
  'CordovaTrades',
  'Barchart',
  'RoyLMattox'
];

// Function to scrape a Twitter account for a specific stock symbol
const scrapeTwitter = async (account, ticker) => {
  try {
    const url = `https://twitter.com/${account}`;
    console.log(`Scraping URL: ${url}`);
    
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);

    // Extract tweets
    const tweets = $('div[lang]').text();
    console.log(`Tweets from ${account}: ${tweets}`);

    const mentions = (tweets.match(new RegExp(`\\$${ticker}`, 'g')) || []).length;
    console.log(`Mentions of ${ticker} by ${account}: ${mentions}`);

    return mentions;
  } catch (error) {
    console.error(`Error scraping ${account}:`, error.message);
    return 0;
  }
};

// Function to scrape all accounts for a specific stock symbol
const scrapeAllAccounts = async (ticker, interval) => {
  let totalMentions = 0;

  for (const account of twitterAccounts) {
    const mentions = await scrapeTwitter(account, ticker);
    totalMentions += mentions;
  }

  console.log(`'${ticker}' was mentioned '${totalMentions}' times in the last '${interval}' minutes.`);
};

// User inputs
const ticker = 'TSLA'; // Example ticker
const interval = 15; // Example interval in minutes

// Initial scraping
console.log(`Starting initial scrape for ticker '${ticker}' with interval of ${interval} minutes.`);
scrapeAllAccounts(ticker, interval);

// Schedule the scraper to run every X minutes
cron.schedule(`*/${interval} * * * *`, () => {
  console.log(`Scraping Twitter accounts for mentions of '${ticker}' every ${interval} minutes...`);
  scrapeAllAccounts(ticker, interval);
});
