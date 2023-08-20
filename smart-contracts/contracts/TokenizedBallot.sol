// SPDX-License-Identifier: MIT
pragma solidity >=0.7.0 <0.9.0;

interface IMyToken {
    function getPastVotes(address, uint256) external view returns (uint256);
}

contract TokenizedBallot {
    
    IMyToken tokenContract;
    uint256 public targetBlocknumber;
    address public owner;
    
    struct Proposal {
        bytes32 name;   
        uint voteCount; 
    }
    Proposal[] public proposals;
    uint public ballotSize;

    mapping(address => uint256) public votingPowerSpent;
    
    modifier onlyOwner()
    {
        require (msg.sender == owner, "Caller is not the owner");
        _;
    }

    constructor(bytes32[] memory proposalNames, address _tokenContract, uint256 _targetBlocknumber) {
        owner = msg.sender;
        tokenContract = IMyToken(_tokenContract);
        targetBlocknumber = _targetBlocknumber;
        
        ballotSize = proposalNames.length;
        for (uint i = 0; i < proposalNames.length; i++) {    
            proposals.push(Proposal({
                name: proposalNames[i],
                voteCount: 0
            }));
        }
    }

    function transferOwnership(address newOwner) public onlyOwner {
        owner = newOwner;
    }

    function updateBallot(bytes32[] memory proposalNames, uint256 _targetBlocknumber) external onlyOwner() {
        targetBlocknumber = _targetBlocknumber;
        
        ballotSize = proposalNames.length;
        delete proposals;
        for (uint i = 0; i < proposalNames.length; i++) {    
            proposals.push(Proposal({
                name: proposalNames[i],
                voteCount: 0
            }));
        }
    }

    function vote(uint proposal, uint256 amount) external {
        require(votingPower(msg.sender) >= amount, "Insufficient voting power");

        votingPowerSpent[msg.sender] += amount;
        proposals[proposal].voteCount += amount;
    }

    function votingPower(address account) public view returns (uint256) {
        return tokenContract.getPastVotes(account, targetBlocknumber) - votingPowerSpent[account]; 
    }
    
    function winningProposal() public view
            returns (uint winningProposal_)
    {
        uint winningVoteCount = 0;
        for (uint p = 0; p < proposals.length; p++) {
            if (proposals[p].voteCount > winningVoteCount) {
                winningVoteCount = proposals[p].voteCount;
                winningProposal_ = p;
            }
        }
    }
    
    function winnerName() external view
            returns (bytes32 winnerName_)
    {
        winnerName_ = proposals[winningProposal()].name;
    }
}