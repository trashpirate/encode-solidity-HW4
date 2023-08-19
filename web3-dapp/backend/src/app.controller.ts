import { Controller, Get, Query } from '@nestjs/common';
import { AppService } from './app.service';
import {TransactionReceipt} from 'ethers';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('get-address')
  getTokenAddress(): string {
    return this.appService.getTokenAddress();
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
}
