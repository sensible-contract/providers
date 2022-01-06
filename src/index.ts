import { Provider } from "@sensible-contract/abstract-provider";
import { NETWORK } from "./base-provider";
import { MetaSVProvider } from "./metasv-provider";
import { SensiblequeryProvider } from "./sensiblequery-provider";
import { WhatsOnChainProvider } from "./whatsonchain-provider";

function getDefaultProvider(network?: NETWORK, options?: any): Provider {
  return new SensiblequeryProvider(network);
}

export {
  SensiblequeryProvider,
  MetaSVProvider,
  WhatsOnChainProvider,
  ///////////////////////
  // Functions
  getDefaultProvider,
};
