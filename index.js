const cheerio = require("cheerio");
const { assert } = require("console");
const fs = require("fs");

// yesterday's date in "yearmonthday" format without "-"
const yesterday = new Date(new Date().getTime() - 24 * 60 * 60 * 1000).toISOString().slice(0, 10).replace(/-/g, "");

const activityStatementFile = `ActivityStatement.${yesterday}.html`;
console.log(`Scraping for ${activityStatementFile}...`);

const dailyTradeReport = `DailyTradeReport.${yesterday}.html`;

// ActivityStatement
const $AS = cheerio.load(fs.readFileSync(`./${activityStatementFile}`));

// Daily Trade Report
const $DR = cheerio.load(fs.readFileSync(`./${dailyTradeReport}`));

// values
let startingValue = $AS(
  "div > div.col-xs-12.col-sm-12.col-md-12.col-lg-4 > div > table > tbody > tr:nth-child(1) > td:nth-child(2)"
).text();
startingValue = parseFloat(startingValue.replace(/,/g, ""));

// find element based on the td sibling
let markToMarket = $AS('div > div > div > table > tbody > tr > td:contains("Mark-to-Market") + td').text();
markToMarket = parseFloat(markToMarket.replace(/,/g, ""));

let changeInDividendAccruals = $AS(
  'div > div > div > table > tbody > tr > td:contains("Change in Dividend Accruals") + td'
).text();
changeInDividendAccruals = parseFloat(changeInDividendAccruals.replace(/,/g, ""));

let commissions = $AS('div > div > div > table > tbody > tr > td:contains("Commissions") + td').text();
commissions = parseFloat(commissions.replace(/,/g, ""));

let otherFXTranslations = $AS(
  'div > div > div > table > tbody > tr > td:contains("Other FX Translations") + td'
).text();
otherFXTranslations = parseFloat(otherFXTranslations.replace(/,/g, ""));

let endingValue = $AS('div > div > div > table > tbody > tr > td:contains("Ending Value") + td').text();
endingValue = parseFloat(endingValue.replace(/,/g, ""));

// # Cash Report
let tradesSales = $AS('div > table > tbody > tr > td:contains("Trades (Sales)") + td').text();
tradesSales = parseFloat(tradesSales.replace(/,/g, ""));
let tradesPurchase = $AS('div > table > tbody > tr > td:contains("Trades (Purchase)") + td').text();
tradesPurchase = parseFloat(tradesPurchase.replace(/,/g, ""));

// # Realized & Unrealized Performance Summary
let realizedStocks = $AS("div > table > tbody > tr > td.indent:contains('Total Stocks') ~ :nth-of-type(7)").text();
realizedStocks = parseFloat(realizedStocks.replace(/,/g, ""));
let unrealizedStocks = $AS("div > table > tbody > tr > td.indent:contains('Total Stocks') ~ :nth-of-type(12)").text();
unrealizedStocks = parseFloat(unrealizedStocks.replace(/,/g, ""));

let numberOfTrades = $DR("#summaryDetailTable > tbody > tr.row-summary").length;
let numberOfBuyTrades = $DR("#summaryDetailTable > tbody > tr.row-summary > td:contains('BUY')").length;
let numberOfSellTrades = $DR("#summaryDetailTable > tbody > tr.row-summary > td:contains('SELL')").length;

console.log(`
Starting Value: ${startingValue}
Mark-to-Market: ${markToMarket}
Change in Dividend Accruals: ${changeInDividendAccruals}
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

let endingValueSum = startingValue + markToMarket + changeInDividendAccruals + commissions + otherFXTranslations;
// round to 2 decimal places
endingValueSum = Math.round(endingValueSum * 100) / 100;

assert(endingValueSum === endingValue, `Starting and Ending Values should match: ${endingValueSum} == ${endingValue}`);
assert(
  numberOfTrades === numberOfBuyTrades + numberOfSellTrades,
  `Number of Trades should match: ${numberOfTrades} == ${numberOfBuyTrades + numberOfSellTrades}`
);
