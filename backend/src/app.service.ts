import { Injectable } from '@nestjs/common';
import {TransactionReceipt, ethers} from 'ethers';
import * as tokenJson from "./assets/MyToken.json";
import * as ballotJson from "./assets/TokenizedBallot.json";
import {ProposalDTO} from "./dtos/ballot.dto"

// contract addresses
const TOKEN_ADDRESS = "0xba45143cC39BA70025d1d125c873Ee548aC0a166";
const BALLOT_ADDRESS = "0xb6347F2A99CB1a431729e9D4F7e946f58E7C35C7";

@Injectable()
export class AppService {

  provider: ethers.Provider;
  wallet: ethers.Wallet;
  tokenContract: ethers.Contract;
  ballotContract: ethers.Contract;

  constructor(){
    this.provider = new ethers.JsonRpcProvider(process.env.RPC_ENDPOINT_URL ?? "");
    this.wallet = new ethers.Wallet(process.env.PRIVATE_KEYS?.split(',')[0] ?? "", this.provider);
    this.tokenContract = new ethers.Contract(TOKEN_ADDRESS, tokenJson.abi, this.wallet);
    this.ballotContract = new ethers.Contract(BALLOT_ADDRESS, ballotJson.abi, this.wallet);
  }

  getHello(): string {
    return 'Hello World!';
  }

  getTokenAddress(): any {
    return {address: TOKEN_ADDRESS};
  }

  getTokenABI(): any {
    return {abi: tokenJson.abi};
  }

  getTotalSupply(): Promise<bigint> {
    return this.tokenContract.totalSupply();
  }

  getTokenBalance(address: string): Promise<bigint> {
    return this.tokenContract.balanceOf(address);
  }
  
  async getTransactionStatus(txHash: string): Promise<number> {
    const txReceipt = await this.provider.getTransactionReceipt(txHash)
    return txReceipt.status;
  }
  
  async getTransactionReceipt(txHash: string): Promise<TransactionReceipt> {
    return await this.provider.getTransactionReceipt(txHash);
  }
  
  async mintTokens(address: string): Promise<any> {
    console.log("Minting transaction to " + address )
    const tx = await this.tokenContract.mint(address, ethers.parseUnits("1"));
    const receipt = await tx.wait()
    console.log(receipt)
    return {success: true, txHash: receipt.hash}
  }

  async getBallot(): Promise<ProposalDTO[]> {
    let ballot: ProposalDTO[] = [];
    const ballotSize = Number(await this.ballotContract.ballotSize());
    const blockNumber = await this.ballotContract.targetBlocknumber();
    for (let index = 0; index < ballotSize; index++) {
        const proposal = await this.ballotContract.proposals(index);
        const name = ethers.decodeBytes32String(proposal.name);
        const voteCount = Number(ethers.formatUnits(proposal.voteCount));
        
        ballot.push({name: name, votes: voteCount, blocknumber: Number(blockNumber)});
    }
    return ballot;
  }

  async getWinner(): Promise<any> {
    const winnerIdx = await this.ballotContract.winningProposal();
    const winningProposal = await this.ballotContract.proposals(winnerIdx);
    const winnerVotes =  Number(ethers.formatUnits(winningProposal.voteCount));
    return {winner: ethers.decodeBytes32String(winningProposal.name), votes: winnerVotes};
  }
}

