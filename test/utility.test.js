// load dependencies 
const { deployProxy, upgradeProxy } = require('@openzeppelin/truffle-upgrades');
const { assert } = require('chai');
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const expect = chai.expect;
chai.use(chaiAsPromised);

const BN = require("big.js");
const { resToNumber: toNumber, numToBN: toBN } = require("./bnHelpers");
const DAO = artifacts.require('IkonDAO');
const IkonDAOToken = artifacts.require('IkonDAOToken');


contract("IKonDAOCollective (utility)", accounts => {
    let owner = accounts[0]; 
    let other = accounts[1];
    let [ ,  , alice, bob, carl, david] = accounts;
    let dao, daoProxy, daoGovToken, daoToken, daoGovInstance, daoGovernor, daoTimelock; 
    let minterRole = web3.utils.soliditySha3("MINTER_ROLE");
    let snapShotRole = web3.utils.soliditySha3("SNAPSHOT_ROLE");
    let snapShotRole = web3.utils.soliditySha3("DEFAULT_ADMIN_ROLE");
    let balances;  
})