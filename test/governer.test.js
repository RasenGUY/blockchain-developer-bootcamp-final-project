// load dependencies 
const { deployProxy, upgradeProxy } = require('@openzeppelin/truffle-upgrades');
const { assert } = require('chai');
// const Contract = require('web3-eth-contract');
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const expect = chai.expect;
const Web3 = require('web3');
chai.use(chaiAsPromised);

const DAO = artifacts.require('IkonDAO');
const IkonDAOGovernanceToken = artifacts.require('IkonDAOGovernanceToken');
const IkonDAOToken = artifacts.require('IkonDAOToken');
const IkonDAOGovernor = artifacts.require('IkonDAOGovernor');
const IkonDAOTimelockController = artifacts.require('IkonDAOTimelockController');


contract("IDAOCollective (proxy)", accounts => {
    let owner = accounts[0]; 
    let other = accounts[1];
    let dao, daoProxy, daoGovToken, daoToken, daoGovInstance, daoGovernor, daoTimelock; 

    beforeEach(async () => {        
        // get instances
        dao = await DAO.deployed(); 
        daoGovToken = await IkonDAOGovernanceToken.deployed();
        daoToken = await IkonDAOToken.deployed();

        // get instance of daoTimelock
        daoTimelock = await IkonDAOTimelockController.deployed();        
        daoGovInstance = await IkonDAOGovernor.deployed();
        daoGovernor = new web3.eth.Contract(daoGovInstance.abi, daoGovInstance.address); 
        
        // deploy proxy 
        daoProxy = await deployProxy(DAO, [daoGovToken.address, daoGovInstance.address, daoTimelock.address, daoToken.address], {initializer: '__IkonDAO_init', kind: 'uups', unsafeAllow: ['constructor', 'delegatecall']});
    })

    // upgradeabillity tests
    it("set the correct owner", async () => {
        let daoOwner = await daoProxy.owner()
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

    it("can handle upgrades and ownership by owner", async () => {
        await expect(daoProxy.transferOwnership(accounts[2], {from: other})).to.be.rejected   
    });


    /// governor tests 
    it("gets governor version", async ()=> {
        let version = await daoProxy.getGovernorVersion();
        assert.equal(version, "1.0.0", "governor version not correct");
    })

    it("creates proposals and proposal has pending state", async ()=> {

        await daoProxy.setVotingPeriod([daoGovInstance.address], [0], [daoGovernor.methods.setVotingPeriod(5).encodeABI()]);
        let proposalId = await daoProxy.getLatestProposal(owner);
        
        assert.isAbove(Number(proposalId.toString()), 0, "proposal not created");
        let proposalState = await daoGovernor.methods.state(proposalId).call({from:owner});
        assert.equal(proposalState, 0, "proposal does not have pending state"); 

    })

    // accesscontrol
    // proposals
    
})