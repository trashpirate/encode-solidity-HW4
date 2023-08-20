import {ApiProperty} from "@nestjs/swagger";

export class MintTokensDTO {
    @ApiProperty({type: String, default: "Wallet Address", required: true}) 
    address: string;
}