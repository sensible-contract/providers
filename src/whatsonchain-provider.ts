import { Balance, Utxo } from "@sensible-contract/abstract-provider";
import { AxiosRequestConfig } from "axios";
import { BaseProvider, NETWORK } from "./base-provider";
import { Http } from "./httpRequest";

async function customGet(
  url: string,
  params: any = {},
  config?: AxiosRequestConfig
) {
  let _res = await Http.getRequest(url, params, null, config);
  return _res.data;
}

async function customPost(
  url: string,
  body: any = {},
  config?: AxiosRequestConfig
) {
  body = JSON.stringify(body);
  let _res = await Http.postRequest(url, {}, body, config);
  return _res.data;
}

export class WhatsOnChainProvider extends BaseProvider {
  apiPrefix: string;
  constructor(network: NETWORK = "mainnet") {
    super(network, "whatsonchain");
    if (network == "mainnet") {
      this.apiPrefix = "https://api.whatsonchain.com/v1/bsv/main";
    } else {
      this.apiPrefix = "https://api.whatsonchain.com/v1/bsv/test";
    }
  }

  async getUtxos(
    address: string,
    queryParams?: { cursor: number; size: number }
  ): Promise<Utxo[]> {
    let _res = await customGet(
      `${this.apiPrefix}/address/${address}/unspent`,
      {}
    );
    return _res.map((v: any) => ({
      txId: v.tx_hash,
      satoshis: v.value,
      outputIndex: v.tx_pos,
      address,
    }));
  }

  async getRawTx(txid: string): Promise<string> {
    let _res = await customGet(`${this.apiPrefix}/tx/${txid}/hex`, {});
    return _res;
  }

  async broadcast(rawtx: string): Promise<string> {
    let _res = await customPost(`${this.apiPrefix}/tx/raw`, { txhex: rawtx });
    return _res;
  }

  async getBalance(address: string): Promise<Balance> {
    let _res = await customGet(
      `${this.apiPrefix}/address/${address}/balance`,
      {}
    );
    return {
      balance: _res.confirmed,
      pendingBalance: _res.unconfirmed,
      utxoCount: _res.utxoCount, //not sure
    };
  }
}
