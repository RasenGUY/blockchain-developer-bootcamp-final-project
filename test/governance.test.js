const { assert } = require('chai');
// const Contract = require('web3-eth-contract');
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const expect = chai.expect;
chai.use(chaiAsPromised);

const BN = require("big.js");
const { resToNumber: toNumber, numToBN: toBN } = require("./bnHelpers");
const IkonDAOGovToken = artifacts.require('IkonDAOGovernanceToken');


contract("IDAOCollective (governance Token)", accounts => {    
    let owner = accounts[0]; 
    let other = accounts[1];
    let [ ,  , alice, bob, carl, david] = accounts;
    let daoGovToken;
    let weightLimit, balances;

    beforeEach(async () => {
        daoGovToken = await IkonDAOGovToken.deployed();
    });

    /// governance token 
    it("initiates correctly", async() => {

        balances = Promise.all([
            await daoGovToken.balanceOf(alice),
            await daoGovToken.balanceOf(bob),
            await daoGovToken.balanceOf(carl),
            await daoGovToken.balanceOf(david)
        ]).then(values => balances = values.map(value => toNumber(value)));
        await balances; 
        
        
        /// correct balance distribution
        assert.equal(balances.every(balance => balance == 100) , true, "some balances are not initialized correctly"); 
        
        // correct weightLimitFraction
        weightLimit = await daoGovToken.getWeightLimit();
        let testAgainst = balances.reduce((pr, curr) => curr + pr) * 0.49;
        assert.equal(toNumber(weightLimit), testAgainst, "weightLimit not initiated correctly");
        
        // get right baseReward
        let baseRewards = await daoGovToken.getRewardVotes();
        assert.equal(toNumber(baseRewards), 100, "baserewards not initiated correctly");
        
    });
    
    it("users cannot delegate votes or transfer votes", async() => {
        await expect(daoGovToken.transfer(bob, toBN(50), {from: alice})).to.be.rejected;
        await expect(daoGovToken.delegate(bob, toBN(50), {from: alice})).to.be.rejected;
    })

    it("slashes uservotes",  async() => {
        let carlVotesOld = await daoGovToken.getVotes(carl);
        await daoGovToken.slashVotes(carl, toBN(50));
        let carlVotes = await daoGovToken.getVotes(carl); 
        assert.equal(toNumber(carlVotes), toNumber(carlVotesOld) - 50, "user still has votes");        
    });

    it("sets new baseRewards", async () => {
        // sets right base Reward
        await daoGovToken.setRewardVotes(toBN(150));
        let newBase = await daoGovToken.getRewardVotes();
        assert.equal(toNumber(newBase), 150, "baserewards not being updated correctly");
    })
    
    
    it("respects vote weight limit", async() => {
        
        // user with more voting power than is allowed will not be rewarded votes
        await daoGovToken.unpause({from: owner}); 
        await daoGovToken.transfer(bob, toBN(100), {from: alice}); 
        await daoGovToken.pause({from: owner}); 
        
        await daoGovToken.rewardVotes(bob); 
        let bobVotes = await daoGovToken.getVotes(bob); 
        assert.equal(toNumber(bobVotes), 200, "governor still rewards even when weight limit is reached"); // bobs votes will not change since he already reached the limit
        
        let oldLimit = await daoGovToken.getWeightLimit(); 
        await daoGovToken.rewardVotes(carl); // carls balance is already 100 so he should not receive any more votes
        let carlVotes = await daoGovToken.getVotes(carl);
        let newLimit = await daoGovToken.getWeightLimit(); 
        assert.equal(toNumber(carlVotes), toNumber(oldLimit), "user's new votingpower after reward is not equal old limit");        
        assert.isBelow(toNumber(carlVotes), toNumber(newLimit), "user's new votingpower after reward does not below newLimit");
    });
    
    
    it("users cannot delegate votes or transfer votes", async() => {
        await expect(daoGovToken.transfer(bob, toBN(50), {from: alice})).to.be.rejected;
        await expect(daoGovToken.delegate(bob, toBN(50), {from: alice})).to.be.rejected;
    })
    
    it("slashes uservotes",  async() => {
        let carlVotesOld = await daoGovToken.getVotes(carl);
        await daoGovToken.slashVotes(carl, toBN(50));
        let carlVotes = await daoGovToken.getVotes(carl); 
        assert.equal(toNumber(carlVotes), toNumber(carlVotesOld) - 50, "user still has votes");        
    })
})