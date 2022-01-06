import {
  Balance,
  NftCollection,
  NftUtxo,
  Token,
  TokenBalance,
  TokenUtxo,
  Utxo,
} from "@sensible-contract/abstract-provider";
import { SensibleApi } from "@sensible-contract/sensible-api";
import { ModelNFTAuctionResp } from "@sensible-contract/sensible-api/lib/sensiblequery/types";
import { BaseProvider, NETWORK } from "./base-provider";

export class SensiblequeryProvider extends BaseProvider {
  sensibleApi: SensibleApi;
  constructor(network: NETWORK = "mainnet", apiPrefix?: string) {
    super(network, "sensiblequery");
    if (!apiPrefix) {
      if (network == "mainnet") {
        apiPrefix = "https://api.sensiblequery.com";
      } else {
        apiPrefix = "https://api.sensiblequery.com/test";
      }
    }
    this.sensibleApi = new SensibleApi(apiPrefix);
  }

  getUtxos(
    address: string,
    queryParams?: { cursor: number; size: number }
  ): Promise<Utxo[]> {
    return this.sensibleApi.getUtxos(address, queryParams);
  }

  getBalance(address: string): Promise<Balance> {
    return this.sensibleApi.getBalance(address);
  }

  getRawTx(txid: string): Promise<string> {
    return this.sensibleApi.getRawTx(txid);
  }

  broadcast(rawtx: string): Promise<string> {
    return this.sensibleApi.broadcast(rawtx);
  }

  getTokenUtxos(
    codehash: string,
    genesis: string,
    address: string,
    queryParams?: { cursor: number; size: number }
  ): Promise<TokenUtxo[]> {
    return this.sensibleApi.getTokenUtxos(
      codehash,
      genesis,
      address,
      queryParams
    );
  }

  getTokenBalance(
    codehash: string,
    genesis: string,
    address: string
  ): Promise<TokenBalance> {
    return this.sensibleApi.getTokenBalance(codehash, genesis, address);
  }

  async getTokenList(
    address: string,
    queryParams?: {
      cursor: number;
      size: number;
    }
  ): Promise<Token[]> {
    let _res = await this.sensibleApi.getTokenList(address, queryParams);
    return _res.list.map((v) => ({
      codehash: v.codehash,
      genesis: v.genesis,
      sensibleId: v.sensibleId,
      name: v.name,
      symbol: v.symbol,
      decimal: v.decimal,
      balance: v.balance,
      pendingBalance: v.pendingBalance,
    }));
  }

  async getNftUtxos(
    codehash: string,
    genesis: string,
    address: string,
    queryParams?: { cursor: number; size: number }
  ): Promise<NftUtxo[]> {
    let _res = await this.sensibleApi.getNftUtxoDatas(
      codehash,
      genesis,
      address,
      queryParams
    );
    let utxos: NftUtxo[] = _res.utxo.map((v) => ({
      txId: v.txid,
      outputIndex: v.vout,
      tokenIndex: v.tokenIndex,
      tokenAddress: v.address,
      metaTxId: v.metaTxId,
      metaOutputIndex: v.metaOutputIndex,
    }));
    return utxos;
  }

  async getNftUtxo(
    codehash: string,
    genesis: string,
    tokenIndex: string
  ): Promise<NftUtxo> {
    let _res = await this.sensibleApi.getNftUtxoDetail(
      codehash,
      genesis,
      tokenIndex
    );
    return {
      txId: _res.txid,
      outputIndex: _res.vout,
      tokenIndex: _res.tokenIndex,
      tokenAddress: _res.address,
      metaTxId: _res.metaTxId,
      metaOutputIndex: _res.metaOutputIndex,
    };
  }

  async getNftCollectionList(
    address: string,
    queryParams?: { cursor: number; size: number }
  ): Promise<NftCollection[]> {
    let _res = await this.sensibleApi.getNftSummary(address, queryParams);
    return _res.map((v) => ({
      codehash: v.codehash,
      genesis: v.genesis,
      sensibleId: v.sensibleId,
      count: (v.count + v.pendingCount).toString(),
    }));
  }

  async getIsUtxoSpent(txId: string, outputIndex: number) {
    let _res = await this.sensibleApi.getTxOutSpent(txId, outputIndex);
    if (_res) {
      return true;
    } else {
      return false;
    }
  }

  //implement NftAuctionProvider
  async getNftAuctionUtxo(codehash: string, nftid: string) {
    let _res = await this.sensibleApi.getNftAuctionUtxoDetails(
      codehash,
      nftid,
      false
    );
    let detail = _res[0] as ModelNFTAuctionResp;
    if (detail) {
      return {
        txId: detail.txid,
        outputIndex: detail.vout,
      };
    }
  }
}
