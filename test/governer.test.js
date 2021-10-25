// load dependencies 
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const expect = chai.expect;
chai.use(chaiAsPromised);

const DAO = artifacts.require('IkonDAO');
const govToken = artifacts.require('IkonDAOGovernance');
const utilityToken = artifacts.require('IkonDAOToken');


Contract("IDAOCollective (proxy)", accounts => {
    let owner = accounts[0]; 
    let other = accounts[1];
    let dao, daoProxy; 

    beforeEach(async () => {
        daoProxy = await deployProxy(DAO, [], {kind: 'uups', unsafeAllow: 'constructore'}); 
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
    
})