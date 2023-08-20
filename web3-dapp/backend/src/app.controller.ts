import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { AppService } from './app.service';
import {TransactionReceipt} from 'ethers';
import {MintTokensDTO} from './dtos/mintToken.dto';
import {ProposalDTO} from './dtos/ballot.dto';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('get-address')
  getTokenAddress(): any {
    return this.appService.getTokenAddress();
  }
  
  @Get('get-token-abi')
  getTokenABI(): any {
    return this.appService.getTokenABI();
  }

  @Get('get-total-supply')
  getTotalSupply(): Promise<bigint> {
    return this.appService.getTotalSupply();
  }
  
  @Get('get-token-balance')
  getTokenBalance(@Query('address') address: string): Promise<bigint> {
    return this.appService.getTokenBalance(address);
  }
  
  @Get('get-transaction-status')
  getTransactionStatus(@Query('txHash') txHash: string): Promise<number> {
    return this.appService.getTransactionStatus(txHash);
  }
  
  @Get('get-transaction-receipt')
  getTransactionReceipt(@Query('txHash') txHash: string): Promise<TransactionReceipt> {
    return this.appService.getTransactionReceipt(txHash);
  }

  @Post('mint-tokens')
  mintTokens(@Body() receiver: MintTokensDTO): Promise<any> {
    console.log({receiver})
    return this.appService.mintTokens(receiver.address);
  }

  @Get('get-ballot')
  getBallot() : Promise<ProposalDTO[]> {
    return this.appService.getBallot();
  }

  @Get('get-winner')
  getWinner() : Promise<string> {
    return this.appService.getWinner();
  }
}
