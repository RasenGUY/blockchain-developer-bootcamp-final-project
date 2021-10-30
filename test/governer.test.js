// load dependencies 
const { deployProxy, upgradeProxy } = require('@openzeppelin/truffle-upgrades');
const { assert } = require('chai');
// const Contract = require('web3-eth-contract');
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const expect = chai.expect;
chai.use(chaiAsPromised);

const BN = require("big.js");
const { resToNumber: toNumber } = require("./bnHelpers");
const DAO = artifacts.require('IkonDAO');
const IkonDAOGovernanceToken = artifacts.require('IkonDAOGovernanceToken');
const IkonDAOToken = artifacts.require('IkonDAOToken');
const IkonDAOGovernor = artifacts.require('IkonDAOGovernor');
const IkonDAOTimelockController = artifacts.require('IkonDAOTimelockController');



contract("IDAOCollective (proxy)", accounts => {
    let owner = accounts[0]; 
    let other = accounts[1];
    let [ ,  , alice, bob, carl, david] = accounts;
    let dao, daoProxy, daoGovToken, daoToken, daoGovInstance, daoGovernor, daoTimelock; 
    let memberRole = web3.utils.soliditySha3("IKONDAO_MEMBER_ROLE");
    let adminRole = web3.utils.soliditySha3("IKONDAO_ADMIN_ROLE");
    let bannedRole = web3.utils.soliditySha3("IKONDAO_BANNED_ROLE");
    let weightLimit, balances;

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

        balances = Promise.all([
            await daoGovToken.balanceOf(alice),
            await daoGovToken.balanceOf(bob),
            await daoGovToken.balanceOf(carl),
            await daoGovToken.balanceOf(david)
        ]).then(values => balances = values.map(value => toNumber(value)));
        await balances; 
    })

    // // upgradeabillity tests
    // it("set the correct owner", async () => {
    //     let daoOwner = await daoProxy.owner()
    //     assert.equal(daoOwner, owner, "owner is not the deployer contract");
    // })

    // it("transferOwnerShip", async () => {
    //     await daoProxy.transferOwnership(other); 
    //     let newOwner = await daoProxy.owner(); 
    //     assert.equal(newOwner, other, "ownership not sucessfully transferred");
    // })

    // it("renounces ownership", async () => {
    //     await daoProxy.renounceOwnership(); 
    //     const zeroAddress = "0x0000000000000000000000000000000000000000";
    //     assert.equal(await daoProxy.owner(), zeroAddress , "does not renounce ownership successfully");
    // });

    // it("can handle upgrades and ownership by owner", async () => {
    //     await expect(daoProxy.transferOwnership(accounts[2], {from: other})).to.be.rejected   
    // });


    // /// governor
    // it("gets governor version", async ()=> {
    //     let version = await daoProxy.getGovernorVersion();
    //     assert.equal(version, "1.0.0", "governor version not correct");
    // })


    // it("creates members", async ()=> {
    
    //     // create members
    //     await daoProxy.createMember(alice, {from: owner});
    //     let isAliceMember = await daoProxy.hasRole(String(memberRole), alice);
    //     assert.equal(isAliceMember, true, "member not created");
       
    //     // only nonmembers banned members cannot members
    //     it("allows only non members and non banned members to be created", async ()=>{
    //         await expect(implProxy.createMember(alice, {from: owner})).to.be.rejected
    //         await daoProxy.grantRole(String(bannedRole), bob);
    //         await expect(implProxy.createMember(bob, {from: owner})).to.be.rejected
    //     })
        
        
    // });

    // it("allows for proposal creation", async ()=> {

    //     await daoProxy.setVotingPeriod([daoGovInstance.address], [0], [daoGovernor.methods.setVotingPeriod(5).encodeABI()]);
    //     let proposalId = await daoProxy.getLatestProposal(owner);
    //     assert.isAbove(Number(proposalId.toString()), 0, "proposal not created");
    //     let proposalState = await daoGovernor.methods.state(proposalId).call({from:owner});
    //     assert.equal(proposalState, 0, "proposal does not have pending state");
        
    // });

    // /// governance token 
    // it("initiates correctly", async() => {
        
    //     /// correct balance distribution
    //     assert.equal(balances.every(balance => balance == 100) , true, "some balances are not initialized correctly"); 

    //     // correct weightLimitFraction
    //     weightLimit = await daoGovToken.getWeightLimit();
    //     let testAgainst = balances.reduce((pr, curr) => curr + pr) * 0.49;
    //     assert.equal(toNumber(weightLimit), testAgainst, "weightLimit not initiated correctly");

        
    //     it("does not transfer after it is initiated", async() =>{
    //         // token pauased after initial distribution of votes        
    //         await expect(daoGovToken.transfer(bob, new BN("50e18"), {from: alice})).to.be.rejected;
    //     })

    // });


    it("respects vote weight limit", async() => {

        // user with more voting power than is allowed will not be rewarded votes
        await daoGovToken.unpause({from: owner}); 
        await daoGovToken.transfer(bob, web3.utils.toBN(new BN("100e18")), {from: alice}); 
        await daoGovToken.pause({from: owner}); 

        await daoGovToken.rewardVotes(bob); 
        let bobVotes = await daoGovToken.getVotes(bob); 
        
        assert.equal(toNumber(bobVotes), 200, "governor still rewards even when weight limit is reached"); // bobs votes will not change since he already reached the limit
        
        await daoGovToken.rewardVotes(carl);
        let carlVotes = await daoGovToken.getVotes(carl);
        weightLimit = await daoGovToken.getWeightLimit();
        assert.equal(toNumber(carlVotes), weightLimit, "something went wrong");
        
    });

    // it("disallows users to transfer votes to eachother", async() => {

    // })


    // let proposal;
    // /// proposal execution handled by daoTimeLock
    // before(async () => {
    //     /// transfer some erc20votes tokens to users 
    //     /// let a user create a proposal
    //     /// proposal id 
    // })

    // it("allows users to vote on proposals", async ()=> {

    // })

    // accesscontrol
    // proposals
    
})