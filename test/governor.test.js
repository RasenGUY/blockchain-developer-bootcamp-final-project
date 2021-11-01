// load dependencies 
const { deployProxy, upgradeProxy } = require('@openzeppelin/truffle-upgrades');
const { assert } = require('chai');
// const Contract = require('web3-eth-contract');
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const expect = chai.expect;
chai.use(chaiAsPromised);
const { toUnit, unitToBN, toBN, toNumber } = require("./bnHelpers");
const { increaseTime } = require("./mineBlocks");
const IkonDAOGovernanceToken = artifacts.require('IkonDAOGovernanceToken');
const IkonDAOGovernor = artifacts.require('IkonDAOGovernor');
const IkonDAOTimelockController = artifacts.require('IkonDAOTimelockController');
const IkonDAOToken = artifacts.require('IkonDAOToken');
const Contract = web3.eth.Contract;
const toSha3 = web3.utils.soliditySha3;

contract("IkonDAO (governor)", async accounts => {
    let owner = accounts[0]; 
    let other = accounts[1];
    let [ ,  , alice, bob, carl, david, ed] = accounts;
    var instances = Promise.all([
        IkonDAOGovernanceToken.deployed(),
        IkonDAOToken.deployed(),
        IkonDAOTimelockController.deployed(),        
        IkonDAOGovernor.deployed()
    ]); 

    const proposalState = {
        Pending: 0,
        Active: 1, 
        Canceled: 2,
        Defeated: 3,
        Succeeded: 4,
        Queued: 5,
        Expired: 6,
        Executed: 7
    }
    let support = {
        Against: 0,
        For: 1,
        Abstain: 2
    }
    
    var governor, token, govToken, timelocker; 
    describe("testing initialization of governor contract", () => {

        beforeEach(async () => {
            [govToken, token, timelocker, governor] = await instances;
        })
        it("sets correct name", async()=> {
            let governorName = await governor.name();
            assert.equal(governorName.toString(), "IkonDaoGovernor", "governor name does not match");
        });
        it("sets correct version", async() => {
            let governorVersion = await governor.version();
            assert.equal(governorVersion.toString(), "1.0.0", "governor version doesn't match");
        });
    
        it("sets correct votingDelay", async () => {
            let votingDelay = await governor.votingDelay();
            assert.equal(votingDelay, 5, "governor version doesn't match");
        });
    
        it("sets correct votingPeriod", async () => {
            let votingPeriod = await governor.votingPeriod();
            assert.equal(votingPeriod, 10, "governor votingPeriod does not match");
        });

        // proposals, voting counting
        it("sets voting Period and voting delay", async() => {
            await governor.setVotingPeriod(50, {from: owner});
            let votingPeriod = await governor.votingPeriod(); 
            assert.equal(votingPeriod, 50, "voting period set incorrectly");
    
            await governor.setVotingDelay(55, {from: owner});
            let votingDelay = await governor.votingDelay();
            assert.equal(votingDelay, 55, "voting delay set incorrectly");
        });
    })

    describe("proposal creation, voting and execution", () => {
        let targets, calldatas, values;
        beforeEach( async() => {
            [govToken, token, timelocker, governor] = await instances;
            await governor.setVotingDelay(1);
            

            tokenInst = new Contract(token.abi, token.address); 
            govTokenInst = new Contract(govToken.abi, govToken.address);
    
            targets = [ 
                token.address, 
                govToken.address, 
            ];
            values = [
                0,
                0
            ]
            calldatas = [
                govTokenInst.methods.rewardVotes(alice).encodeABI(),
                tokenInst.methods.rewardTokens(bob).encodeABI()
            ];
        });

        
        it("creates and submits proposals", async() => {
            let description = "proposal creates and submits proposals";
            let testAgainst = await governor.hashProposal(targets, values, calldatas, toSha3(description));
            let proposalId = await governor.propose(targets, values, calldatas, description, {from: owner});
            let result = proposalId.logs[0].args['0'].toString();
            
            assert.equal(result, testAgainst.toString(), "something went wrong with creating proposals check hashIds");
            let state = await governor.state(proposalId.logs[0].args['0']);
            assert.equal(state, proposalState.Pending, "proposal does not have the correct state");
            
        });
        
        it("can only vote on active votes", async () => {
            let description = "can only vote on active votes";
            let proposalId = await governor.propose(targets, values, calldatas, description, {from: owner});
            await expect(governor.castVote(proposalId.logs[0].args['0'], support.For, {from: alice})).to.be.rejected;
        })

        it("changes state after delay is passed", async () => {
            let description = "changes state after delay is passed"; 
            let proposalId = await governor.propose(targets, values, calldatas, description, {from: owner});
            
            await increaseTime(web3, 30); /// jump a few blocks to the front 
            let state = await governor.state(proposalId.logs[0].args['0']);
            assert.isFalse(toNumber(state) === proposalState.Pending)

        })

        it("cast's votes", async() => {
            // address indexed voter, uint256 proposalId, uint8 support, uint256 weight, string reason
            let description = "changes state after delay is passed";
            let proposalId = await governor.hashProposal(targets, values, calldatas, toSha3(description));
            
            // wait for delay to finish (currently at 1 block);
            let res = await governor.castVote(proposalId, support.For, {from: alice}) // alice casts a vote
            let voter = res.logs[0].args['voter'].toString(); 
            let votedOn = res.logs[0].args['proposalId'].toString();
            let sup = res.logs[0].args['support'].toString();
            let weight = res.logs[0].args['weight']
            let aliceVoteWeight = await govToken.getVotes(alice);
            
            assert.equal(voter, alice, "name of voter is not correct"); 
            assert.equal(votedOn.toString(), proposalId.toString(), "vote casted on the wrong proposalId");
            assert.equal(toNumber(sup), support.For, "casted support does not match");
            assert.equal(toUnit(weight), toUnit(aliceVoteWeight),  "voters casted weight does not match actual weight"); 
        });
        
    }) 




    it("avoid vote clashes", async() => {});
    it("respects set quorum", async () => {});    
    it("excutes proposals", async() => {});
});

