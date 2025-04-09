// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.20;

contract SimpleVoting {
    address public owner;
    uint public maxCandidate = 3;

    struct Candidate {
        string name;
        uint voteCount;
        uint rangeId;
    }

    struct VotingRange {
        uint start;
        uint end;
        uint candidateCount;
    }

    Candidate[] public candidates;
    VotingRange[] public votingRanges;

    mapping(address => mapping(uint => bool)) public hasVoted;

    modifier onlyOwner () {
        require(msg.sender == owner, "Only Owner Can Access");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function getVotingRanges() public view returns (VotingRange[] memory) {
        return votingRanges;
    }

    function getVotingRange(uint _rangeId) public view returns (VotingRange memory) {
        require(_rangeId < votingRanges.length, "Invalid Range ID");
        return votingRanges[_rangeId];
    }

    function addCandidate(string memory _name, uint _rangeId) public onlyOwner {
        require(_rangeId < votingRanges.length, "Invalid Range ID");
        require(votingRanges[_rangeId].candidateCount < maxCandidate, "Maximum Candidate Limit Reached");
        require(votingRanges[_rangeId].end > block.timestamp, "Voting Range Has Ended");

        candidates.push(Candidate(_name, 0, _rangeId));
        votingRanges[_rangeId].candidateCount++;
    }

    function addVotingRange(uint _start, uint _end) public onlyOwner {
        require(_start < _end, "Invalid Range");
        require(_start > block.timestamp, "Voting Range Has Already Started");
        votingRanges.push(VotingRange(_start, _end, 0));
    }

    function vote(uint _candidateId) public {
        require(_candidateId < candidates.length, "Invalid Candidate ID");
        uint rangeId = candidates[_candidateId].rangeId;
        require(!hasVoted[msg.sender][rangeId], "You Have Already Voted in this Range");
        require(block.timestamp >= votingRanges[rangeId].start, "Voting Has Not Started");
        require(block.timestamp <= votingRanges[rangeId].end, "Voting Has Ended");
        
        candidates[_candidateId].voteCount++;
        hasVoted[msg.sender][rangeId] = true;
    }
}