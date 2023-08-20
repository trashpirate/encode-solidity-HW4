import {encodeBytes32String} from "ethers";
import {ethers} from "ethers";
import {TokenizedBallot, TokenizedBallot__factory} from "../typechain-types";
import * as dotenv from 'dotenv';
dotenv.config();

async function main() {
    const args = process.argv.slice(2);
    const contractAddress = args[0]
    const blockNumber = args[1];
    const proposals = args.slice(2);

    console.log("Updating Ballot");
    console.log("Proposals: ");
    proposals.forEach((element, index) => {
        console.log(`Proposal N. ${ index + 1 }: ${ element }`);
    });

    const provider = new ethers.JsonRpcProvider(process.env.RPC_ENDPOINT_URL ?? "");
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEYS?.split(',')[0] ?? "", provider);

    console.log(`Using address ${ wallet.address }`);
    const balanceBN = await provider.getBalance(wallet.address);
    const balance = Number(ethers.formatUnits(balanceBN));
    console.log(`Wallet balance ${ balance }`);
    if (balance < 0.01) {
        throw new Error("Not enough ether");
    }

    const ballotFactory = new TokenizedBallot__factory(wallet);
    const ballotContract = ballotFactory.attach(contractAddress) as TokenizedBallot;
    await ballotContract.updateBallot(proposals.map(encodeBytes32String), blockNumber
    );
    for (let index = 0; index < proposals.length; index++) {
        const proposal = await ballotContract.proposals(index);
        const name = ethers.decodeBytes32String(proposal.name);
        console.log({index, name, proposal});
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});