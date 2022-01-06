import {
  Balance,
  NftCollection,
  NftUtxo,
  Provider,
  Token,
  TokenBalance,
  TokenUtxo,
  Utxo,
} from "@sensible-contract/abstract-provider";
export type NETWORK = "mainnet" | "testnet";
export type PROVIDER_NAME = "sensiblequery" | "metasv" | "whatsonchain";
export class BaseProvider implements Provider {
  network: "mainnet" | "testnet";
  name: PROVIDER_NAME;
  constructor(network: NETWORK, name: PROVIDER_NAME) {
    this.network = network;
    this.name = name;
  }

  async getRawTx(txid: string): Promise<string> {
    throw new Error(`${this.name} do not support getRawTx`);
  }

  async broadcast(rawtx: string): Promise<string> {
    throw new Error(`${this.name} do not support broadcast`);
  }

  async getIsUtxoSpent(txId: string, outputIndex: number): Promise<boolean> {
    throw new Error(`${this.name} do not support getIsUtxoSpent`);
  }

  async getUtxos(
    address: string,
    queryParams?: { cursor: number; size: number }
  ): Promise<Utxo[]> {
    throw new Error(`${this.name} do not support getUtxos`);
  }

  async getBalance(address: string): Promise<Balance> {
    throw new Error(`${this.name} do not support getBalance`);
  }

  async getTokenUtxos(
    codehash: string,
    genesis: string,
    address: string,
    queryParams?: { cursor: number; size: number }
  ): Promise<TokenUtxo[]> {
    throw new Error(`${this.name} do not support getTokenUtxos`);
  }

  async getTokenBalance(
    codehash: string,
    genesis: string,
    address: string
  ): Promise<TokenBalance> {
    throw new Error(`${this.name} do not support getTokenBalance`);
  }

  async getTokenList(address: string): Promise<Token[]> {
    throw new Error(`${this.name} do not support getTokenList`);
  }

  async getNftUtxos(
    codehash: string,
    genesis: string,
    address: string,
    queryParams?: { cursor: number; size: number }
  ): Promise<NftUtxo[]> {
    throw new Error(`${this.name} do not support getNftUtxos`);
  }

  async getNftUtxo(
    codehash: string,
    genesis: string,
    tokenIndex: string
  ): Promise<NftUtxo> {
    throw new Error(`${this.name} do not support getNftUtxo`);
  }

  async getNftCollectionList(
    address: string,
    queryParams?: { cursor: number; size: number }
  ): Promise<NftCollection[]> {
    throw new Error(`${this.name} do not support getNftCollectionList`);
  }
}
