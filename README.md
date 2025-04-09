# Simple Voting Smart Contract

A decentralized voting system built on Ethereum using Solidity. This smart contract allows for creating multiple voting ranges with multiple candidates, where voters can participate in different voting periods.

## Features

- Multiple voting ranges with different time periods
- Support for multiple candidates per voting range
- One vote per voter per range
- Owner-controlled candidate and voting range management
- Time-based voting restrictions

## Smart Contract Functions

### Admin Functions
- `addVotingRange(uint _start, uint _end)`: Create a new voting period
- `addCandidate(string memory _name, uint _rangeId)`: Add a candidate to a voting range

### Public Functions
- `vote(uint _candidateId)`: Cast a vote for a candidate
- `getVotingRanges()`: Get all voting ranges
- `getVotingRange(uint _rangeId)`: Get specific voting range details

## Getting Started

### Prerequisites
- Node.js
- npm or yarn
- Hardhat

### Installation

1. Clone the repository
```bash
git clone https://github.com/rickywijayaa/web3-SimpleVoting.git
```
