import { ethers } from "ethers";
import fs from "fs";
import axios from "axios";
require('dotenv').config()

const INFURA_URL:string = `https://mainnet.infura.io/v3/${process.env.INFURA_ID}`;
const PROVIDER:ethers.providers.JsonRpcProvider = new ethers.providers.JsonRpcProvider(INFURA_URL);

interface TokenData {
  amount: string,
  tokenAddress: string,
  tokenSymbol: string,
  tokenType: string,
  traderType: string,
  type: string
}

interface FillData {
  makerAddress: string,
  takerAddress: string,
  assets: any[],
  protocolFee: {ETH: any, USD: any}
}

async function getData(addr: string) {

  // valid stablecoins to use to get the volume
  const stables:string[] = [
    '0x6b175474e89094c44da98b954eedeac495271d0f', 
    '0xbc6da0fe9ad5f3b0d58160288917aa56653660e9'
  ];

  // make request
  let fills:FillData[] = [];

  let page:number = 1;
  let pageCount:number = 100;

  // iterate until at final page
  while (page <= pageCount) {
    // make request and add to fills array
    let response = await axios.get(
      `https://api.0xtracker.com/fills?token=${addr.toLowerCase()}&limit=50&page=${page++}`
    );
    fills.push.apply(fills, response.data.fills);
    // update pageCount
    pageCount = parseFloat(response.data.pageCount);
  }

  let fees:number = 0;
  let stableVolume:number = 0;
  let tokenVolume:number = 0;
  let takersArr:string[] = [];

  // get the symbol for the passed in token
  const erc20:ethers.Contract = new ethers.Contract(
    addr, 
      [
        "function symbol() view returns (string)"
      ],
    PROVIDER
  );
  const symbol = await erc20.symbol();

  // iterate through each fill
  for (const fill of fills) {
    // add taker to the array
    takersArr.push(fill.takerAddress)
    // add to fees
    fees += parseFloat(fill.protocolFee.USD);
    // get the stablecoin in the trade
    const stable:TokenData = stables.includes(fill.assets[0].tokenAddress)
      ? fill.assets[0]
      : fill.assets[1];
    // get the token that isn't the stablecoin
    const token:TokenData = stables.includes(fill.assets[0].tokenAddress)
      ? fill.assets[1]
      : fill.assets[0];
    // add to volume
    stableVolume += parseFloat(stable.amount);
    tokenVolume += token.amount ? parseFloat(token.amount) : 0;
  }

  // remove duplicates
  let takers:number = [...new Set(takersArr)].length;

  // log data
  console.log(`\n${symbol} (${addr}): \n`);
  console.log(`Total protocol fees: $${fees.toLocaleString(undefined, {minimumFractionDigits: 1})} USD`);
  console.log(`Total stablecoin volume: $${stableVolume.toLocaleString(undefined, {minimumFractionDigits: 1})} USD`);
  console.log(`Total token volume: $${tokenVolume.toLocaleString(undefined, {minimumFractionDigits: 1})} USD`);
  console.log(`Unique takers: ${takers}`);
  console.log(`Total trades: ${fills.length}`);

  // formatted values for csv file
  const formattedFee:string = fees.toFixed(2);
  const formattedStableVolume:string = stableVolume.toFixed(2);
  const formattedTokenVolume:string = tokenVolume.toFixed(2);
  const formattedTakers:string = takers.toString();
  const formattedFills:string = fills.length.toString();

  // add line to csv input
  csvInput += `${symbol},${formattedFee},${formattedStableVolume},${formattedTokenVolume},${formattedTakers},${formattedFills}\n`;
}


let csvInput:string = '';

async function start() {

  // list of RC tokens to get data for
  const tokens:string[] = [
    '0x8341c03f454aa4D756B83f262d1911F79C75E242',
    '0x4eF32658A6A2A63e42E31b342bD2aeBf11A1be09',
    '0x3238efeF52F1141734B17cdEFcf70539C01ea7a9',
    '0xd6f207d1C9Dc693B729dc93CADa0a3C921D93024',
  ];

  // get data for each pool in the array
  for (const addr of tokens) {
    await getData(addr);
  }

  // table header
  const header:string = `Token Name,Protocol Fees (USD),Total Stablecoin Volume,Total Token Volume,Unique Takers,Total Trades\n`;

  csvInput = header + csvInput;

  // output as csv
  fs.writeFile('output.csv', csvInput, function (err: any) {
    if (err) return console.log(err);
  });

}

start();