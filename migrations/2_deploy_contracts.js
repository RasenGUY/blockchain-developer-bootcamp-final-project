const { deployProxy, upgradeProxy } = require('@openzeppelin/truffle-upgrades');
const DAO = artifacts.require('IkonDAO');
const IkonDAOGovernanceToken = artifacts.require('IkonDAOGovernanceToken');
const IkonDAOToken = artifacts.require('IkonDAOToken');
const IkonDAOGovernor = artifacts.require('IkonDAOGovernor');
const IkonDAOTimelockController = artifacts.require('IkonDAOTimelockController');

module.exports = function (deployer, networks, accounts) {
    let owner = accounts[0]; 
    let other = accounts[1];
    let dao, daoProxy, daoGovToken, daoToken, daoGovernor, daoTimelock; 

    await deployer.deploy(DAO, {from: owner});
        await deployer.deploy(IkonDAOGovernanceToken, {from: owner});
        await deployer.deploy(IkonDAOToken, {from: owner}); 
        await deployer.deploy(IkonDAOGovernor, {from: owner}); 
        
        // instances 
        dao = await DAO.deployed(); 
        daoGovToken = await IkonDAOGovernanceToken.deployed();
        daoToken = await IkonDAOToken.deployed();
        daoGovernor = await IkonDAOGovernor.deployed();
        
        await deployer.deploy(
            IkonDAOTimelockController, 
            [daoGovernor.delay(), 
            [daoGovernor.address, owner], 
            [daoGovernor.address, owner]], 
            {from: owner}
        );
        
        daoTimelock = await IkonDAOTimelockController.deployed();
        daoProxy = await deployProxy(DAO, [daoGovToken.address, daoGovernor.address, daoTimelock.address, daoToken.address], {kind: 'uups', unsafeAllow: 'constructor'});
};
