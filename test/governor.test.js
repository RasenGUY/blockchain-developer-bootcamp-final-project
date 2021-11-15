// load dependencies 
const { deployProxy, upgradeProxy } = require('@openzeppelin/truffle-upgrades');
const { assert } = require('chai');
// const Contract = require('web3-eth-contract');
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const expect = chai.expect;
chai.use(chaiAsPromised);
const BN = require("big.js");
const { toUnit, unitToBN, toBN, toNumber, fakeMine } = require("./helpers");
const IkonDAOGovernanceToken = artifacts.require('IkonDAOGovernanceToken');
const IkonDAOGovernor = artifacts.require('IkonDAOGovernor');
const IkonDAOTimelockController = artifacts.require('Timelock');
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
            await governor.setVotingPeriod(4);

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
                tokenInst.methods.rewardTokens(bob).encodeABI(),
                govTokenInst.methods.rewardVotes(alice).encodeABI()
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

        it("changes state of proposal after delay is passed", async () => {
            await governor.setVotingDelay(10, {from: owner}); 
            let description = "changes state after delay is passed"; 
            let proposalId = await governor.hashProposal(targets, values, calldatas, toSha3(description));
            
            let actions = [
                {
                    height: 0, callback: async () => governor.propose(targets, values, calldatas, description, {from: owner})
                },  
                {
                    height: 50, callback: async () => governor.state(proposalId)
                } 
            ]

            let results = await fakeMine (
                async () => token.rewardTokens(accounts[8]),
                actions,
                100                       
            )
            let state = results[1];

            assert.isFalse(toNumber(state) === proposalState.Pending)
        });

        it("cast's votes", async() => {
            governor.setVotingDelay(10);
            governor.setVotingPeriod(25);

            // address indexed voter, uint256 proposalId, uint8 support, uint256 weight, string reason
            let description = "cast's votes";
            let proposalId = await governor.hashProposal(targets, values, calldatas, toSha3(description));
            
            let actions = [
                {
                    height: 0, callback: async () => governor.propose(targets, values, calldatas, description, {from: owner})
                },  
                {
                    height: 12, callback: async () => governor.castVote(proposalId, support.For, {from: alice}) 
                },
                {
                    height: 27, callback: async () => governor.state(proposalId)
                } 
            ]

            let res = await fakeMine(
                async() => token.rewardTokens(accounts[8]),
                actions,
                30
            )
            
            let [voter, votedOn, sup, weight] = [
                res[1].logs[0].args['voter'].toString(),
                res[1].logs[0].args['proposalId'].toString(), 
                res[1].logs[0].args['support'].toString(), 
                res[1].logs[0].args['weight']
            ]

            let aliceVoteWeight = await govToken.getVotes(alice);
            
            assert.equal(voter, alice, "name of voter is not correct"); 
            assert.equal(votedOn.toString(), proposalId.toString(), "vote casted on the wrong proposalId");
            assert.equal(toNumber(sup), support.For, "casted support does not match");
            assert.equal(toUnit(weight), toUnit(aliceVoteWeight),  "voters casted weight does not match actual weight"); 
        });

        it("executes vote after voting period ends and updates state of", async () => {
            await governor.setVotingDelay(10);
            await governor.setVotingPeriod(25);

            let description = "respects set quorum";
            let proposalId = await governor.hashProposal(targets, values, calldatas, toSha3(description), {from: owner});
            await timelocker.grantRole(toSha3("PROPOSER_ROLE"), governor.address, {from: owner});
            await timelocker.grantRole(toSha3("EXECUTOR_ROLE"), governor.address, {from: owner});
            await timelocker.grantRole(toSha3("EXECUTOR_ROLE"), owner, {from: owner});
            await token.transfer(timelocker.address, unitToBN(500), {from: owner});
            await token.grantRole(toSha3("IKONDAO_ADMIN_ROLE"), timelocker.address, {from: owner});
            await govToken.grantRole(toSha3("IKONDAO_ADMIN_ROLE"), timelocker.address, {from: owner});


            let actions = [
                {
                    // 0
                    height: 0, 
                    callback: async () => governor.propose(targets, values, calldatas, description, {from: owner})
                },  
                {
                    // 1
                    height: 11, 
                    callback: async () => governor.castVote(proposalId, support.For, {from: alice}) 
                },
                {
                    // 2
                    height: 12, 
                    callback: async () => governor.castVote(proposalId, support.For, {from: bob}) 
                },
                {
                    // 3
                    height: 15, 
                    callback: async () => governor.castVote(proposalId, support.For, {from: carl}) 
                },
                {
                    // 4
                    height: 24, 
                    callback: async () => governor.castVote(proposalId, support.Abstain, {from: david}) 
                },
                {
                    // 5
                    height: 37, 
                    callback: async () => governor.state(proposalId)
                }, 
                {
                    // 6
                    height: 38, 
                    callback: async () => governor.queue(targets, values, calldatas, toSha3(description), {from: owner})
                },
                {
                    // 7
                    height: 45, 
                    callback: async () => governor.state(proposalId)
                },
                
                {
                    //  8
                    height: 46, 
                    callback: async () => govToken.balanceOf(alice) 
                },
                {
                    //  9
                    height: 47, 
                    callback: async () => token.balanceOf(bob) 
                },
                {
                    // 10
                    height: 55, 
                    callback: async () => governor.execute(targets, values, calldatas, toSha3(description)) 
                },
                {
                    // 11
                    height: 57, 
                    callback: async () => governor.state(proposalId)
                },
                {
                    // 12
                    height: 60, 
                    callback: async () => govToken.balanceOf(alice) 
                },
                {
                    // 13
                    height: 63, 
                    callback: async () => token.balanceOf(bob) 
                },
            ]

            let results = await fakeMine(
                async() => token.rewardTokens(accounts[9]),
                actions,
                65
                // {
                //     log: true,
                //     actionNumber: [
                //         {h: 46, wrapper: result => console.log(toUnit(result))}, 
                //         {h: 47, wrapper: result => console.log(toUnit(result))},
                //         {h: 60, wrapper: result => console.log(toUnit(result))},
                //         {h: 63, wrapper: result => console.log(toUnit(result))},
                //     ]
                // }
            );
            assert.equal(toNumber(results[5]), proposalState.Succeeded, "proposal not executed");
            assert.equal(toNumber(results[7]), proposalState.Queued, "proposal not queued");
            assert.equal(toNumber(results[11]), proposalState.Executed, "quorum not reached");


            let aliceVotePowerBefore = toUnit(results[8]);
            let bobTokenBalanceBefore = toUnit(results[9]); 
            let aliceVotePowerAfter = toUnit(results[12]);
            let bobTokenBalanceAfter = toUnit(results[13]);

            assert.equal(aliceVotePowerAfter, aliceVotePowerBefore + 96 , "propoals calldatas not executed user is not rewarded votingPower");
            assert.equal(bobTokenBalanceAfter, bobTokenBalanceBefore + 5, "propoals calldatas bob user is not rewarded tokens");
        });
        
    }) 

});

