// load dependencies 
const { deployProxy, upgradeProxy , upgrades} = require('@openzeppelin/truffle-upgrades');
const { assert } = require('chai');
// const Contract = require('web3-eth-contract');
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const { time } = require('console');
const expect = chai.expect;
chai.use(chaiAsPromised);
const { toUnit, unitToBN, toBN, extractEventSignatures, generateMappingsFromSignatures, subscribeToLogs, fakeMine} = require("./helpers");

const IkonDAO = artifacts.require('IkonDAO');
const IkonDAOGovernanceToken = artifacts.require('IkonDAOGovernanceToken');
const IkonDAOGovernor = artifacts.require('IkonDAOGovernor');
const Timelock = artifacts.require('Timelock');
const IkonDAOToken = artifacts.require('IkonDAOToken');
const IkonDAOVectorCollectible = artifacts.require("IkonDAOVectorCollectible");

web3.setProvider('ws://localhost:8545');
const utils = web3.utils;
const toSha3 = web3.utils.soliditySha3;

contract("IkonDAO (proxy)", accounts => {

    // general 
    let [owner, other , alice, bob, carl, david, ed, fred, gerald, hilda] = accounts;

    let [MEMBER_ROLE, ADMIN_ROLE, BANNED_ROLE, PAUSER_ROLE, MINTER_ROLE, TIMELOCK_ADMIN_ROLE, PROPOSER_ROLE, EXECUTOR_ROLE] = [
        toSha3("IKONDAO_MEMBER_ROLE"),
        toSha3("IKONDAO_ADMIN_ROLE"),
        toSha3("IKONDAO_BANNED_ROLE"),
        toSha3("IKONDAO_PAUSER_ROLE"),
        toSha3("IKONDAO_MINTER_ROLE"),
        toSha3("TIMELOCK_ADMIN_ROLE"),
        toSha3("PROPOSER_ROLE"),
        toSha3("EXECUTOR_ROLE")
    ]

    // inputs 
    // gov token 
    let weigthLimitFraction = toBN(49); 
    let initialVotes = unitToBN(100);
    let baseRewardVotes = unitToBN(100); 

    // utility token
    let baseRewardUtility = unitToBN(5);

    // governor
    let votingDelay = 3;
    let votingPeriod = 10;
    
    // timelocker 
    let timelockDelay = 2;
    let proposers = [owner]
    let executors = [owner]
    
    // govToken
    let initialUsers = [alice, bob, carl, david, ed, fred, gerald, hilda];

    // artifacts
    let dao, daoProxy, govToken, token, governor, timelocker, nft;

    // contract instance -> for getting abi methods
    let governorInst, govTokenInst, tokenInst, timelockerInst, daoProxyInst;

    // for storing proposal methods
    let Proposal;

    // voting
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

    /// events
    let govEventSigMap, tokenEventSigMap, govTokenEventSigMap, timelockerEventSigMap, daoEventSigMap, nftEventSigMap;
    
    beforeEach( async () => {
        
        // initiate new contracts before each describe 
        dao = await IkonDAO.new();
        govToken = await IkonDAOGovernanceToken.new(weigthLimitFraction, initialUsers, initialVotes, baseRewardVotes, {from: owner});
        token = await IkonDAOToken.new(baseRewardUtility, {from: owner});
        timelocker = await Timelock.new(timelockDelay, proposers, executors);
        governor = await IkonDAOGovernor.new(govToken.address, timelocker.address, votingDelay, votingPeriod, {from: owner});
        daoProxy = await deployProxy(IkonDAO, [governor.address, timelocker.address, token.address], {initializer: '__IkonDAO_init', kind: 'uups', unsafeAllow: ['constructor', 'delegatecall']});
        nft = await IkonDAOVectorCollectible.new(daoProxy.address);

        /// contract instance 
        governorInst = new web3.eth.Contract(governor.abi, governor.address); 
        govTokenInst = new web3.eth.Contract(govToken.abi, govToken.address); 
        tokenInst = new web3.eth.Contract(token.abi, token.address); 
        timelockerInst = new web3.eth.Contract(timelocker.abi, timelocker.address);
        nftInst = new web3.eth.Contract(nft.abi, nft.address);
        daoProxyInst = new web3.eth.Contract(daoProxy.abi, daoProxy.address);

        // give proxy admin rights to governor
        await governor.grantRole(ADMIN_ROLE, daoProxy.address, {from: owner});
        await governor.grantRole(ADMIN_ROLE, timelocker.address, {from: owner});
        await governor.grantRole(ADMIN_ROLE, governor.address, {from: owner});

        await token.grantRole(ADMIN_ROLE, timelocker.address, {from: owner});
        await govToken.grantRole(ADMIN_ROLE, timelocker.address, {from: owner});
        await daoProxy.grantRole(ADMIN_ROLE, timelocker.address, {from: owner})
        await timelocker.grantRole(PROPOSER_ROLE, governor.address);
        await timelocker.grantRole(EXECUTOR_ROLE, governor.address);
                  
        
        // proposals object
        Proposal = function Proposal(){
            
            // system proposals
            this.setVotingDelay = (delay, description) => ({ // sets voting delay
                targets: [governor.address],
                values: [0],
                calldatas: [governorInst.methods.setVotingDelay(delay).encodeABI()],
                description: description,
                gasEstimate: governorInst.methods.setVotingDelay(delay).estimateGas({from: owner}, amount => amount)
            })

            this.setVotingPeriod = (period, description) => ({ // sets voting period
                targets: [governor.address],
                values: [0],
                calldatas: [governorInst.methods.setVotingPeriod(period).encodeABI()],
                description: description,
                gasEstimate: governorInst.methods.setVotingPeriod(period).estimateGas({from: owner}, amount => amount)
            })

            this.setGovTokenReward = (newReward, description) => ({ // sets new govtoken rewards
                targets: [govToken.address],
                values: [0],
                calldatas: [govTokenInst.methods.setRewardVotes(unitToBN(newReward)).encodeABI()],
                description: description,
                gasEstimate: govTokenInst.methods.setRewardVotes(unitToBN(newReward)).estimateGas({from: owner}, amount => amount)
            })

            this.setTokenReward = (newReward, description) => ({ // sets new govtoken rewards
                targets: [token.address],
                values: [0],
                calldatas: [tokenInst.methods.setBaseReward(unitToBN(newReward)).encodeABI()],
                description: description,
                gasEstimate: tokenInst.methods.setBaseReward(unitToBN(newReward)).estimateGas({from: owner}, amount => amount)
            })
    
            this.setTimelockDelay = (newDelay, description) => ({ // sets new delay for timelocker
                targets: [timelocker.address],
                values: [0],
                calldatas: [timelockerInst.methods.updateDelay(newDelay).encodeABI()],
                description: description,
                gasEstimate: timelockerInst.methods.updateDelay(newDelay).estimateGas({from: timelocker.address}, amount => amount)
            })

            this.setTimelockAddress = (newTimelock, description) => ({ // changes timelocker address of the governor
                targets: [governor.address],
                values: [0],
                calldatas: [governorInst.methods.updateTimelock(newTimelock).encodeABI()],
                description: description,
                gasEstimate: governorInst.methods.updateTimelock(newTimelock).estimateGas({from: timelocker.address}, amount => amount)
            })

            this.setProxyAddress = (newImplementation, description) => ({
                targets: [daoProxy.address],
                value: [0],
                calldatas: [daoProxyInst.methods.upgradeTo(newImplementation).encodeABI()],
                description: description,
                gasEstimate: daoProxyInst.methods.upgradeTo(newImplementation).estimateGas({from: owner}, amount => amount)
            })
            
            // accountability proposals
            this.banMember = (member, description) => ({
                targets: [daoProxy.address],
                values: [0],
                calldatas: [daoInst.methods.banMember(member).encodeABI()],
                description: description,
                gasEstimate: daoInst.methods.banMember(member).estimateGas({from: owner}, amount => amount)
            })       

            this.slashVotes = (member, amount, description) => ({
                targets: [govToken.address],
                values: [0],
                calldatas: [govTokenInst.methods.slashVotes(member, unitToBN(amount)).encodeABI()],
                description: description,
                gasEstimate: govTokenInst.methods.slashVotes(member, unitToBN(amount)).estimateGas({from: owner}, amount => amount)
            })
    
            // dao proposals
            /// mint nft's
            this.mintNft = (proposer, nftArgs, description) => ({
                targets: [daoProxy.address, nft.address, govToken.address, tokens.address],
                values: [0],
                calldatas: [
                    daoInst.methods.transferTokensToTimelocker().encodeAbi(), // transfer utility tokens for reward
                    nftInst.methods.safeMintVector(
                        utils.utf8ToHex(nftArgs.name), 
                        nftArgs.description,
                        utils.utf8ToHex(nftArgs.externalLink),
                        utils.utf8ToHex(nftArgs.imageHash),
                        utils.utf8ToHex(nftArgs.category),
                        utils.utf8ToHex(nftArgs.handle)
                    ).encodeABI(), /// mint nft's 
                    govTokenInst.methods.rewardVotes(proposer).encodeABI(), /// reward votes to minter
                    token.methods.rewardTokens(proposer).encodeABI() /// reward tokens utility tokens to proposer
                ],
                description: description,
                gasEstimate: 
                daoInst.methods.transferTokensToTimelocker().estimateGas({from: owner}, amount => amount) +
                nftInst.methods.safeMintVector(
                    utils.utf8ToHex(nftArgs.name), 
                    nftArgs.description,
                    utils.utf8ToHex(nftArgs.externalLink),
                    utils.utf8ToHex(nftArgs.imageHash),
                    utils.utf8ToHex(nftArgs.category),
                    utils.utf8ToHex(nftArgs.handle)
                ).estimateGas({from: timelocker.address}, amount => amount) +
                govTokenInst.methods.rewardVotes(proposer).estimateGas({from: owner}, amount => amount) +
                token.methods.rewardTokens(proposer).estimateGas({from: owner}, amount => amount)
            })

            // mint utility tokens
            this.mintTokens = (amount, description) => ({
                targets: [daoProxy.address],
                values: [0],
                calldatas: [daoInst.methods.mintUtilityTokens(unitToBN(amount)).encodeABI()],
                description: description,
                gasEstimate: daoInst.methods.mintUtilityTokens(unitToBN(amount)).estimateGas({from: owner}, amount => amount)
            })
        }

        // events 
        // map names to address and topics of sigs
        govEventSigMap = generateMappingsFromSignatures(extractEventSignatures(governor.abi));
        tokenEventSigMap = generateMappingsFromSignatures(extractEventSignatures(token.abi)); 
        govTokenEventSigMap = generateMappingsFromSignatures(extractEventSignatures(govToken.abi)); 
        timelockerEventSigMap = generateMappingsFromSignatures(extractEventSignatures(timelocker.abi)); 
        daoEventSigMap = generateMappingsFromSignatures(extractEventSignatures(dao.abi));
        nftEventSigMap = generateMappingsFromSignatures(extractEventSignatures(nft.abi));
                 
        
    });    
        
    describe("Initialization", () => {

        // upgradeabillity tests
        it("set the correct admin", async () => {
            let daoAdmin = await daoProxy.hasRole(ADMIN_ROLE, owner);
            assert.isTrue(daoAdmin === true, "owner is not the deployer contract");
        });

        it("makes designated contracts admins", async () => {
            await daoProxy.grantRole(ADMIN_ROLE, other, {from: owner});
            let newAdmin = await daoProxy.hasRole(ADMIN_ROLE, other);
            assert.isTrue(newAdmin === true, "does not set admins correctly");
        });

        it("allows only admins to upgrade", async () => {
            let newImplementation = await IkonDAO.new();
            await expect(daoProxy.upgradeTo(newImplementation.address, {from: other})).to.be.rejected;
        });

        it("upgrades contract correctly and maintains state", async () => {
            await daoProxy.createMember({from: fred});
            let newImplementation = await IkonDAO.new();
            await daoProxy.upgradeTo(newImplementation.address);
            let newProxy = new web3.eth.Contract(newImplementation.abi, daoProxy.address);
            assert.isTrue(await newProxy.methods.hasRole(MEMBER_ROLE, fred).call(), "does not upgrade sucessfully");
        });

    })


    describe("Member functionalities", () => {

        it("creates members", async ()=> {
            // create members
            await daoProxy.createMember({from: alice});            
            let isAliceMember = await daoProxy.hasRole(MEMBER_ROLE, alice);
            assert.equal(isAliceMember, true, "member not created"); 
        });

        // only nonmembers banned members cannot members
        it("allows only non members and non banned members to be created", async ()=>{
            await daoProxy.createMember({from: alice})
            await expect(daoProxy.createMember({from: alice})).to.be.rejected
            await daoProxy.banMember(alice, {from: owner});
            await expect(daoProxy.createMember({from: alice})).to.be.rejected
        });

        it("bans members", async () => {
            await daoProxy.createMember({from: david});
            await daoProxy.banMember(david, {from: owner});
            assert.isTrue(await daoProxy.hasRole(BANNED_ROLE, david), "member does not have banned role");
        });
    });


    describe("Proposals", () => {
        /// proposal description
        it("dissalows non members and banned members from creating proposals", async () => {
            // let proposals = new Proposals();
            let description = "update voting period";
            let updateVP = new Proposal().setVotingPeriod(5, description);
            await expect(daoProxy.propose(updateVP.targets, updateVP.values, updateVP.calldatas, description, {from: carl})).to.be.rejected;
        })

        let description, proposal, proposalId;
        before(async () => {

            /// members 
            description = "allows for proposal creation";
            proposal = new Proposal().setVotingPeriod(5, description);
            proposalId = await governor.hashProposal(proposal.targets, proposal.values, proposal.calldatas, toSha3(proposal.description));

        })
        it("allows for proposal creation", async () => {
            await daoProxy.createMember({from: alice});
            await daoProxy.propose(proposal.targets, proposal.values, proposal.calldatas, proposal.description, {from: alice});
            let state = await governor.state(proposalId);
            assert.equal(state, proposalState.Pending, "proposal not created successfully");
        });

        let onlyMemberCastVotesActions;  
        before( async () => {

            description = "allows only members to cast proposals";
            proposal = new Proposal().setVotingDelay(10, description);
            proposalId = await governor.hashProposal(proposal.targets, proposal.values, proposal.calldatas, toSha3(proposal.description));
        
            onlyMemberCastVotesActions = [
                {
                    height: 0,
                    callback: async () => {
                        try {

                            await daoProxy.createMember({from: alice})
                            await daoProxy.createMember({from: david})
                            await daoProxy.createMember({from: carl})
                            await daoProxy.createMember({from: ed})
                            await daoProxy.createMember({from: bob})

                        } catch(e){

                            return e ? e : "created members sucessfully";
                        }
                    }
                },
                {
                    height: 1,
                    callback: async () => daoProxy.propose(proposal.targets, proposal.values, proposal.calldatas, proposal.description, {from: alice})
                },
                {
                    height: 4,
                    callback: async () => daoProxy.castVote(proposalId, support.For, {from: fred})
                }
            ]
        })
        it("allows only members to cast votes on proposals", async () => {
            let results = await  fakeMine(
                async () => token.rewardTokens(other, {from: owner}),
                onlyMemberCastVotesActions,
                15
            )                                                   
            assert.equal(results[results.length - 1].e.reason, String(`AccessControl: account ${String(fred).toLowerCase()} is missing role ${MEMBER_ROLE}`), "allows non member to cast vote");
        });

        let checkQueuesActions;        
        before(async () => {
            // new descriptions
            description = "queues proposals";
            proposal = new Proposal().setVotingPeriod(10, description);
            proposalId = await governor.hashProposal(proposal.targets, proposal.values, proposal.calldatas, toSha3(proposal.description));

            /// fake mine
            checkQueuesActions = [
                {
                    height: 0,
                    callback: async () => {

                            await daoProxy.createMember({from: alice})
                            await daoProxy.createMember({from: david})
                            await daoProxy.createMember({from: carl})
                            await daoProxy.createMember({from: ed})
                            await daoProxy.createMember({from: bob})

                        }
                },
                {
                    height: 1,
                    callback: async () => daoProxy.propose(proposal.targets, proposal.values, proposal.calldatas, proposal.description, {from: alice})
                },
                {
                    height: Number(votingDelay+1),
                    callback: async () => { 
                        await daoProxy.castVote(proposalId, support.For, {from: alice}) 
                        await daoProxy.castVote(proposalId, support.For, {from: bob}) 
                        await daoProxy.castVote(proposalId, support.For, {from: carl}) 
                        await daoProxy.castVote(proposalId, support.For, {from: david}) 
                        await daoProxy.castVote(proposalId, support.For, {from: ed}) 
                    }
                },
                {
                    height: Number(votingDelay+1+votingPeriod+1+votingDelay),
                    callback: async () => {
                            await daoProxy.queue(proposal.targets, proposal.values, proposal.calldatas, toSha3(proposal.description), {from: alice})
                    }
                },
                {
                    height: 44,
                    callback: async () => governor.state(proposalId) 
                },
            ]
        })

        it("queues proposals", async ()=> {
            
            let results = await fakeMine(
                async () => token.rewardTokens(other, {from: owner}),
                checkQueuesActions,
                45
            )
            let state = results[results.length-1];
            assert.equal(state.toNumber(), proposalState.Queued, "proposal is not queued");
        });

        let onlyMembersExecuteProposalsActions;
        before(async () => {
            description = "allows only members to execute proposals";
            proposal = new Proposal().setVotingPeriod(10, description);
            proposalId = await governor.hashProposal(proposal.targets, proposal.values, proposal.calldatas, toSha3(proposal.description));

            onlyMembersExecuteProposalsActions = [
                {
                    height: 0,
                    callback: async () => {

                            await daoProxy.createMember({from: alice})
                            await daoProxy.createMember({from: david})
                            await daoProxy.createMember({from: carl})
                            await daoProxy.createMember({from: ed})
                            await daoProxy.createMember({from: bob})

                        }
                },
                {
                    height: 1,
                    callback: async () => daoProxy.propose(proposal.targets, proposal.values, proposal.calldatas, proposal.description, {from: alice})
                },
                {
                    height: Number(votingDelay+1),
                    callback: async () => { 
                        await daoProxy.castVote(proposalId, support.For, {from: alice}) 
                        await daoProxy.castVote(proposalId, support.For, {from: bob}) 
                        await daoProxy.castVote(proposalId, support.For, {from: carl}) 
                        await daoProxy.castVote(proposalId, support.For, {from: david}) 
                        await daoProxy.castVote(proposalId, support.For, {from: ed}) 
                    }
                },
                {
                    height: Number(votingDelay+1+votingPeriod+1+votingDelay),
                    callback: async () => {
                            await daoProxy.queue(proposal.targets, proposal.values, proposal.calldatas, toSha3(proposal.description), {from: alice})
                    }
                },
                {
                    height: 44,
                    callback: async () => daoProxy.execute(proposal.targets, proposal.values, proposal.calldatas, toSha3(proposal.description), {from: fred})
                },
            
            ]
        })
        it("allows only members execute proposal", async ()=> {
            let results = await fakeMine(
                async () => token.rewardTokens(other, {from: owner}),
                onlyMembersExecuteProposalsActions,
                45
            )
            assert.equal(results[results.length - 1].e.reason , String(`AccessControl: account ${String(fred).toLowerCase()} is missing role ${MEMBER_ROLE}`))
        });

        let executesProposalsActions;
        before(async () => {
            description = "executes proposals";
            proposal = new Proposal().setVotingPeriod(15, description);
            console.log(proposal)
            proposalId = await governor.hashProposal(proposal.targets, proposal.values, proposal.calldatas, toSha3(proposal.description));
            

            executesProposalsActions = [
                {
                    height: 0,
                    callback: async () => {

                            await daoProxy.createMember({from: alice})
                            await daoProxy.createMember({from: david})
                            await daoProxy.createMember({from: carl})
                            await daoProxy.createMember({from: ed})
                            await daoProxy.createMember({from: bob})

                        }
                },
                {
                    height: 1,
                    callback: async () => daoProxy.propose(proposal.targets, proposal.values, proposal.calldatas, proposal.description, {from: alice})
                },
                {
                    height: Number(votingDelay+1),
                    callback: async () => { 
                        await daoProxy.castVote(proposalId, support.For, {from: alice}) 
                        await daoProxy.castVote(proposalId, support.For, {from: bob}) 
                        await daoProxy.castVote(proposalId, support.For, {from: carl}) 
                        await daoProxy.castVote(proposalId, support.For, {from: david}) 
                        await daoProxy.castVote(proposalId, support.For, {from: ed}) 
                    }
                },
                {
                    height: Number(votingDelay+1+votingPeriod+1+votingDelay),
                    callback: async () => {
                            await daoProxy.queue(proposal.targets, proposal.values, proposal.calldatas, toSha3(proposal.description), {from: alice})
                    }
                },
                {
                    height: 44,
                    callback: async () => {try {
                        daoProxy.execute(proposal.targets, proposal.values, proposal.calldatas, toSha3(proposal.description), {from: carl})} catch(e){console.log(e.data)}
                    }
                },
                {
                    height: 49,
                    callback: async () => governor.votingPeriod()
                }
            ]
        })

        it("executes proposal", async ()=> {
            
            let results = await fakeMine(
                async () => token.rewardTokens(other, {from: owner}),
                executesProposalsActions,
                50,
                {
                    logs: true,
                    actionNumber: [
                        {h: 44, wrapper: result => console.log(result)}
                    ]
                }
            )

            console.log("owner: ", owner)
            console.log("governor: ", governor.address);
            console.log("governorInst: ", governorInst.address);
            console.log("timelock: ", timelocker.address);
            console.log("timelockInst: ", timelockerInst.address);
            console.log("daoProxy: ", daoProxy.address);
            console.log("dao: ", dao.address);
            // console.log("daoInst: ", daoInst.address);
            console.log("token: ", token.address);
            console.log("tokenInst: ", tokenInst.address);
            console.log("govToken: ", govToken.address)
            console.log("govTokenInst: ", govTokenInst.address)

            let newVotingPeriod = results[results.length -1];
            console.log(results)
            assert.equal(newVotingPeriod.toNumber(), 15, "proposal not executed correctly");
        });
    })

    // describe("Execution of core dao functionalities through proposals", ()=> {
    //     let propose = Number(1); 
    //     let startVote = Number(votingDelay + 1);
    //     let endVote = Number(startVote + votingPeriod + 1);
    //     let queue = Number(endVote + votingDelay + 1);
    //     let execute = queue + (endVote - startVote) + 1; 
    //     let test = execute + 5;

    //     console.log("propose: ", propose)
    //     console.log("start: ", startVote)
    //     console.log("end: " ,endVote)
    //     console.log("queue: ", queue)
    //     console.log("execute: ", execute)
    //     console.log("test: ", test)

    //     let createMembers = {
    //         height: 0,
    //         callback: async () => {
    //                 await daoProxy.createMember({from: alice})
    //                 await daoProxy.createMember({from: bob})
    //                 await daoProxy.createMember({from: carl})
    //                 await daoProxy.createMember({from: david})
    //                 await daoProxy.createMember({from: ed})
    //                 await daoProxy.createMember({from: fred})
    //                 await daoProxy.createMember({from: gerald})
    //                 await daoProxy.createMember({from: hilda})
    //             }
    //     }
    //     let withLogs = {
    //         logs: true,
    //         actionNumber: [
    //             {
    //                 h: propose, 
    //                 wrapper: result => console.log(result) 
    //             },
    //             {
    //                 h: startVote, 
    //                 wrapper: result => console.log(result) 
    //             },
    //             {
    //                 h: queue, 
    //                 wrapper: result => console.log(result) 
    //             },
    //             {
    //                 h: execute, 
    //                 wrapper: result => console.log(result) 
    //             },
    //             {
    //                 h: test, 
    //                 wrapper: result => console.log(result) 
    //             }
    //         ]
    //     }

    //     let proposal, proposalId;
    //     describe("System Proposals", () => {
                        
    //         // create all proposals wih their descriptions
    //         let [ 
    //             setVotingPeriodDesc, 
    //             setVotingDelayDesc, 
    //             setTokenRewardDesc, 
    //             setGovTokenRewardDesc, 
    //             setTimelockDelayDesc, 
    //             setTimelockAddressDesc, 
    //             setProxyAddressDesc ] = [
    //             "set voting period", 
    //             "set voting delay",
    //             "set token reward",
    //             "set vote reward",
    //             "set timelock delay",
    //             "set timlock address",
    //             "set proxy address"
    //         ] 

            
    //         let votingPeriodThroughProposalActions;
    //         before(async ()=> {
    //             proposal = proposals.setVotingPeriod(5, setVotingPeriodDesc);
    //             proposalId = await governor.hashProposal(proposal.targets, proposal.values, proposal.calldatas, toSha3(proposal.description)); 

    //             votingPeriodThroughProposalActions = [
    //                 createMembers,
    //                 {
    //                     height: propose,
    //                     callback: async () => {
    //                         daoProxy.propose(proposal.targets, proposal.values, proposal.calldatas, proposal.description, {from: alice})
    //                     }
    //                 },
    //                 {
    //                     height: startVote,
    //                     callback: async () => {
    //                         daoProxy.castVote(proposalId, support.For, {from: alice})
    //                         daoProxy.castVote(proposalId, support.For, {from: bob})
    //                         daoProxy.castVote(proposalId, support.For, {from: david})
    //                     }
    //                 },
    //                 {
    //                     height: queue,
    //                     callback: async () => {
    //                         await daoProxy.queue(proposal.targets, proposal.values, proposal.calldatas, toSha3(proposal.description), {from: bob})
    //                     }
    //                 },
    //                 {
    //                     height: queue+1,
    //                     callback: async () => await governor.state(proposalId, {from: bob})
    //                 },
    //                 {
    //                     height: execute,
    //                     callback: async () => {
    //                         await daoProxy.execute(proposal.targets, proposal.values, proposal.calldatas, toSha3(proposal.description), {from: david})
    //                     }
    //                 },
    //                 {
    //                     height: test,
    //                     callback: async () => await governor.votingPeriod()
    //                 }
    //             ]
    //         }) 
    //         it("it updates voting period through proposal", async ()=> {
    //             let logs = withLogs;
    //             logs.actionNumber.push({h: queue+1, callback: result => console.log(result)}); 
                
    //             let results = await fakeMine(
    //                 async () => token.rewardTokens(other, {from: owner}),
    //                 votingPeriodThroughProposalActions,
    //                 test+1, // blocks
    //                 logs
    //             )
    //             console.log(results[5]);
    //             // assert.equal(results[results.length -1], 5, "voting period does not match input"); 
    //         });
    //         it("it updates voting delay through proposal", async ()=> {});
    //         it("it updates token reward through proposal", async ()=> {});
    //         it("it updates timelock delay through proposal", async ()=> {});
    //         it("it updates timelock address through proposal", async ()=> {});
    //         it("it upgrades proxyaddress through proposal", async ()=> {});
    //     });

    //     // describe("System Proposals", () => { 
    //     //     it("updates votingDelay through proposal cycle");
    //     //     it("updates votingPeriod through proposal cycle");
    //     //     it("updates delay on timelocker through proposal cycle");
    //     // });

    //     // describe("DAO proposals", () => {
    //     //      it("it mints nfts through proposal cycle", async () => {});
    //     //      it("rewards tokens through proposal cycle", async () => {});
    //     //      it("rewards votes through proposal cycle", async () => {}); 
    //     // });       
    // });
    
})