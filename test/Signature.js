const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Signatures", function () {
    let signer; let bob; let steve;

    before(async function() {
        [signer, bob, steve] = await ethers.getSigners();

        const signatureFactory = await ethers.getContractFactory("Signature");
        this.signatureContract = await signatureFactory.deploy();
        await this.signatureContract.deployed();
    })

    it("Get Message Hash", async function () {
        const to = bob.address;
        const amount = 100;
        const message = "Hello World";
        const nonce = 32;

        const messageHash = await this.signatureContract.connect(signer).getMessageHash(to, amount, message, nonce);
        expect(messageHash.length).to.equal(66);
    })

    it("Get Signature", async function () {
        const to = bob.address;
        const amount = 100;
        const message = "Hello World";
        const nonce = 32;

        const messageHash = await this.signatureContract.connect(signer).getMessageHash(to, amount, message, nonce);
        const signature = await signer.signMessage(ethers.utils.arrayify(messageHash));
        expect(signature.length).to.equal(132);
    })

    it("Verify signer", async function () {
        const to = bob.address;
        const amount = 100;
        const message = "Hello World";
        const nonce = 32;

        const messageHash = await this.signatureContract.connect(signer).getMessageHash(to, amount, message, nonce);
        const signature = await signer.signMessage(ethers.utils.arrayify(messageHash));

        const verifySigner = await this.signatureContract.connect(signer).verify(signer.address, to, amount, message, nonce, signature);
        expect(verifySigner).to.equal(true);
    });

    it("Recover Signer", async function(){
        const to = bob.address;
        const amount = 100;
        const message = "Hello World";
        const nonce = 32;

        const messageHash = await this.signatureContract.connect(signer).getMessageHash(to, amount, message, nonce);
        const signature = await signer.signMessage(ethers.utils.arrayify(messageHash));
        const ethSignedMessageHash = await this.signatureContract.connect(signer).getEthSignedMessageHash(messageHash);
        const recoverSigner = await this.signatureContract.connect(signer).recoverSigner(ethSignedMessageHash, signature);
        expect(recoverSigner).to.equal(signer.address);
    })
    it("Length of signature must be 65", async function(){
        const to = bob.address;
        const amount = 100;
        const message = "Hello World";
        const nonce = 32;

        const messageHash = await this.signatureContract.connect(signer).getMessageHash(to, amount, message, nonce);
        const signature = await signer.signMessage(ethers.utils.arrayify(messageHash));
        const ethSignedMessageHash = await this.signatureContract.connect(signer).getEthSignedMessageHash(messageHash);
        await expect(this.signatureContract.connect(signer).recoverSigner(ethSignedMessageHash, ethSignedMessageHash)).to.be.revertedWith("invalid signature length");
    });

})