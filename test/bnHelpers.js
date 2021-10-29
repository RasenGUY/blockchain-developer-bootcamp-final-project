// some helper functions for calculating bignumbers
const { replace } = require("lodash");
const BN = require("big.js");

// from normal number to bn
exports.resToNumber = res => new BN(res).div(new BN("1e18")).toNumber();

// // from decimals to BN
// exports.floatToBN = (number, decimals) => {
//     let float = typeof(number) === "string" ? Number(+(number.replace(",", "."))) : number;
//     let solBN =  float * Number(10) ** Number(decimals);
//     return new BN(solBN); 
// }
