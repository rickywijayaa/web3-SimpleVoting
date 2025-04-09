const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("SimpleVoting", function () {
    let simpleVoting;
    let owner;
    let voter1;
    let voter2;

    beforeEach(async function () {
        [owner, voter1, voter2] = await ethers.getSigners();
        const SimpleVoting = await ethers.getContractFactory("SimpleVoting");
        simpleVoting = await SimpleVoting.deploy();
        await simpleVoting.waitForDeployment();
    });

    describe("Deployment", function () {
        it("Should set the right owner", async function () {
            expect(await simpleVoting.owner()).to.equal(owner.address);
        });

        it("Should set the correct max candidate", async function () {
            expect(await simpleVoting.maxCandidate()).to.equal(3);
        });
    });

    describe("Voting Range", function () {
        it("Should create a new voting range", async function () {
            const now = Math.floor(Date.now() / 1000);
            const startTime = now + 3600; // Start in 1 hour
            const endTime = now + 7200;   // End in 2 hours

            await simpleVoting.connect(owner).addVotingRange(startTime, endTime);
            const range = await simpleVoting.getVotingRange(0);

            expect(range.start).to.equal(startTime);
            expect(range.end).to.equal(endTime);
            expect(range.candidateCount).to.equal(0);
        });

        it("Should revert if non-owner tries to create range", async function () {
            const now = Math.floor(Date.now() / 1000);
            await expect(
                simpleVoting.connect(voter1).addVotingRange(now + 3600, now + 7200)
            ).to.be.revertedWith("Only Owner Can Access");
        });

        it("Should revert if end time is before start time", async function () {
            const now = Math.floor(Date.now() / 1000);
            await expect(
                simpleVoting.connect(owner).addVotingRange(now + 7200, now + 3600)
            ).to.be.revertedWith("Invalid Range");
        });
    });

    describe("Candidates", function () {
        beforeEach(async function () {
            const now = Math.floor(Date.now() / 1000);
            await simpleVoting.connect(owner).addVotingRange(now + 3600, now + 7200);
        });

        it("Should add candidates to a range", async function () {
            await simpleVoting.connect(owner).addCandidate("Alice", 0);
            await simpleVoting.connect(owner).addCandidate("Bob", 0);

            const range = await simpleVoting.getVotingRange(0);
            expect(range.candidateCount).to.equal(2);

            const candidate1 = await simpleVoting.candidates(0);
            expect(candidate1.name).to.equal("Alice");
            expect(candidate1.voteCount).to.equal(0);
            expect(candidate1.rangeId).to.equal(0);
        });

        it("Should revert when exceeding max candidates", async function () {
            await simpleVoting.connect(owner).addCandidate("Alice", 0);
            await simpleVoting.connect(owner).addCandidate("Bob", 0);
            await simpleVoting.connect(owner).addCandidate("Charlie", 0);

            await expect(
                simpleVoting.connect(owner).addCandidate("Dave", 0)
            ).to.be.revertedWith("Maximum Candidate Limit Reached");
        });
    });

    describe("Voting", function () {
        beforeEach(async function () {
            const blockNumBefore = await ethers.provider.getBlockNumber();
            const blockBefore = await ethers.provider.getBlock(blockNumBefore);
            const currentTimestamp = blockBefore.timestamp;
            
            const startTime = currentTimestamp + 3600; // Start in 1 hour
            const endTime = currentTimestamp + 7200;   // End in 2 hours
            
            await simpleVoting.connect(owner).addVotingRange(startTime, endTime);
            await simpleVoting.connect(owner).addCandidate("Alice", 0);
            await simpleVoting.connect(owner).addCandidate("Bob", 0);

            // Fast forward time to just after voting starts
            await ethers.provider.send("evm_increaseTime", [3650]); // Move forward 1 hour + 50 seconds
            await ethers.provider.send("evm_mine");
        });

        it("Should allow voting for a candidate", async function () {
            await simpleVoting.connect(voter1).vote(0);
            const candidate = await simpleVoting.candidates(0);
            expect(candidate.voteCount).to.equal(1);
        });

        it("Should prevent double voting in same range", async function () {
            await simpleVoting.connect(voter1).vote(0);
            await expect(simpleVoting.connect(voter1).vote(1)).to.be.revertedWith("You Have Already Voted in this Range");
        });

        it("Should allow different voters to vote", async function () {
            await simpleVoting.connect(voter1).vote(0);
            await simpleVoting.connect(voter2).vote(0);
            const candidate = await simpleVoting.candidates(0);
            expect(candidate.voteCount).to.equal(2);
        });

        it("Should revert when voting for invalid candidate", async function () {
            await expect(
                simpleVoting.connect(voter1).vote(99)
            ).to.be.revertedWith("Invalid Candidate ID");
        });
    });
});