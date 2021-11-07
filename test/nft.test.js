const { assert } = require('chai');
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const expect = chai.expect;
chai.use(chaiAsPromised);

const { deployProxy, upgradeProxy } = require('@openzeppelin/truffle-upgrades');
const IkonDAOVectorCollectible = artifacts.require("IkonDAOVectorCollectible");
const DAO = artifacts.require("IkonDAO");
const IkonDAOToken = artifacts.require('IkonDAOToken');
const IkonDAOGovernor = artifacts.require('IkonDAOGovernor');
const IkonDAOTimelockController = artifacts.require('IkonDAOTimelockController');
const IkonDAOGovernanceToken = artifacts.require('IkonDAOGovernanceToken');
// const web3 = require("web3"); 
// const web3 = new Web


contract("IkonDao (nft)", accounts => {

    let [owner, other, alice, bob, carl, david, ed] = accounts;
    let [ MINTER_ROLE, PAUSER_ROLE, ADMIN_ROLE ] = [    
        web3.utils.soliditySha3("IKONDAO_MINTER_ROLE"),
        web3.utils.soliditySha3("IKONDAO_PAUSER_ROLE"),
        web3.utils.soliditySha3("IKONDAO_ADMIN_ROLE")
    ]; 

    let nft, daoProxy, daoGovernor, daoToken, daoTimelock, daoGovToken;

    beforeEach(async ()=> {
        daoGovernor= await IkonDAOGovernor.deployed();
        daoToken= await IkonDAOToken.deployed(); 
        daoTimelock = await IkonDAOTimelockController.deployed();
        daoGovToken = await IkonDAOGovernanceToken.deployed();
        daoProxy = await deployProxy(DAO, [daoGovernor.address, daoTimelock.address, daoToken.address], {kind: 'uups', initializer: '__IkonDAO_init', unsafeAllow: [ 'constructor', 'delegatecall']}, {from: owner});
    })

    
    describe("Contract Initialization", () => {
        
        beforeEach(async () => {
            nft = await IkonDAOVectorCollectible.new(daoProxy.address);
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
        it("sets the correct DAO address ", async () => {
            let daoAddress = await nft.getDAOAddress();
            assert.equal(daoAddress, daoProxy.address, "owner should 'IKDVC'");

        })
    });

    describe("Updating DAO address", () => {

        beforeEach(async () => {
            nft = await IkonDAOVectorCollectible.new(daoProxy.address);
        })

        it("sets new dao address", async () => {
            let newDAOAddress = await nft.setDAOAddress(alice, {from: owner});
            assert.notEqual(newDAOAddress, daoProxy.address, "does not set DAO address correctly");
        })
        it("allows only admin to change dao address", async () => {
            await expect(nft.setDAOAddress(other, {from: david})).to.be.rejected;
        })
    })
    
    describe("Minting", () => {
        let categoryOne = 'Things';
        let categoryTwo = 'Animals';
        let desc = "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua";
        let externalLink = "IkonDao.nfts.com";
        let token1, token2, token3; 
        
        beforeEach( async () => {
            
            nft = await IkonDAOVectorCollectible.new(daoProxy.address); 
        
            token1 = [
                web3.utils.utf8ToHex("Lame Thing"),
                desc,
                web3.utils.utf8ToHex(externalLink),
                web3.utils.utf8ToHex("iueroiarojdsf"),
                web3.utils.utf8ToHex(categoryOne),
                web3.utils.utf8ToHex("Ruben G")
            ]
            token2 = [
                web3.utils.utf8ToHex("Sad Bunny"),
                desc,
                web3.utils.utf8ToHex(externalLink),
                web3.utils.utf8ToHex("OIUEWRQOJDFSS"),
                web3.utils.utf8ToHex(categoryTwo),
                web3.utils.utf8ToHex("Leroy G")
            ]
            token3 = [
                web3.utils.utf8ToHex("Happy Bunny"),
                desc,
                web3.utils.utf8ToHex(externalLink),
                web3.utils.utf8ToHex("kuhfiulsahfiuh"),
                web3.utils.utf8ToHex(categoryTwo),
                web3.utils.utf8ToHex("Fefe G")
            ]
        });
            
            
        it("allows only minter role to mint tokens", async () => {
            await expect(nft.safeMintVector(
                token1[0], 
                token1[1], 
                token1[2], 
                token1[3], 
                token1[4], 
                token1[5], 
                {from: other}
            )).to.be.rejected; 
        });
        it("it pauses functionalities", async () => {
            await nft.pause({from: owner});

            await expect(nft.safeMintVector(
                token1[0], 
                token1[1], 
                token1[2], 
                token1[3], 
                token1[4], 
                token1[5], 
                {from: owner}
            )).to.be.rejected;
            await nft.unpause({from: owner});
        });

        it("allows only pauser role to pause tokens", async () => {
            await expect(nft.pause({from: other})).to.be.rejected;
        });

        it("it gives ownership of minted token to dao", async () => {
            await nft.safeMintVector(
                token2[0], 
                token2[1], 
                token2[2], 
                token2[3], 
                token2[4], 
                token2[5], 
                {from: owner}
            );
            
            let tokenOwner = await nft.ownerOf(0, {from: alice});
            assert.equal(tokenOwner, daoProxy.address, "dao should be owner of the token");
        });

        it("appends category list", async () => {
            await nft.safeMintVector(
                token1[0], 
                token1[1], 
                token1[2], 
                token1[3], 
                token1[4], 
                token1[5], 
                {from: owner}
            );
            let categories = await nft.getCategories();
            assert.isAbove(categories.length, 0, "does not append list");
        });

        it("only new categories are appended to the category list", async () => {
            
            await nft.safeMintVector(
                token1[0], 
                token1[1], 
                token1[2], 
                token1[3], 
                token1[4], 
                token1[5], 
                {from: owner}
            )
            await nft.safeMintVector(
                token2[0], 
                token2[1], 
                token2[2], 
                token2[3], 
                token2[4], 
                token2[5], 
                {from: owner}
            )
            await nft.safeMintVector(
                token3[0], 
                token3[1], 
                token3[2], 
                token3[3], 
                token3[4], 
                token3[5], 
                {from: owner}
            )            
            
            let categories = await nft.getCategories();
            assert.equal(categories.length, 2, "does not append list if only new categories");
        });

        
        it("sets correct metadata and retrieves it", async () => {
            await nft.safeMintVector(
                token2[0], 
                token2[1], 
                token2[2], 
                token2[3], 
                token2[4], 
                token2[5],  
                {from: owner}
            )
            
            let metadata = await nft.getMetadata(0);

            assert.equal(web3.utils.hexToUtf8( metadata[0]), "Sad Bunny", "does not set correct metadata 'name'");            
            assert.equal(metadata[1].toString(), desc, "does not set correct metadata 'description'");            
            assert.equal(web3.utils.hexToUtf8(metadata[2]), externalLink, "does not set correct metadata 'external link'");            
            assert.equal(web3.utils.hexToUtf8(metadata[3]), "OIUEWRQOJDFSS", "does not set correct metadata 'image'");            
            assert.equal(web3.utils.hexToUtf8(metadata[4]), categoryTwo, "does not set correct metadata 'category'");            
            assert.equal(web3.utils.hexToUtf8(metadata[5]), "Leroy G", "does not set correct metadata 'artist handle'");            
        });

        it("rejects minting of taken (image already exists) contracts", async ()=>{
            await nft.safeMintVector(
                token2[0], 
                token2[1], 
                token2[2], 
                token2[3], 
                token2[4], 
                token2[5],  
                {from: owner}
            )

            await expect(nft.safeMintVector(
                token2[0], 
                token2[1], 
                token2[2], 
                token2[3], 
                token2[4], 
                token2[5],  
                {from: owner}
            )).to.be.rejected 

        })
    })

})
