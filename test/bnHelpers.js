// some helper functions for calculating bignumbers
const { replace } = require("lodash");
const BN = require("big.js");
const web3 = require("web3");
const util = require("util");

// from normal number to bn
exports.toUnit = res => new BN(res).div(new BN("1e18")).toNumber();
exports.unitToBN = num => web3.utils.toBN(new BN(String(num).concat("e18")));
exports.toNumber = res => new BN(res).toNumber();
exports.toBN = num => web3.utils.toBN(new BN(String(num)));
exports.waitNBlocks = async n => {
    const sendAsync = util.promisify(web3.currentProvider.sendAsync);
    await Promise.all(
      [...Array(n).keys()].map(i =>
        sendAsync({
          jsonrpc: '2.0',
          method: 'evm_mine',
          id: i
        })
      )
    );
};