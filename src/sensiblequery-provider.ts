import { Provider } from "@sensible-contract/abstract-provider";
import { SensibleApi } from "@sensible-contract/sensible-api";
import { ModelNFTAuctionResp } from "@sensible-contract/sensible-api/lib/sensiblequery/types";

export class SensiblequeryProvider extends SensibleApi implements Provider {
  network: "mainnet" | "testnet";
  constructor(network: "mainnet" | "testnet" = "mainnet") {
    super();
    this.network = network;
  }

  async getIsUtxoSpent(txId: string, outputIndex: number) {
    let _res = await this.getTxOutSpent(txId, outputIndex);
    if (_res) {
      return true;
    } else {
      return false;
    }
  }

  //implement NftAuctionProvider
  async getNftAuctionUtxo(codehash: string, nftid: string) {
    let _res = await this.getNftAuctionUtxoDetails(codehash, nftid, false);
    let detail = _res[0] as ModelNFTAuctionResp;
    if (detail) {
      return {
        txId: detail.txid,
        outputIndex: detail.vout,
      };
    }
  }
}
