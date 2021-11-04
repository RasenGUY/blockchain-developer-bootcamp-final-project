const { assert } = require('chai');
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const expect = chai.expect;
chai.use(chaiAsPromised);
const IkonDAOVectorCollectible = artifacts.require("IkonDAOVectorCollectible");

contract("IkonDao (nft)", async accounts => {
    let owner = accounts[0];
    let [, alice, bob, carl, david, ed] = accounts;
    let [ MINTER_ROLE, PAUSER_ROLE, ADMIN_ROLE ] = [    
        web3.utils.soliditySha3("IKONDAO_MINTER_ROLE"),
        web3.utils.soliditySha3("IKONDAO_PAUSER_ROLE"),
        web3.utils.soliditySha3("IKONDAO_ADMIN_ROLE")
    ]; 

    describe("Contract Initialization", () => {
        let nft;
        
        beforeEach(async () => {
            nft = await IkonDAOVectorCollectible.deployed();
        })

        it("sets the correct minter", async () => {
            let isOwnerMinter = await nft.hasRole(MINTER_ROLE, owner);
            assert.equal(isOwnerMinter, true, "owner should be minter");
        })
        it("sets the correct pauser", async () => {
            let isOwnerPauser = await nft.hasRole(PAUSER_ROLE, owner);
            assert.equal(isOwnerPauser, true, "owner should be pauser");
        })
        it("sets the correct admin", async () => {
            let isOwnerAdmin = await nft.hasRole(ADMIN_ROLE, owner);
            assert.equal(isOwnerAdmin, true, "owner should be admin");
        })
        it("sets the correct name", async () => {
            let name = await nft.name();
            assert.equal(name, "IkonDAO Vector Collectible", "owner should 'IkonDAO Vector Collectible'");
        })
        it("sets the correct symbol", async () => {
            let symbol = await nft.symbol();
            assert.equal(symbol, "IKDVC", "owner should 'IKDVC'");

        })
    })

})
