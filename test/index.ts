/* eslint-disable node/no-missing-import */
import { Biconomy } from "@biconomy/mexa";
import {
  MessageTypeProperty,
  MessageTypes,
  signTypedData,
  SignTypedDataVersion,
} from "@metamask/eth-sig-util";
import { expect } from "chai";
import { assert } from "console";
import { BigNumber, BigNumberish, Wallet } from "ethers";
import { ethers, network } from "hardhat";
import contractJSon from "../artifacts/contracts/ERC20MetaTransaction.sol/ERC20MetaTransaction.json";
import { BICONOMY_ERC_FORWARDER } from "../constants";
import { ERC20MetaTransaction } from "../typechain";
import { ERC20MetaTransactionInterface } from "../typechain/ERC20MetaTransaction";

// Run this tests on rinkeby network
const contractAddress = "0x8ae9a8808ac05460d099edc84954f2ad5116ee4e";

interface MessageTypesCustom extends MessageTypes {
  MetaTransaction: MessageTypeProperty[];
}

describe("Test", function () {
  let userSigner: Wallet;
  let receipt: Wallet;
  let contract: ERC20MetaTransaction;
  let contractInterface: ERC20MetaTransactionInterface;
  let biconomy: Biconomy;
  this.beforeAll(async () => {
    userSigner = new ethers.Wallet(process.env.PRIVATE_KEY!);
    receipt = new ethers.Wallet(process.env.PRIVATE_KEY_2!);

    biconomy = new Biconomy(ethers.provider, {
      apiKey: process.env.BICONOMY_API_KEY!,
      debug: true,
      strictMode: true,
    });

    if (network.name !== "rinkeby") {
      throw new Error("Contract is deployed only to rinkeby");
    }
  });

  it("Should transfer through meta transaciton", (done) => {
    // its necessary because biconomy SDK uses event emitter with callbacks
    this.timeout(40000);

    biconomy
      .onEvent(biconomy.READY, async () => {
        try {
          contract = new ethers.Contract(
            contractAddress,
            contractJSon.abi,
            biconomy.getSignerByAddress(userSigner.address)
          ) as ERC20MetaTransaction;
          contractInterface = await contract.interface;

          const balanceBefore = await contract.balanceOf(receipt.address);

          const functionSignature = await contractInterface.encodeFunctionData(
            "transfer",
            [receipt.address, ethers.utils.parseEther("1")]
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
          await provider.waitForTransaction(txHash);

          const balanfeAfter = await contract.balanceOf(receipt.address);

          expect(balanfeAfter.sub(balanceBefore)).to.be.eq(
            ethers.utils.parseEther("1")
          );
        } catch (err) {
          console.log(err);
          assert(false, err);
        }

        done();
      })
      .onEvent(biconomy.ERROR, (error: any, message: any) => {
        console.log(error, message);
        assert(false, error);
      });
  });
});
