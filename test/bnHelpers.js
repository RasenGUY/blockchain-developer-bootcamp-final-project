// some helper functions for calculating bignumbers
const { replace } = require("lodash");
// const BN = require("big.js");
const web3 = require("web3");
const BN = web3.utils.BN;


// from normal number to bn
exports.toUnit = res => new BN(String(res)).div(new BN(String(1e18))).toNumber();
exports.unitToBN = num => new BN(String(num * 1e18));
exports.toNumber = res => new BN(String(res)).toNumber();
exports.toBN = num => new BN(String(num));
