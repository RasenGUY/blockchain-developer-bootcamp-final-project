// load dependencies 
const { deployProxy, upgradeProxy } = require('@openzeppelin/truffle-upgrades');
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const expect = chai.expect;
chai.use(chaiAsPromised);

// const DAO = artifacts.require('IkonDAO');
// const IkonDAOGovernanceToken = artifacts.require('IkonDAOGovernanceToken');
// const IkonDAOToken = artifacts.require('IkonDAOToken');
// const IkonDAOGovernor = artifacts.require('IkonDAOGovernor');
// const IkonDAOTimelockController = artifacts.require('IkonDAOTimelockController');


Contract("IDAOCollective (proxy)", accounts => {
    let owner = accounts[0]; 
    let other = accounts[1];
    let dao, daoProxy, daoGovToken, daoToken, daoGovernor, daoTimelock; 

    beforeEach(async () => {
        await deployer.deploy(DAO, {from: owner});
        // await deployer.deploy(IkonDAOGovernanceToken, {from: owner});
        // await deployer.deploy(IkonDAOToken, {from: owner}); 
        // await deployer.deploy(IkonDAOGovernor, {from: owner}); 
        
        // instances 
        // dao = await DAO.deployed(); 
        // daoGovToken = await IkonDAOGovernanceToken.deployed();
        // daoToken = await IkonDAOToken.deployed();
        // daoGovernor = await IkonDAOGovernor.deployed();
        
        // await deployer.deploy(
        //     IkonDAOTimelockController, 
        //     [daoGovernor.delay(), 
        //     [daoGovernor.address, owner], 
        //     [daoGovernor.address, owner]], 
        //     {from: owner}
        // );
        
        // daoTimelock = await IkonDAOTimelockController.deployed();
        // daoProxy = await deployProxy(DAO, [daoGovToken.address, daoGovernor.address, daoTimelock.address, daoToken.address], {kind: 'uups', unsafeAllow: 'constructor'});
    })

    // upgradeabillity tests
    it("set the correct owner", async () => {
        let daoOwner = await daoProxy.owner(); 
        assert.equal(daoOwner, owner, "owner is not the deployer contract");
    })

    it("transferOwnerShip", async () => {
        await daoProxy.transferOwnership(other); 
        let newOwner = await daoProxy.owner(); 
        assert.equal(newOwner, other, "ownership not sucessfully transferred");
    })

    it("renounces ownership", async () => {
        await daoProxy.renounceOwnership(); 
        const zeroAddress = "0x0000000000000000000000000000000000000000";
        assert.equal(await daoProxy.owner(), zeroAddress , "does not renounce ownership successfully");
    });

    it("only owner can handle upgrades and ownership", async () => {
        await expect(daoProxy.transferOwnership(accounts[2], {from: other})).to.be.rejected   
    });


    /// governor tests

    
})