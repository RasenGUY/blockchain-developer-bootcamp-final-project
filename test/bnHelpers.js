// some helper functions for calculating bignumbers
const { replace } = require("lodash");
const BN = require("big.js");
const web3 = require("web3");

// from normal number to bn
exports.resToNumber = res => new BN(res).div(new BN("1e18")).toNumber();
exports.numToBN = num => web3.utils.toBN(new BN(String(num).concat("e18")));

// // from decimals to BN
// exports.floatToBN = (number, decimals) => {
//     let float = typeof(number) === "string" ? Number(+(number.replace(",", "."))) : number;
//     let solBN =  float * Number(10) ** Number(decimals);
//     return new BN(solBN); 
// }
