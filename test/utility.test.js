// load dependencies 
const { deployProxy, upgradeProxy } = require('@openzeppelin/truffle-upgrades');
const { assert } = require('chai');
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const expect = chai.expect;
chai.use(chaiAsPromised);

const BN = require("big.js");
const { resToNumber: toNumber, numToBN: toBN } = require("./bnHelpers");
const DAO = artifacts.require('IkonDAO');
const IkonDAOToken = artifacts.require('IkonDAOToken');


contract("IKonDAOCollective (utility)", accounts => {
    let owner = accounts[0]; 
    let other = accounts[1];
    let [ ,  , alice, bob, carl, david] = accounts;
    let token;
    let minterRole = web3.utils.soliditySha3("MINTER_ROLE");
    let snapShotRole = web3.utils.soliditySha3("SNAPSHOT_ROLE");
    let adminRole = web3.utils.soliditySha3("IKONDAO_ADMIN_ROLE");
    let balances;    
    
    beforeEach(async ()=> {
        /// create contract insntance
        token = await IkonDAOToken.deployed() 
    })

    // initializes correctly
    it("sets correct baserewards", async () => {  
        let basereward = await token.getBaseReward();
        assert.equal(toNumber(basereward), 5, "should initialize with 5");        
    }); 

    it("admin (dao) should have 10million tokens", async () => {
        let balanceOfOwner = await token.balanceOf(owner);
        assert.equal(toNumber(balanceOfOwner), 1000000, "initial dao balance not set correctly");
    });

    // functionalities
    it("should reward tokens", async () => {
        await token.rewardTokens(alice);
        let balanceOfAlice = await token.balanceOf(alice); 
        assert.equal(toNumber(balanceOfAlice), 5, "does not distribute rewards correctly"); 
    });

    it("sets new base reward", async () => {
        await token.setBaseReward(toBN(10));
        let baseReward = await token.getBaseReward();
        assert.equal(toNumber(baseReward), 10, "does not correctly set basereward");
    });

    it("allows only owner to mint", async () => {
        await expect(token.mint(toBN(500), {from: alice})).to.be.rejected
    }); 
})