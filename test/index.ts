import { Biconomy } from "@biconomy/mexa";
import { Web3Provider } from "@ethersproject/providers";
import {
  MessageTypeProperty,
  MessageTypes,
  signTypedData,
  SignTypedDataVersion,
} from "@metamask/eth-sig-util";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { Wallet } from "ethers";
import { ethers, network } from "hardhat";
import {
  ERC20MetaTransaction,
  ERC20MetaTransaction__factory,
} from "../typechain";
import { ERC20MetaTransactionInterface } from "../typechain/ERC20MetaTransaction";

// Run this tests on rinkeby network

interface MessageTypesCustom extends MessageTypes {
  MetaTransaction: MessageTypeProperty[];
}

const domainType = [
  { name: "name", type: "string" },
  { name: "version", type: "string" },
  { name: "verifyingContract", type: "address" },
  { name: "salt", type: "bytes32" },
];
const metaTransactionType = [
  { name: "nonce", type: "uint256" },
  { name: "from", type: "address" },
  { name: "functionSignature", type: "bytes" },
];

describe("Test", function () {
  let user1: Wallet;
  let user2: SignerWithAddress;
  let contract: ERC20MetaTransaction;
  let contractInterface: ERC20MetaTransactionInterface;
  let ethersProvider: Web3Provider;
  let biconomy;

  this.beforeEach(async () => {
    biconomy = new Biconomy(ethers.getDefaultProvider(), {
      apiKey: process.env.BICONOMY_API_KEY,
      debug: true,
    });

    biconomy
      .onEvent(biconomy.READY, () => {
        // Initialize your dapp here like getting user accounts etc
      })
      .onEvent(biconomy.ERROR, (error, message) => {
        // Handle error while initializing mexa
      });

    ethersProvider = new ethers.providers.Web3Provider(biconomy);

    user1 = new ethers.Wallet(process.env.PRIVATE_KEY);
    [user2] = await ethers.getSigners();

    contract = new ethers.Contract(
      "0xf4b9b8cef70c7cbdd35624cf90bdd4a1abf7e215",
      ERC20MetaTransaction__factory.abi,
      biconomy.getSignerByAddress(user1)
    ) as ERC20MetaTransaction;

    contract.connect(biconomy.getSignerByAddress(user1));
    contractInterface = await contract.interface;
  });

  it("Should return the new ERC20 contract", async function () {
    expect(await contract.balanceOf(user1.address)).to.equal(
      ethers.utils.parseUnits("1000")
    );
    expect(await contract.totalSupply()).to.eq(ethers.utils.parseUnits("1000"));
  });

  it.only("Should transfrerFrom through meta transaciton", async () => {
    let nonce = await contract
      .connect(ethersProvider.getSigner())
      .getNonce(user1.address);
    console.log(nonce);

    let functionSignature = await contractInterface.encodeFunctionData(
      "transferFrom",
      [user1.address, user2.address, ethers.utils.parseUnits("0.0001")]
    );

    let message = {
      nonce: nonce.toNumber(),
      from: user1.address,
      functionSignature,
    };

    const salt = Buffer.from(network.config.chainId.toString());

    const dataToSign = {
      types: {
        EIP712Domain: domainType,
        MetaTransaction: metaTransactionType,
      },
      domain: {
        name: "ERC20MetaTransaction",
        version: "1",
        verifyingContract: contract.address,
        salt,
      },
      primaryType: "MetaTransaction",
      message,
    };

    console.log("aq");
    let signature = signTypedData<SignTypedDataVersion.V3, MessageTypesCustom>({
      privateKey: Buffer.from(process.env.PRIVATE_KEY, "hex"),
      data: dataToSign,
      version: SignTypedDataVersion.V3,
    });

    console.log(signature);
    await signature;

    let { r, s, v } = getSignatureParameters(signature);

    let rawTx = {
      to: contract.address,
      data: contractInterface.encodeFunctionData("executeMetaTransaction", [
        user1.address,
        functionSignature,
        r,
        s,
        v,
      ]),
      from: user1.address,
    };

    const tx = await user1.signTransaction(rawTx);
    console.log(tx);

    let receipt = await ethersProvider.sendTransaction(tx);
    console.log(receipt);
  });

  const getSignatureParameters = (signature) => {
    if (!ethers.utils.isHexString(signature)) {
      throw new Error(
        'Given value "'.concat(signature, '" is not a valid hex string.')
      );
    }
    var r = signature.slice(0, 66);
    var s = "0x".concat(signature.slice(66, 130));
    var v: string | number = "0x".concat(signature.slice(130, 132));
    v = ethers.BigNumber.from(v).toNumber();
    if (![27, 28].includes(v)) v += 27;
    return {
      r: r,
      s: s,
      v: v,
    };
  };
});
