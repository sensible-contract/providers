import { SensiblequeryProvider } from "./sensiblequery-provider";

function getDefaultProvider(): SensiblequeryProvider {
  return new SensiblequeryProvider();
}

export {
  SensiblequeryProvider,
  ///////////////////////
  // Functions
  getDefaultProvider,
};
