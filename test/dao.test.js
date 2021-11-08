// load dependencies 
const { deployProxy, upgradeProxy } = require('@openzeppelin/truffle-upgrades');
const { assert } = require('chai');
// const Contract = require('web3-eth-contract');
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const expect = chai.expect;
chai.use(chaiAsPromised);
const { toUnit, unitToBN, toBN, extractEventSignatures, generateMappingsFromSignatures, subscribeToLogs, fakeMine} = require("./helpers");

const IkonDAO = artifacts.require('IkonDAO');
const IkonDAOGovernanceToken = artifacts.require('IkonDAOGovernanceToken');
const IkonDAOGovernor = artifacts.require('IkonDAOGovernor');
const IkonDAOTimelockController = artifacts.require('IkonDAOTimelockController');
const IkonDAOToken = artifacts.require('IkonDAOToken');
const IkonDAOVectorCollectible = artifacts.require("IkonDAOVectorCollectible");

web3.setProvider('ws://localhost:8545');
const utils = web3.utils;
const toSha3 = web3.utils.soliditySha3;

contract("IkonDAO (proxy)", accounts => {

    // general 
    let [owner, other , alice, bob, carl, david, ed, fred, gerald, hilda] = accounts;

    let [MEMBER_ROLE, ADMIN_ROLE, BANNED_ROLE, PAUSER_ROLE, MINTER_ROLE] = [
        toSha3("IKONDAO_MEMBER_ROLE"),
        toSha3("IKONDAO_ADMIN_ROLE"),
        toSha3("IKONDAO_BANNED_ROLE"),
        toSha3("IKONDAO_PAUSER_ROLE"),
        toSha3("IKONDAO_MINTER_ROLE")
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
    let dao, daoProxy, govToken, token, governor, timelock, nft;

    // contract instance -> for getting abi methods
    let governorInst, govTokenInst, tokenInst, timelockInst, proposals;

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
        timelock = await IkonDAOTimelockController.new(timelockDelay, proposers, executors);
        governor = await IkonDAOGovernor.new(token.address, timelock.address, votingDelay, votingPeriod, {from: owner});
        daoProxy = await deployProxy(IkonDAO, [governor.address, timelock.address, token.address], {initializer: '__IkonDAO_init', kind: 'uups', unsafeAllow: ['constructor', 'delegatecall']});
        nft = await IkonDAOVectorCollectible.new(daoProxy.address);

        /// contract instance 
        governorInst = new web3.eth.Contract(governor.abi, governor.address); 
        govTokenInst = new web3.eth.Contract(govToken.abi, govToken.address); 
        tokenInst = new web3.eth.Contract(token.abi, token.address); 
        timelockInst = new web3.eth.Contract(timelock.abi, timelock.address);
        nftInst = new web3.eth.Contract(nft.abi, nft.address);

        // give proxy admin rights to governor
        await governor.grantRole(ADMIN_ROLE, daoProxy.address, {from: owner});

        // proposals object
        function Proposals (){
            
            // system proposals
            this.setVotingDelay = (delay, description) => ({ // sets voting delay
                targets: [governor.address],
                values: [0],
                calldatas: [governorInst.methods.setVotingDelay(delay).encodeABI()],
                description: description
            })

            this.setVotingPeriod = (period, description) => ({ // sets voting period
                targets: [governor.address],
                values: [0],
                calldatas: [governorInst.methods.setVotingPeriod(period).encodeABI()],
                description: description
            })

            this.setGovTokenReward = (newReward, description) => ({ // sets new govtoken rewards
                targets: [govToken.address],
                values: [0],
                calldatas: [govTokenInst.methods.setRewardVotes(unitToBN(newReward)).encodeABI()],
                description: description,
            })
    
            this.updateTimelockerDelay = (newDelay, description) => ({ // sets new delay for timelocker
                targets: [timelocker.address],
                values: [0],
                calldatas: [timlockInst.methods.updateDelay(newDelay).encodeABI()],
                description: description
            })

            this.updateTimelock = (newTimelock, description) => ({ // changes timelocker address of the governor
                targets: [governor.address],
                values: [0],
                calldatas: [governorInst.methods.updateTimelock(newTimelock).encodeABI()],
                description: description
            })
            
            // accountability proposals
            this.banMember = (member, description) => ({
                targets: [daoProxy.address],
                values: [0],
                calldatas: [daoInst.methods.banMember(member).encodeABI()],
                description: description
            })       

            this.slashVotes = (member, amount, description) => ({
                targets: [govToken.address],
                values: [0],
                calldatas: [govTokenInst.methods.slashVotes(member, unitToBN(amount)).encodeABI()],
                description: description
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
                description: description
            })

            // mint utility tokens
            this.mintTokens = (amount, description) => ({
                targets: [daoProxy.address],
                values: [0],
                calldatas: [daoInst.methods.mintUtilityTokens(unitToBN(amount))],
                description: description
            })
        }

        /// instantiate proposals object
        proposals = new Proposals(); 

        // events 
        // console.log(governor.abi); 
        // map names to address and topics of sigs
        govEventSigMap = generateMappingsFromSignatures(extractEventSignatures(governor.abi));
        tokenEventSigMap = generateMappingsFromSignatures(extractEventSignatures(token.abi)); 
        govTokenEventSigMap = generateMappingsFromSignatures(extractEventSignatures(govToken.abi)); 
        timelockerEventSigMap = generateMappingsFromSignatures(extractEventSignatures(timelock.abi)); 
        daoEventSigMap = generateMappingsFromSignatures(extractEventSignatures(dao.abi));
        nftEventSigMap = generateMappingsFromSignatures(extractEventSignatures(nft.abi));
                 
        
    });    
        
    describe("Initialization", () => {

        // beforeEach(async () => {        
            
            
        // })

        // upgradeabillity tests
        it("set the correct owner", async () => {
            let daoOwner = await daoProxy.owner()
            assert.equal(daoOwner, owner, "owner is not the deployer contract");
        })

        it("transferOwnerShip", async () => {
            await daoProxy.transferOwnership(other); 
            let newOwner = await daoProxy.owner(); 
            assert.equal(newOwner, other, "ownership not sucessfully transferred");
        });

        it("renounces ownership", async () => {
            await daoProxy.renounceOwnership(); 
            const zeroAddress = "0x0000000000000000000000000000000000000000";
            assert.equal(await daoProxy.owner(), zeroAddress , "does not renounce ownership successfully");
        });

        it("can handle upgrades and ownership by owner", async () => {
            await expect(daoProxy.transferOwnership(accounts[2], {from: other})).to.be.rejected   
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
            let updateVP = proposals.setVotingPeriod(5, description);
            await expect(daoProxy.propose(updateVP.targets, updateVP.values, updateVP.calldatas, description, {from: carl})).to.be.rejected;
        })

        let description, proposal, proposalId;
        before(async () => {            
            /// members 
            description = "allows for proposal creation";
            proposal = proposals.setVotingPeriod(5, description);
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
            description = "allows members to cast proposal";
            proposal = proposals.setVotingDelay(10, description);
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
                    height: 25,
                    callback: async () => {
                        try {
                            await daoProxy.castVotes(proposalId, support.For, {from: alice})
                        } catch (e) {
                            return e ? "some error occurred" : "vote succeeded";
                        }
                    } 
                }
            ]
        })
        it("allows only members to cast votes on proposals", async () => {
            let results = await  fakeMine(
                async () => token.rewardTokens(other, {from: owner}),
                onlyMemberCastVotesActions,
                30
            )
            assert.equal(results[results.length - 1], 'some error occurred', "allows non member to cast vote");
        });

        let checkQueuesActions;        
        before(async () => {
            // new descriptions
            description = "queues proposals";
            proposal = proposals.setVotingPeriod(10, description);
            proposalId = await governor.hashProposal(proposal.targets, proposal.values, proposal.calldatas, toSha3(proposal.description));
            console.log(proposal);

            /// fake mine
            checkQueuesActions = [
                {
                    height: 0,
                    callback: async () => {
                        try {

                            await daoProxy.createMember({from: alice})
                            await daoProxy.createMember({from: david})
                            await daoProxy.createMember({from: carl})
                            await daoProxy.createMember({from: ed})
                            await daoProxy.createMember({from: bob})

                        } catch(e) {

                            return e ? e : "created members sucessfully";
                        }
                    }
                },
                {
                    height: 1,
                    callback: async () => daoProxy.propose(proposal.targets, proposal.values, proposal.calldatas, proposal.description, {from: alice})
                },
                {
                    height: 35,
                    callback: async () => {
                        try {
                            await daoProxy.castVotes(proposalId, support.For, {from: bob})
                        } catch (e) {
                            console.log(e);
                            return e ? e : "members succesully voted";
                        }
                    }
                },
                // {
                //     height: 30,
                //     callback: async () => {
                //         await daoProxy.queue(proposal.targets, proposal.values, proposal.calldatas, toSha3(proposal.description), {from: alice})
                //     }
                // },
                // {
                //     height: 32,
                //     callback: async () => governor.state(proposalId) 
                // },
            ]
        })
        it("queues proposals", async ()=> {
            let results = await fakeMine(
                async () => token.rewardTokens(other, {from: owner}),
                checkQueuesActions,
                43,
                {
                    log: true,
                    actionNumber: [
                        {h: 0, wrapper: result => console.log(result)},
                        {h: 1, wrapper: result => console.log(result)},
                        {h: 35, wrapper: result => console.log(result)}
                    ]
                }
            )
            // console.log(results[1])
            assert.equal(results[results.length - 1], proposalState.Queued, "proposal is not queued");
        });

        it("executes proposals", async ()=> {});
    })

    // describe("Access Control", () => {

    //     it("allows only members to create proposals", async ()=> {});
    //     it("allows only members to queue proposals", async ()=>{});
    //     it("allows only members to execute proposals", async ()=>{});
        
    // })

    // describe("Execution of core dao functionalities through proposals", ()=> {
        
    //     describe("Accountability Proposals", () => { 
    //         it("it slashes votes from users through proposal", async ()=> {});
    //         it("it bans users through proposal", async ()=> {});
    //     });

    //     describe("System Proposals", () => { 
    //         it("updates votingDelay through proposal cycle");
    //         it("updates votingPeriod through proposal cycle");
    //         it("updates delay on timelocker through proposal cycle");
    //     });

    //     describe("DAO proposals", () => {
    //          it("it mints nfts through proposal cycle", async () => {});
    //          it("rewards tokens through proposal cycle", async () => {});
    //          it("rewards votes through proposal cycle", async () => {}); 
    //     });       
    // });
    
})