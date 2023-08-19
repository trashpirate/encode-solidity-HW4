import { useState } from "react";
import styles from "./instructionsComponent.module.css";
import {
  useAccount,
  useBalance,
  useContractRead,
  useContractReads,
  useNetwork,
  useSignMessage,
} from "wagmi";
import { walletActions } from "viem/dist/types/clients/decorators/wallet";
import { json } from "stream/consumers";
import exp from "constants";
import { abi } from "./token";

export default function InstructionsComponent() {
  return (
    <div className={styles.container}>
      <header className={styles.header_container}>
        <div className={styles.header}>
          <h1>My App</h1>
        </div>
      </header>
      <div className={styles.get_started}>
        <PageBody></PageBody>
      </div>
    </div>
  );
}

function PageBody() {
  return (
    <div>
      <WalletInfo></WalletInfo>
    </div>
  );
}

function WalletInfo() {
  const { address, isConnecting, isReconnecting, isConnected, isDisconnected } = useAccount();
  const { chain } = useNetwork();
  if (isConnected && address)
    return (
      <div>
        <p>Account Address: {address}</p>
        <p>Network: {chain?.name}</p>
        <WalletAction></WalletAction>
        <WalletBalance address={address}></WalletBalance>
        <TokenInfo address={address}></TokenInfo>
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

function TokenName() {
  const { data, isError, isLoading } = useContractRead({
    address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    abi: [
      {
        constant: true,
        inputs: [],
        name: "name",
        outputs: [
          {
            name: "",
            type: "string",
          },
        ],
        payable: false,
        stateMutability: "view",
        type: "function",
      },
    ],
    functionName: "name",
  });

  const name = typeof data === "string" ? data : 0;

  if (isLoading) return <div>Fetching name…</div>;
  if (isError) return <div className={styles.error_message}>Contract name not availalbe.</div>;
  return <div>{name}</div>;
}

function TokenSymbol() {
  const { data, isError, isLoading } = useContractRead({
    address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    abi: [
      {
        constant: true,
        inputs: [],
        name: "symbol",
        outputs: [
          {
            name: "",
            type: "string",
          },
        ],
        payable: false,
        stateMutability: "view",
        type: "function",
      },
    ],
    functionName: "symbol",
  });

  const symbol = typeof data === "string" ? data : 0;

  if (isLoading) return <div>Fetching symbol…</div>;
  if (isError) return <div className={styles.error_message}>Contract symbol not availalbe.</div>;
  return <div>{symbol}</div>;
}

function TokenBalance(params: { address: `0x${string}` }) {
  const { data, isError, isLoading } = useContractRead({
    address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    abi: [
      {
        constant: true,
        inputs: [
          {
            name: "_owner",
            type: "address",
          },
        ],
        name: "balanceOf",
        outputs: [
          {
            name: "balance",
            type: "uint256",
          },
        ],
        payable: false,
        stateMutability: "view",
        type: "function",
      },
    ],
    functionName: "balanceOf",
    args: [params.address],
  });

  const balance = typeof data === "number" ? data : 0;

  if (isLoading) return <div>Fetching balance…</div>;
  if (isError) return <div>Error fetching balance</div>;
  return <div>{balance}</div>;
}

function TokenInfo(params: { address: `0x${string}` }) {
  const contractAddress = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
  const abi = [
    {
      constant: true,
      inputs: [],
      name: "name",
      outputs: [
        {
          name: "",
          type: "string",
        },
      ],
      payable: false,
      stateMutability: "view",
      type: "function",
    },
    {
      constant: true,
      inputs: [],
      name: "symbol",
      outputs: [
        {
          name: "",
          type: "string",
        },
      ],
      payable: false,
      stateMutability: "view",
      type: "function",
    },
    {
      constant: true,
      inputs: [
        {
          name: "_owner",
          type: "address",
        },
      ],
      name: "balanceOf",
      outputs: [
        {
          name: "balance",
          type: "uint256",
        },
      ],
      payable: false,
      stateMutability: "view",
      type: "function",
    },
  ] as const;

  const { data, isError, isLoading } = useContractReads({
    contracts: [
      {
        address: contractAddress,
        abi: abi,
        functionName: "name",
      },
      {
        address: contractAddress,
        abi: abi,
        functionName: "symbol",
      },
      {
        address: contractAddress,
        abi: abi,
        functionName: "balanceOf",
        args: [params.address],
      },
    ],
  });
  console.log(data);
  const name = typeof data?.[0]?.result === "string" ? data?.[0]?.result : 0;
  const symbol = typeof data?.[1]?.result === "string" ? data?.[1]?.result : 0;
  // const symbol = typeof data === "string" ? data : 0;
  const balance = typeof data?.[2]?.result === "number" ? data?.[2]?.result : 0;

  if (isLoading) return <div>Fetching balance…</div>;
  if (isError) return <div>Error fetching contract data</div>;
  const outputString = `${name} Balance: ${balance} ${symbol}`;
  return <div>{outputString}</div>;
}
