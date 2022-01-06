import {
  Balance,
  Token,
  TokenBalance,
  TokenUtxo,
  Utxo,
} from "@sensible-contract/abstract-provider";
import * as bsv from "@sensible-contract/bsv";
import { AxiosRequestConfig } from "axios";
import { BaseProvider } from "./base-provider";
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
export type AuthorizationOption = {
  /**
   * should be provided in MetaSV
   */
  authorization?: string;
  /**
   * should be provided in MetaSV
   */
  privateKey?: string;
};

export class MetaSVProvider extends BaseProvider {
  apiPrefix: string;

  private authorization: string;
  private privateKey: bsv.PrivateKey;
  private publicKey: bsv.PublicKey;

  constructor(
    network: "mainnet" | "testnet" = "mainnet",
    options: AuthorizationOption
  ) {
    super(network, "metasv");
    if (network == "mainnet") {
      this.apiPrefix = "https://apiv2.metasv.com";
    } else {
      throw new Error("metasv do not support testnet");
    }
    this.authorize(options);
  }

  authorize(options: AuthorizationOption) {
    const { authorization, privateKey } = options;

    if (authorization) {
      if (authorization.indexOf("Bearer") != 0) {
        this.authorization = `Bearer ${authorization}`;
      } else {
        this.authorization = authorization;
      }
    } else {
      //https://github.com/metasv/metasv-client-signature
      this.privateKey = new bsv.PrivateKey(privateKey);
      this.publicKey = this.privateKey.toPublicKey();
    }
  }

  private _getHeaders(path: string) {
    let headers = {};
    if (this.authorization) {
      headers = { authorization: this.authorization };
    } else if (this.privateKey) {
      const timestamp = Date.now();
      const nonce = Math.random().toString().substr(2, 10);
      const message = path + "_" + timestamp + "_" + nonce;
      const hash = bsv.crypto.Hash.sha256(Buffer.from(message));
      const sig = bsv.crypto.ECDSA.sign(hash, this.privateKey, "little");
      const sigEncoded = sig.toBuffer().toString("base64");

      headers = {
        "MetaSV-Timestamp": timestamp,
        "MetaSV-Client-Pubkey": this.publicKey.toHex(),
        "MetaSV-Nonce": nonce,
        "MetaSV-Signature": sigEncoded,
      };
    } else {
      throw new Error("MetaSV should be authorized to access api.");
    }
    return headers;
  }

  async getUtxos(
    address: string,
    queryParams?: { cursor: number; size: number }
  ): Promise<Utxo[]> {
    let path = `/address/${address}/utxo`;
    let url = this.apiPrefix + path;
    let _res = await customGet(
      url,
      {},
      {
        headers: this._getHeaders(path),
      }
    );
    let ret: Utxo[] = _res.map((v: any) => ({
      txId: v.txid,
      outputIndex: v.outIndex,
      satoshis: v.value,
      address: address,
    }));
    return ret;
  }

  async getRawTx(txid: string): Promise<string> {
    let path = `/tx/${txid}/raw`;
    let url = this.apiPrefix + path;
    let _res = await customGet(
      url,
      {},
      {
        headers: this._getHeaders(path),
      }
    );
    return _res.hex;
  }

  async broadcast(rawtx: string): Promise<string> {
    let path = `/tx/broadcast`;
    let url = this.apiPrefix + path;
    let _res = await customPost(
      url,
      { hex: rawtx },
      {
        headers: this._getHeaders(path),
      }
    );
    return _res.txid;
  }

  async getBalance(address: string): Promise<Balance> {
    let path = `/address/${address}/balance`;
    let url = this.apiPrefix + path;
    let _res = await customGet(
      url,
      {},
      {
        headers: this._getHeaders(path),
      }
    );
    return {
      balance: _res.confirmed,
      pendingBalance: _res.unconfirmed,
      utxoCount: _res.utxoCount,
    };
  }

  async getIsUtxoSpent(txId: string, outputIndex: number): Promise<boolean> {
    let path = `/outpoint/${txId}/${outputIndex}`;
    let url = this.apiPrefix + path;
    let _res = await customGet(
      url,
      {},
      {
        headers: this._getHeaders(path),
      }
    );
    return _res.spent;
  }

  async getTokenUtxos(
    codehash: string,
    genesis: string,
    address: string,
    queryParams?: { cursor: number; size: number }
  ): Promise<TokenUtxo[]> {
    let path = `/sensible/ft/address/${address}/utxo`;
    let url = this.apiPrefix + path;
    let _res: any = await customGet(
      url,
      {
        codeHash: codehash,
        genesis,
      },
      {
        headers: this._getHeaders(path),
      }
    );

    let ret: TokenUtxo[] = _res.map((v) => ({
      txId: v.txid,
      outputIndex: v.txIndex,
      tokenAddress: address,
      tokenAmount: v.valueString,
    }));
    return ret;
  }

  async getTokenBalance(
    codehash: string,
    genesis: string,
    address: string
  ): Promise<TokenBalance> {
    let path = `/sensible/ft/address/${address}/balance`;
    let url = this.apiPrefix + path;

    let _res: any = await customGet(
      url,
      { codeHash: codehash, genesis },
      { headers: this._getHeaders(path) }
    );

    let ret: TokenBalance = {
      balance: "0",
      pendingBalance: "0",
      utxoCount: 0,
      decimal: 0,
    };
    if (_res.length > 0) {
      ret = {
        balance: _res[0].confirmedString,
        pendingBalance: _res[0].unconfirmedString,
        utxoCount: _res[0].utxoCount,
        decimal: _res[0].decimal,
      };
    }
    return ret;
  }

  async getTokenList(
    address: string,
    queryParams?: { cursor: number; size: number }
  ): Promise<Token[]> {
    let path = `/sensible/ft/address/${address}/balance`;
    let url = this.apiPrefix + path;

    let _res: any[] = await customGet(
      url,
      {},
      { headers: this._getHeaders(path) }
    );

    let ret: Token[] = _res.map((v: any) => ({
      codehash: v.codeHash,
      genesis: v.genesis,
      sensibleId: v.sensibleId,
      name: v.name,
      symbol: v.symbol,
      decimal: v.decimal,
      balance: v.confirmedString,
      pendingBalance: v.unconfirmedString,
    }));
    return ret;
  }
}
