import { Injectable } from '@nestjs/common';
import {TransactionReceipt, ethers} from 'ethers';
import * as tokenJson from "./assets/MyToken.json"

const TOKEN_ADDRESS = "0xba45143cC39BA70025d1d125c873Ee548aC0a166";

@Injectable()
export class AppService {

  provider: ethers.Provider;
  wallet: ethers.Wallet;
  contract: ethers.Contract;

  constructor(){
    this.provider = new ethers.JsonRpcProvider(process.env.RPC_ENDPOINT_URL ?? "");
    this.wallet = new ethers.Wallet(process.env.PRIVATE_KEYS?.split(',')[0] ?? "", this.provider);
    this.contract = new ethers.Contract(TOKEN_ADDRESS, tokenJson.abi, this.wallet);
  }

  getHello(): string {
    return 'Hello World!';
  }

  getTokenAddress(): string {
    return TOKEN_ADDRESS;
  }

  getTotalSupply(): Promise<bigint> {
    return this.contract.totalSupply();
  }

  getTokenBalance(address: string): Promise<bigint> {
    return this.contract.balanceOf(address);
  }
  
  async getTransactionStatus(txHash: string): Promise<number> {
    const txReceipt = await this.provider.getTransactionReceipt(txHash)
    return txReceipt.status;
  }
  
  async getTransactionReceipt(txHash: string): Promise<TransactionReceipt> {
    return await this.provider.getTransactionReceipt(txHash);
  }
  
}

