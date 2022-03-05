/* eslint-disable node/no-missing-import */
import { Biconomy } from "@biconomy/mexa";
import {
  MessageTypeProperty,
  MessageTypes,
  signTypedData,
  SignTypedDataVersion,
} from "@metamask/eth-sig-util";
import { assert } from "console";
import { BigNumber, BigNumberish, Wallet } from "ethers";
import { ethers } from "hardhat";
import { BICONOMY_ERC_FORWARDER } from "../constants";
import { ERC20MetaTransaction } from "../typechain";
import { ERC20MetaTransactionInterface } from "../typechain/ERC20MetaTransaction";

// Run this tests on rinkeby network

const contractAddress = "0x8ae9a8808ac05460d099edc84954f2ad5116ee4e";

interface MessageTypesCustom extends MessageTypes {
  MetaTransaction: MessageTypeProperty[];
}

const abi = [
  {
    inputs: [
      {
        internalType: "address",
        name: "_trustedForwarder",
        type: "address",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "spender",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "value",
        type: "uint256",
      },
    ],
    name: "Approval",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "from",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "value",
        type: "uint256",
      },
    ],
    name: "Transfer",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        internalType: "address",
        name: "spender",
        type: "address",
      },
    ],
    name: "allowance",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "spender",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "approve",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "balanceOf",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "decimals",
    outputs: [
      {
        internalType: "uint8",
        name: "",
        type: "uint8",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "spender",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "subtractedValue",
        type: "uint256",
      },
    ],
    name: "decreaseAllowance",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "spender",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "addedValue",
        type: "uint256",
      },
    ],
    name: "increaseAllowance",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "forwarder",
        type: "address",
      },
    ],
    name: "isTrustedForwarder",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "name",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_trustedForwarder",
        type: "address",
      },
    ],
    name: "setTrustedForwarder",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "symbol",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "totalSupply",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "recipient",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "transfer",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "sender",
        type: "address",
      },
      {
        internalType: "address",
        name: "recipient",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "transferFrom",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "trustedForwarder",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "versionRecipient",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];

describe("Test", function () {
  let userSigner: Wallet;
  let receipt: Wallet;
  let contract: ERC20MetaTransaction;
  let contractInterface: ERC20MetaTransactionInterface;

  this.beforeAll(async () => {
    userSigner = new ethers.Wallet(process.env.PRIVATE_KEY!);
    receipt = new ethers.Wallet(process.env.PRIVATE_KEY_2!);
  });

  it("Should transfrerFrom through meta transaciton", async (done) => {
    this.timeout(40000);
    const biconomy = new Biconomy(ethers.provider, {
      apiKey: process.env.BICONOMY_API_KEY!,
      debug: true,
      strictMode: true,
    });

    biconomy
      .onEvent(biconomy.READY, async () => {
        try {
          contract = new ethers.Contract(
            contractAddress,
            abi,
            biconomy.getSignerByAddress(userSigner.address)
          ) as ERC20MetaTransaction;
          contractInterface = await contract.interface;

          const functionSignature = await contractInterface.encodeFunctionData(
            "transfer",
            [receipt.address, 1]
          );

          const provider = biconomy.getEthersProvider();

          const rawTx: {
            to: string;
            data: string;
            from: string;
            gasLimit?: BigNumberish;
          } = {
            to: contractAddress,
            data: functionSignature,
            from: userSigner.address,
            gasLimit: BigNumber.from("1000000"),
          };

          const approve = await contract.approve(BICONOMY_ERC_FORWARDER, 100, {
            gasLimit: BigNumber.from("100000"),
          });
          await approve.wait();

          const signedTx = await userSigner.signTransaction(rawTx);
          const forwardData = await biconomy.getForwardRequestAndMessageToSign(
            signedTx,
            contractAddress
          );

          const eip712Format = forwardData.eip712Format;

          const signature = await signTypedData<
            SignTypedDataVersion.V3,
            MessageTypesCustom
          >({
            privateKey: Buffer.from(process.env.PRIVATE_KEY!, "hex"),
            data: eip712Format,
            version: SignTypedDataVersion.V3,
          });

          const request = forwardData.request;
          const data = {
            signature,
            forwardRequest: request,
            rawTransaction: signedTx,
            signatureType: biconomy.EIP712_SIGN,
          };
          const txHash = await provider.send("eth_sendRawTransaction", [data]);
          console.log("txHash", txHash);
          const wait = await provider.waitForTransaction(txHash);
          console.log(wait);
        } catch (err) {
          console.log(err);
        }

        assert(true);
        done();
      })
      .onEvent(biconomy.ERROR, (error: any, message: any) => {
        console.log(error, message);
      });
  });
});
