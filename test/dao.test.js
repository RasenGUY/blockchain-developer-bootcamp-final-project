// load dependencies 
const { deployProxy, upgradeProxy , upgrades} = require('@openzeppelin/truffle-upgrades');
const { assert } = require('chai');
// const Contract = require('web3-eth-contract');
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const { time } = require('console');
const expect = chai.expect;
chai.use(chaiAsPromised);
const { toUnit, unitToBN, toBN, extractEventSignatures, generateMappingsFromSignatures, subscribeToLogs, fakeMine, fakeMineTwo} = require("./helpers");

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
    var governorInst, govTokenInst, tokenInst, timelockerInst, daoProxyInst;

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
        
    // for proposals
    function Proposal (targets, datas, description){
        this.targets = typeof(targets) != 'object' ? Array(targets) : targets;
        this.values = [0];
        this.calldatas = typeof(targets) != 'object' ? Array(datas) : datas;
        this.description = description;
    }

    
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
        await timelocker.grantRole(PROPOSER_ROLE, governor.address); // for queueing of proposals
        await timelocker.grantRole(EXECUTOR_ROLE, governor.address); // for executing transactions
                  
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

            let proposal = new Proposal(
                governor.address,
                governorInst.methods.setVotingPeriod(5).encodeABI(),
                "update voting period"
            ) 
            await expect(daoProxy.propose(proposal.targets, proposal.values, proposal.calldatas, proposal.description, {from: carl})).to.be.rejected;
        })
        
        
        it("allows for proposal creation", async () => {

            let proposal = new Proposal(
                governor.address,
                governorInst.methods.setVotingPeriod(10).encodeABI(),
                "allows for proposal creation"
            )

            let proposalId = await governor.hashProposal(proposal.targets, proposal.values, proposal.calldatas, toSha3(proposal.description));
            await daoProxy.createMember({from: alice});
            await daoProxy.propose(proposal.targets, proposal.values, proposal.calldatas, proposal.description, {from: alice});
            let state = await governor.state(proposalId);
            
            assert.equal(state, proposalState.Pending, "proposal not created successfully");
        });
        
        it("allows only members to cast votes on proposals", async () => {

            let proposal = new Proposal(
                governor.address,
                governorInst.methods.setVotingPeriod(10).encodeABI(),
                "allows only members to cast votes on proposals"
            )
            
            let proposalId = await governor.hashProposal(proposal.targets, proposal.values, proposal.calldatas, toSha3(proposal.description));                    
            
            let actions = [  
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
            
            let results = await  fakeMine(
                async () => token.rewardTokens(other, {from: owner}),
                actions,
                15
            )                                                   
            assert.equal(results[results.length - 1].e.reason, String(`AccessControl: account ${String(fred).toLowerCase()} is missing role ${MEMBER_ROLE}`), "allows non member to cast vote");
        });

        it("queues proposals", async ()=> {        
               
            
            let proposal = new Proposal(
                governor.address,
                governorInst.methods.setVotingPeriod(15).encodeABI(),
                "queues proposals"
            )

            let proposalId = await governor.hashProposal(proposal.targets, proposal.values, proposal.calldatas, toSha3(proposal.description));

            /// fake mine
            let actions = [
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
            
            let results = await fakeMine(
                async () => token.rewardTokens(other, {from: owner}),
                actions,
                45
            )

            let state = results[results.length-1];
            assert.equal(state.toNumber(), proposalState.Queued, "proposal is not queued");
        });

        
        it("allows only members execute proposal", async ()=> {

            let proposal = new Proposal(
                governor.address,
                governorInst.methods.setVotingPeriod(25).encodeABI(),
                "allows only members to execute proposals"
            )

            let proposalId = await governor.hashProposal(proposal.targets, proposal.values, proposal.calldatas, toSha3(proposal.description));
            let actions = [
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
                }
            ]

            let results = await fakeMine(
                async () => token.rewardTokens(other, {from: owner}),
                actions,
                45
            )
            assert.equal(results[results.length - 1].e.reason , String(`AccessControl: account ${String(fred).toLowerCase()} is missing role ${MEMBER_ROLE}`))
        });

        it("executes proposal", async ()=> {


            let proposal = new Proposal(
                governor.address,
                governorInst.methods.setVotingPeriod(15).encodeABI(),
                "executes proposals"
            )

            let proposalId = await governor.hashProposal(proposal.targets, proposal.values, proposal.calldatas, toSha3(proposal.description));

            let actions = [
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
                    callback: async () => daoProxy.queue(proposal.targets, proposal.values, proposal.calldatas, toSha3(proposal.description), {from: alice})
                },
                {
                    height: 44,
                    callback: async () => daoProxy.execute(proposal.targets, proposal.values, proposal.calldatas, toSha3(proposal.description), {from: carl})
                },
                {
                    height: 49,
                    callback: async () => governorInst.methods.votingPeriod().call()
                }
            ]

            let results = await fakeMine(
                async () => token.rewardTokens(other, {from: owner}),
                actions,
                50,
                {
                    logs: true,
                    actionNumber: [
                        {h: 44, wrapper: result => console.log(result)}
                    ]
                }
            )

            let newVotingPeriod = results[results.length -1];
            assert.equal(Number(newVotingPeriod), 15, "proposal not executed correctly");
        })
    })

    describe("Execution of core dao functionalities through proposals", ()=> {
        let create = 0; // 0
        let propose = create + 1; // 1
        let castVote = create + propose + votingDelay + 5; // 9
        let queue = castVote + votingPeriod + 10; // 23
        let execute = queue + votingDelay + timelockDelay + castVote; // 32 
        console.log(execute)
        let test = execute + 3; // 35
        let duration = test + 5; // 40
        let createMembersAction = (instance) => ({
            height: create,
            callback: async () => {
                await instance.createMember({from: alice})
                await instance.createMember({from: bob})
                await instance.createMember({from: carl})
                await instance.createMember({from: david})
                await instance.createMember({from: ed})
                await instance.createMember({from: fred})
                await instance.createMember({from: gerald})
                await instance.createMember({from: hilda})
            }
        })
        let proposeAction = (instance, proposal, from) => ({
            height: propose,
            callback: async () => instance.propose(proposal.targets, proposal.values, proposal.calldatas, proposal.description, {from: from}) 
        }) 
        let voteStartAction = (instance, proposalId) => ({
            height: castVote, // 9
            callback: async () => {
                await instance.castVote(proposalId, support.For, {from: alice})
                await instance.castVote(proposalId, support.For, {from: bob})
                await instance.castVote(proposalId, support.For, {from: david})
                await instance.castVote(proposalId, support.For, {from: carl})
            }
        })
        let snapshot = (height, instance, proposalId, from) => ({
            height: height,
            callback: async () => await instance.state(proposalId, {from: from})
        })
        let queueAction = (instance, proposal, from) => ({
            height: queue, // 23
            callback: async () => await instance.queue(proposal.targets, proposal.values, proposal.calldatas, toSha3(proposal.description), {from: from})
        })
        let executeAction = (instance, proposal, from) => ({
            height: execute, // 32
            callback: async () => await instance.execute(proposal.targets, proposal.values, proposal.calldatas, toSha3(proposal.description), {from: from})
        }) 
        let testAction = (height, func) => ({
            height: height,
            callback: func
        })

        let withLogs = {
            logs: true,
            actionNumber: [
                { h: create, wrapper: result => console.log(result) },
                { h: propose, wrapper: result => console.log(result) },
                { h: castVote, wrapper: result => console.log(result) },
                { h: queue, wrapper: result => console.log(result) },
                { h: execute, wrapper: result => console.log(result) },
                { h: test, wrapper: result => console.log(result) }
            ]
        }
    

        // create all proposals wih their descriptions
        let [ 
            setVotingPeriodDesc, 
            setVotingDelayDesc, 
            setTokenRewardDesc, 
            setGovTokenRewardDesc, 
            setTimelockDelayDesc, 
            setTimelockAddressDesc, 
            setProxyAddressDesc ] = [
            "set voting period", 
            "set voting delay",
            "set token reward",
            "set vote reward",
            "set timelock delay",
            "set timlock address",
            "set proxy address"
        ] 

        describe("System Proposals", () => {
                        
            
            it("it updates voting period through proposal", async ()=> {

                let members = [
                    {address: alice, support: support.For},
                    {address: bob, support: support.For},
                    {address: carl, support: support.For},
                    {address: david, support: support.For},
                    {address: ed, support: support.For},
                    {address: gerald, support: support.For},
                    {address: hilda, support: support.For}
                ]

                let proposal = new Proposal(
                    governor.address,
                    governorInst.methods.setVotingPeriod(13).encodeABI(),
                    setVotingPeriodDesc
                )
                
                // let proposalId = await governor.hashProposal(proposal.targets, proposal.values, proposal.calldatas, toSha3(proposal.description)); 
                let toTest = async () => governor.votingPeriod()
                
                let [results, testResults] = await fakeMineTwo(governor,
                    daoProxy, 
                    proposal, 
                    members,
                    async () => token.rewardTokens(other, {from: owner}),
                    toTest,
                    proposalState
                )

                // let actions  = [
                //     createMembersAction(daoProxy),
                //     proposeAction(daoProxy, proposal, carl),
                //     voteStartAction(daoProxy, proposalId),
                //     queueAction(daoProxy, proposal, carl),
                //     executeAction(daoProxy, proposal, fred),
                //     snapshot(execute + 1, governor, proposalId, bob),
                //     testAction(test, toTest)
                // ]
                // console.log(actions); 
                // let results = await fakeMine(
                //     async () => token.rewardTokens(other, {from: owner}),
                //     actions,
                //     duration // blocks
                // )
                console.log(results);
                let [votingPeriod] = testResults
                assert.equal(votingPeriod.toNumber(), 13, "voting period does not match input"); 
            });

            // it("it updates voting delay through proposal", async ()=> {
                
            //     let proposal = new Proposal(
            //         governor.address,
            //         governorInst.methods.setVotingDelay(15).encodeABI(),
            //         setVotingDelayDesc
            //     )

            //     let proposalId = await governor.hashProposal(proposal.targets, proposal.values, proposal.calldatas, toSha3(proposal.description));
            //     let toTest = async () => governor.votingDelay()
                
            //     let actions = [
            //         createMembersAction(daoProxy),
            //         proposeAction(daoProxy, proposal, carl),
            //         voteStartAction(daoProxy, proposalId),
            //         queueAction(daoProxy, proposal, carl),
            //         executeAction(daoProxy, proposal, fred),
            //         snapshot(execute + 1, governor, proposalId, bob),
            //         testAction(test, toTest)
            //     ];

            //     let results = await fakeMine(
            //         async () => token.rewardTokens(other, {from: owner}),
            //         actions,
            //         duration // blocks
            //     )
            //     let votingDelay = results[results.length -1]; 
            //     assert.equal(votingDelay, 15, "does not set correct voting delay through proposal");

            // });

            // it("it updates token reward through proposal", async ()=> {});
            // it("it updates timelock delay through proposal", async ()=> {});
            // it("it updates timelock address through proposal", async ()=> {});
            // it("it upgrades proxyaddress through proposal", async ()=> {});
        });

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
    });
    
})