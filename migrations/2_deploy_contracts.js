const { deployProxy, upgradeProxy } = require('@openzeppelin/truffle-upgrades');
const DAO = artifacts.require('IkonDAO');
const IkonDAOGovernanceToken = artifacts.require('IkonDAOGovernanceToken');
const IkonDAOToken = artifacts.require('IkonDAOToken');
const IkonDAOGovernor = artifacts.require('IkonDAOGovernor');
const IkonDAOTimelockController = artifacts.require('IkonDAOTimelockController');
const {resToNumber: toNum, numToBN: toBN}= require('../test/bnHelpers');


module.exports = async function (deployer, networks, accounts) {
    let owner = accounts[0]; 
    let other = accounts[1];
    let initialUsers = [accounts[2], accounts[3], accounts[4], accounts[5]]
    let dao, daoProxy, daoGovToken, daoToken, daoGovernor, daoTimelock;
    let weigthLimitFraction = toBN(0.49); 
    let initialVotes = toBN(100);
    let baseReward = toBN(100); 
    let baseRewardUtility = toBN(5);

    await deployer.deploy(DAO, {from: owner});
    await deployer.deploy(IkonDAOGovernanceToken, weigthLimitFraction, initialUsers, initialVotes, baseReward, {from: owner});
    await deployer.deploy(IkonDAOToken, baseRewardUtility, {from: owner}); 
        
    // instances 
    dao = await DAO.deployed(); 
    daoGovToken = await IkonDAOGovernanceToken.deployed();
    daoToken = await IkonDAOToken.deployed();
        
    await deployer.deploy(
        IkonDAOTimelockController, 
        3, 
        [owner], 
        [owner], 
        {from: owner}
    );
    daoTimelock = await IkonDAOTimelockController.deployed();
    
    await deployer.deploy(
        IkonDAOGovernor,
        daoGovToken.address,
        daoTimelock.address,
        "IkonDaoGovernor",
        5,
        10,
        {from: owner}
    ); 
    daoGovernor = await IkonDAOGovernor.deployed();
    
    daoProxy = await deployProxy(DAO, [daoGovToken.address, daoGovernor.address, daoTimelock.address, daoToken.address], {kind: 'uups', initializer: '__IkonDAO_init', unsafeAllow: [ 'constructor', 'delegatecall']}, {from: owner});
    // daoGovernor.transferOwnership(daoProxy.address);
    // daoTimelock.transferOwnership(daoProxy.address);
    };
