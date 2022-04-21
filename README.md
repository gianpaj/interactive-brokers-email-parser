# Interactive Brokers Email Parser

Retrieve the values from the emails from Interactive Brokers.

e.g. `ActivityStatement.20220420.html`

## Set up

TODO: How to configure your account to get the emails

## Example output

```text
$ npm run start
Scraping for ActivityStatement.20220420.html...

Starting Value: 800.42
Mark-to-Market: -252.8
Change in Dividend Accruals: -0.02
Commissions: -5.25
Other FX Translations: 0.37
Ending Value: 462.72

Number of Trades: 23
Number of Buy Trades: 12
Number of Sell Trades: 11

# Cash Report

Trades (Sales): 4069.04
Trades (Purchase): -9399.6

# Realized & Unrealized Performance Summary

Realized Stocks: -107.48
```
