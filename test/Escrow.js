const { expect } = require("chai");
const { ethers } = require("hardhat");

const tokens = (n) => {
    return ethers.utils.parseUnits(n.toString(), "ether");
};

describe("Escrow", () => {
    let buyer, seller, inspector, lender;
    let realEstate;

    beforeEach(async () => {
        //Setup Accounts
        [buyer, seller, inspector, lender] = await ethers.getSigners();

        //Deploy Real Estate
        const RealEstate = await ethers.getContractFactory("RealEstate");
        realEstate = await RealEstate.deploy();

        // Mint connecting to be a function that the seller does
        let transaction = await realEstate
            .connect(seller)
            .mint(
                "https://ipfs.io/ipfs/QmQVcpsjrA6cr1iJjZAodYwmPekYgbnXGo4DFubJiLc2EB/1.json"
            );
        await transaction.wait();

        const Escrow = await ethers.getContractFactory("Escrow");
        escrow = await Escrow.deploy(
            realEstate.address,
            seller.address,
            inspector.address,
            lender.address
        );

        //Approve property
        transaction = await realEstate
            .connect(seller)
            .approve(escrow.address, 1);
        await transaction.wait();

        //List property
        transaction = await escrow
            .connect(seller)
            .list(1, buyer.address, tokens(10), tokens(5));
        await transaction.wait();
    });

    describe("Deployment", () => {
        it("Returns NFT address", async () => {
            const result = await escrow.nftAddress();
            expect(result).to.be.equal(realEstate.address);
        });

        it("Returns Seller", async () => {
            const result = await escrow.seller();
            expect(result).to.be.equal(seller.address);
        });

        it("Returns Inspector", async () => {
            const result = await escrow.inspector();
            expect(result).to.be.equal(inspector.address);
        });

        it("Returns Lender", async () => {
            const result = await escrow.lender();
            expect(result).to.be.equal(lender.address);
        });
    });

    describe("Listing", () => {
        it("Updates as Listed", async () => {
            const result = await escrow.isListed(1);
            expect(result).to.be.equal(true);
        });

        it("Updates ownership", async () => {
            expect(await realEstate.ownerOf(1)).to.be.equal(escrow.address);
        });

        it("Returns buyer", async () => {
            const result = await escrow.buyer(1);
            expect(result).to.be.equal(buyer.address);
        });

        it("Returns purchase price", async () => {
            const result = await escrow.purchasePrice(1);
            expect(result).to.be.equal(tokens(10));
        });

        it("Returns escrow amount", async () => {
            const result = await escrow.escrowAmount(1);
            expect(result).to.be.equal(tokens(5));
        });
    });

    describe("Deposits", () => {
        it("Updates contract balance", async () => {
            const transaction = await escrow
                .connect(buyer)
                .depositEarnest(1, { value: tokens(5) });
            await transaction.wait();
            const result = await escrow.getBalance();
            expect(result).to.be.equal(tokens(5));
        });
    });
});
