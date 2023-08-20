import { useEffect, useState } from "react";
import styles from "./instructionsComponent.module.css";
import {
  useAccount,
  useBalance,
  useContractReads,
  useContractWrite,
  useNetwork,
  usePrepareContractWrite,
  useSignMessage,
  useWaitForTransaction,
} from "wagmi";
import { tokenABI } from "../../app/assets/tokenABI";
import { ballotABI } from "../../app/assets/ballotABI";
import { formatUnits, parseUnits } from "viem";

const TOKEN_ADDRESS = "0xba45143cC39BA70025d1d125c873Ee548aC0a166";
const BALLOT_ADDRESS = "0xb6347F2A99CB1a431729e9D4F7e946f58E7C35C7";

export default function InstructionsComponent() {
  return (
    <div className={styles.container}>
      <header className={styles.header_container}></header>
      <div className={styles.get_started}>
        <PageBody></PageBody>
      </div>
    </div>
  );
}

function PageBody() {
  return (
    <div>
      <BallotInfo></BallotInfo>
      <BallotWinner></BallotWinner>
      <WalletInfo></WalletInfo>
      <Delegate></Delegate>
      <Vote></Vote>
    </div>
  );
}

// wallet info
function WalletInfo() {
  const { address, isConnecting, isReconnecting, isConnected, isDisconnected } = useAccount();
  const { chain } = useNetwork();
  if (isConnected && address)
    return (
      <div>
        <div className={styles.wallet_info}>
          <p>Account Address: {address}</p>
          <p>Network: {chain?.name}</p>
          <WalletBalance address={address}></WalletBalance>
          <TokenInfo address={address}></TokenInfo>
          <RequestTokensToBeMinted address={address}></RequestTokensToBeMinted>
        </div>

        <div className={styles.voting_power}>
          <VotingPowerInfo address={address}></VotingPowerInfo>
        </div>
      </div>
    );
  if (isConnecting || isReconnecting)
    return (
      <div>
        <p>Loading...</p>
      </div>
    );
  if (isDisconnected)
    return (
      <div>
        <p>Wallet disconnected. Connect wallet to continue</p>
      </div>
    );
  return (
    <div>
      <p>Connect wallet to continue</p>
    </div>
  );
}

function WalletBalance(params: { address: `0x${string}` }) {
  const { data, isError, isLoading } = useBalance({
    address: params.address,
  });

  if (isLoading) return <div>Fetching balance…</div>;
  if (isError) return <div className={styles.error_message}>Error fetching balance</div>;
  return (
    <div className={styles.wallet_balance}>
      ETH Balance: {data?.formatted} {data?.symbol}
    </div>
  );
}

function TokenInfo(params: { address: `0x${string}` }) {
  const { data, isError, isLoading } = useContractReads({
    contracts: [
      {
        address: TOKEN_ADDRESS,
        abi: tokenABI,
        functionName: "name",
      },
      {
        address: TOKEN_ADDRESS,
        abi: tokenABI,
        functionName: "symbol",
      },
      {
        address: TOKEN_ADDRESS,
        abi: tokenABI,
        functionName: "balanceOf",
        args: [params.address],
      },
    ],
  });

  const name = typeof data?.[0]?.result === "string" ? data?.[0]?.result : 0;
  const symbol = typeof data?.[1]?.result === "string" ? data?.[1]?.result : 0;
  const balance = typeof data?.[2]?.result === "bigint" ? formatUnits(data?.[2]?.result, 18) : 0;

  if (isLoading) return <div>Fetching balance…</div>;
  if (isError) return <div>Error fetching contract data</div>;
  const outputString = `${name} Balance: ${balance} ${symbol}`;
  return <div>{outputString}</div>;
}

function RequestTokensToBeMinted(params: { address: `0x${string}` }) {
  const [data, setData] = useState<any>(null);
  const [isLoading, setLoading] = useState(false);

  const requestOptions = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ address: params.address }),
  };

  if (isLoading) return <p>Requesting tokens from API...</p>;
  if (!data)
    return (
      <button
        className={styles.button}
        disabled={isLoading}
        onClick={() => {
          setLoading(true);
          fetch("http://localhost:3001/mint-tokens", requestOptions)
            .then((res) => res.json())
            .then((data) => {
              setData(data);
              setLoading(false);
            });
        }}
      >
        Request Tokens
      </button>
    );

  let txLink: string = `https://sepolia.etherscan.io/tx/${data.txHash}`;
  return (
    <div>
      <p>{data.success ? "Token Request successful!" : "Token Request failed."}</p>
      <div className={styles.txHash}>
        <a href={`https://sepolia.etherscan.io/tx/${data.txHash}`}>View on Etherscan</a>
      </div>
    </div>
  );
}

// voting power
function VotingPowerInfo(params: { address: `0x${string}` }) {
  const { data, isError, isLoading } = useContractReads({
    contracts: [
      {
        address: BALLOT_ADDRESS,
        abi: ballotABI,
        functionName: "votingPower",
        args: [params.address],
      },
    ],
  });

  const votingPower =
    typeof data?.[0]?.result === "bigint" ? formatUnits(data?.[0]?.result, 18) : 0;

  if (isLoading) return <div>Fetching voting power…</div>;
  if (isError) return <div>Error fetching contract data.</div>;
  const outputString = `Your Voting Power: ${votingPower}`;
  return <div>{outputString}</div>;
}

// ballot info
function BallotInfo() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:3001/get-ballot")
      .then((res) => res.json())
      .then((data) => {
        setData(data);
        setLoading(false);
      });
  }, []);

  if (isLoading) return <p>Loading Ballot from API...</p>;
  if (!data) return <p>No response from API.</p>;

  return (
    <div>
      <h2>Active Ballot</h2>
      <h4>Current Results:</h4>
      <ul className={styles.proposal_list}>
        {data.map((proposal: any, index: number) => (
          <li className={styles.proposal_item} key={index}>
            <div> {`${proposal.name}:`}</div>
            <div>{` ${proposal.votes} votes`} </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function BallotWinner() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:3001/get-winner")
      .then((res) => res.json())
      .then((data) => {
        setData(data);
        setLoading(false);
      });
  }, []);
  if (isLoading) return <p>Loading Winner from API...</p>;
  if (!data) return <p>No response from API.</p>;

  return (
    <div>
      <div>
        {data.votes == 0
          ? `No one has votes yet.`
          : `Current Winner: ${data.winner} with ${data.votes} votes.`}
      </div>
    </div>
  );
}

//voting
function Delegate() {
  const [delegateAddress, setDelegateAddress] = useState("");

  const { config } = usePrepareContractWrite({
    address: TOKEN_ADDRESS,
    abi: tokenABI,
    functionName: "delegate",
    args: [delegateAddress as `0x${string}`],
  });
  const { data, error, isError, write } = useContractWrite(config);

  const { isLoading, isSuccess } = useWaitForTransaction({
    hash: data?.hash,
  });

  return (
    <div>
      <div>
        <form>
          <label>
            Delegate votes to:
            <input
              className={styles.form}
              type="string"
              value={delegateAddress}
              placeholder="0"
              onChange={(e) => setDelegateAddress(e.target.value)}
            />
          </label>
        </form>
      </div>
      <button className={styles.button} disabled={!write || isLoading} onClick={() => write?.()}>
        {isLoading ? "Delegating.." : "Delegate"}
      </button>
      {isSuccess && (
        <div>
          Successfully Delegated!
          <div className={styles.txHash}>
            <a href={`https://sepolia.etherscan.io/tx/${data?.hash}`}>View on Etherscan</a>
          </div>
        </div>
      )}
      {isError && <div>Error: {error?.message}Error occured.</div>}
    </div>
  );
}

function Vote() {
  const [proposalValue, setProposalValue] = useState("");
  const [votingAmount, setVotingAmount] = useState("");

  const { config } = usePrepareContractWrite({
    address: BALLOT_ADDRESS,
    abi: ballotABI,
    functionName: "vote",
    args: [BigInt(proposalValue), parseUnits(`${Number(votingAmount)}`, 18)],
  });
  const { data, error, isError, write } = useContractWrite(config);

  const { isLoading, isSuccess } = useWaitForTransaction({
    hash: data?.hash,
  });

  return (
    <div>
      <form>
        <label>
          Enter Proposal Number:
          <input
            className={styles.form}
            type="number"
            value={proposalValue}
            placeholder="0"
            onChange={(e) => setProposalValue(e.target.value)}
          />
        </label>
      </form>
      <form>
        <label>
          Enter Voting Amount:
          <input
            className={styles.form}
            type="number"
            value={votingAmount}
            placeholder="0"
            onChange={(e) => setVotingAmount(e.target.value)}
          />
        </label>
      </form>
      <button className={styles.button} disabled={!write || isLoading} onClick={() => write?.()}>
        {isLoading ? "Voting..." : "Vote"}
      </button>
      {isSuccess && (
        <div>
          Successfully Voted!
          <div className={styles.txHash}>
            <a href={`https://sepolia.etherscan.io/tx/${data?.hash}`}>View on Etherscan</a>
          </div>
        </div>
      )}
      {isError && <div>Error: {error?.message}Error occured.</div>}
    </div>
  );
}

// unused components
function RandomProfile() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    fetch("https://randomuser.me/api/")
      .then((res) => res.json())
      .then((data) => {
        setData(data.results[0]);
        setLoading(false);
      });
  }, []);

  if (isLoading) return <p>Loading...</p>;
  if (!data) return <p>No profile data</p>;

  return (
    <div className={styles.profile_container}>
      <h1>
        Name: {data.name.title} {data.name.first} {data.name.last}
      </h1>
      <p>Email: {data.email}</p>
    </div>
  );
}

function TokenAddressFromAPI() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:3001/get-address")
      .then((res) => res.json())
      .then((data) => {
        setData(data);
        setLoading(false);
      });
  }, []);

  if (isLoading) return <p>Loading token address from API...</p>;
  if (!data) return <p>No response from API</p>;

  return (
    <div className={styles.profile_container}>
      <p>Token Address: {data.address}</p>
    </div>
  );
}

function WalletAction() {
  const [signatureMessage, setSignatureMessage] = useState("");

  const { data, isError, isLoading, isSuccess, signMessage } = useSignMessage();
  return (
    <div>
      <form>
        <label>
          Enter the message to be signed:
          <input
            className={styles.form}
            type="text"
            value={signatureMessage}
            placeholder="Enter your message here!"
            onChange={(e) => setSignatureMessage(e.target.value)}
          />
        </label>
      </form>
      <button
        className={styles.button}
        disabled={isLoading}
        onClick={() =>
          signMessage({
            message: signatureMessage,
          })
        }
      >
        Sign message
      </button>
      {isSuccess && <div className={styles.mmresponse}>Signature: {data}</div>}
      {isError && <div className={styles.error_message}>Error signing message</div>}
    </div>
  );
}

