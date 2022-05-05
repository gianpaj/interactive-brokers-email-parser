const cheerio = require("cheerio");
const { assert } = require("console");
const fs = require("fs");

// list .html files in the current the directory
const htmlFiles = fs.readdirSync("./").filter((file) => file.endsWith(".html"));

// find the most recent file by date in file name
const mostRecentFile = htmlFiles.reduce((a, b) => {
  const aDate = new Date(a.split(".")[0]);
  const bDate = new Date(b.split(".")[0]);
  return aDate > bDate ? a : b;
});
const date = mostRecentFile.split(".")[1];

// yesterday's date in "yearmonthday" format without "-"
// const yesterday = new Date(new Date().getTime() - 24 * 60 * 60 * 1000).toISOString().slice(0, 10).replace(/-/g, "");

const activityStatement = `ActivityStatement.${date}.html`;
const dailyTradeReport = `DailyTradeReport.${date}.html`;
console.log(`Parsing ${activityStatement}...`);
console.log(`Parsing ${dailyTradeReport}...`);

// Activity Statement
const $AS = cheerio.load(fs.readFileSync(`./${activityStatement}`));

// Daily Trade Report
const $DR = cheerio.load(fs.readFileSync(`./${dailyTradeReport}`));

// values
let startingValue = $AS(
  "div > div.col-xs-12.col-sm-12.col-md-12.col-lg-4 > div > table > tbody > tr:nth-child(1) > td:nth-child(2)"
).text();
startingValue = parseFloat(startingValue.replace(/,/g, "")) || 0;

// find element based on the td sibling
let markToMarket = $AS('div > div > div > table > tbody > tr > td:contains("Mark-to-Market") + td').text();
markToMarket = parseFloat(markToMarket.replace(/,/g, "")) || 0;

let changeInDividendAccruals = $AS(
  'div > div > div > table > tbody > tr > td:contains("Change in Dividend Accruals") + td'
).text();
changeInDividendAccruals = parseFloat(changeInDividendAccruals.replace(/,/g, "")) || 0;

let brokerFees = $AS('div > div > div > table > tbody > tr > td:contains("Broker Fees") + td').text();
brokerFees = parseFloat(brokerFees.replace(/,/g, "")) || 0;

let changeInBrokerFeeAccruals = $AS(
  'div > div > div > table > tbody > tr > td:contains("Change in Broker Fee Accruals") + td'
).text();
changeInBrokerFeeAccruals = parseFloat(changeInBrokerFeeAccruals.replace(/,/g, "")) || 0;

let dividends = $AS('div > div > div > table > tbody > tr > td:contains("Dividends") + td').text();
dividends = parseFloat(dividends.replace(/,/g, "")) || 0;

let commissions = $AS('div > div > div > table > tbody > tr > td:contains("Commissions") + td').text();
commissions = parseFloat(commissions.replace(/,/g, "")) || 0;

let withholdingTax = $AS('div > div > div > table > tbody > tr > td:contains("Withholding Tax") + td').text();
withholdingTax = parseFloat(withholdingTax.replace(/,/g, "")) || 0;

let otherFXTranslations = $AS(
  'div > div > div > table > tbody > tr > td:contains("Other FX Translations") + td'
).text();
otherFXTranslations = parseFloat(otherFXTranslations.replace(/,/g, "")) || 0;

let endingValue = $AS('div > div > div > table > tbody > tr > td:contains("Ending Value") + td').text();
endingValue = parseFloat(endingValue.replace(/,/g, "")) || 0;

// # Cash Report
let tradesSales = $AS('div > table > tbody > tr > td:contains("Trades (Sales)") + td').text();
tradesSales = parseFloat(tradesSales.replace(/,/g, "")) || 0;
let tradesPurchase = $AS('div > table > tbody > tr > td:contains("Trades (Purchase)") + td').text();
tradesPurchase = parseFloat(tradesPurchase.replace(/,/g, "")) || 0;

// # Realized & Unrealized Performance Summary
let realizedStocks = $AS("div > table > tbody > tr > td.indent:contains('Total Stocks') ~ :nth-of-type(7)").text();
realizedStocks = parseFloat(realizedStocks.replace(/,/g, "")) || 0;
let unrealizedStocks = $AS("div > table > tbody > tr > td.indent:contains('Total Stocks') ~ :nth-of-type(12)").text();
unrealizedStocks = parseFloat(unrealizedStocks.replace(/,/g, "")) || 0;

let numberOfTrades = $DR("#summaryDetailTable > tbody > tr.row-summary").length;
let numberOfBuyTrades = $DR("#summaryDetailTable > tbody > tr.row-summary > td:contains('BUY')").length;
let numberOfSellTrades = $DR("#summaryDetailTable > tbody > tr.row-summary > td:contains('SELL')").length;

console.log(`
Starting Value: ${startingValue}
Mark-to-Market: ${markToMarket}
Dividends: ${dividends}
Withholding Tax: ${withholdingTax}
Change in Dividend Accruals: ${changeInDividendAccruals}
Broker Fees: ${brokerFees}
Change in Broker Fee Accruals: ${changeInBrokerFeeAccruals}
Commissions: ${commissions}
Other FX Translations: ${otherFXTranslations}
Ending Value: ${endingValue}

Number of Trades: ${numberOfTrades}
Number of Buy Trades: ${numberOfBuyTrades}
Number of Sell Trades: ${numberOfSellTrades}`);

console.log(`
# Cash Report

Trades (Sales): ${tradesSales}
Trades (Purchase): ${tradesPurchase}`);

console.log(`
# Realized & Unrealized Performance Summary

Realized Stocks: ${realizedStocks}
Unrealized Stocks: ${unrealizedStocks}`);

let endingValueSum =
  startingValue +
  markToMarket +
  dividends +
  withholdingTax +
  changeInDividendAccruals +
  brokerFees +
  changeInBrokerFeeAccruals +
  commissions +
  otherFXTranslations;
// round to 2 decimal places
endingValueSum = parseFloat(endingValueSum.toFixed(3).slice(0, -1));

assert(endingValueSum === endingValue, `Starting and Ending Values should match: ${endingValueSum} == ${endingValue}`);
assert(
  numberOfTrades === numberOfBuyTrades + numberOfSellTrades,
  `Number of Trades should match: ${numberOfTrades} == ${numberOfBuyTrades + numberOfSellTrades}`
);
