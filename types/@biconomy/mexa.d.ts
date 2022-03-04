type IRequest = {
  batchId: number;
  batchNonce: number;
  data: string;
  deadline: number;
  from: string;
  to: string;
  token?: string;
  tokenGasPrice?: string;
  txGas?: number;
};

declare module "@biconomy/mexa" {
  export class Biconomy {
    READY: string;
    ERROR: string;
    EIP712_SIGN: string;

    events: any[];
    status: string;
    constructor(
      provider: any,
      options: { apiKey: string; debug?: boolean; strictMode?: boolean }
    );

    onEvent(event: string, callback: () => void): any;

    getSignerByAddress(address: string): any;

    getForwardRequestAndMessageToSign(tx: string): {
      eip712Format: any;
      request: IRequest;
    };

    getEthersProvider(): any;

    isReady(): boolean;
  }
}
