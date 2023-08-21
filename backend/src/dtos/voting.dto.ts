import {ApiProperty} from "@nestjs/swagger";

export class VotingDTO {
    @ApiProperty({type: String, default: "Wallet Address", required: true}) 
    address: string;
}