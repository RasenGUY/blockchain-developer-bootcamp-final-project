const { deployProxy, upgradeProxy } = require('@openzeppelin/truffle-upgrades');
const DAO = artifacts.require('IkonDAO');
const IkonDAOGovernanceToken = artifacts.require('IkonDAOGovernanceToken');
const IkonDAOToken = artifacts.require('IkonDAOToken');
const IkonDAOGovernor = artifacts.require('IkonDAOGovernor');
const IkonDAOTimelockController = artifacts.require('IkonDAOTimelockController');

module.exports = async function (deployer, networks, accounts) {
    let owner = accounts[0]; 
    let other = accounts[1];
    let dao, daoProxy, daoGovToken, daoToken, daoGovernor, daoTimelock; 

    await deployer.deploy(DAO, {from: owner});
        await deployer.deploy(IkonDAOGovernanceToken, {from: owner});
        await deployer.deploy(IkonDAOToken, {from: owner}); 
        
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
