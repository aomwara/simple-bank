import { Tab, Tabs, TabList, TabPanels, TabPanel } from "@chakra-ui/react";

import Deposit from "./Deposit";
import WithDraw from "./Withdraw";

export const Panel = ({ symbol, tokenAddress }) => {
  return (
    <>
      <Tabs variant="enclosed">
        <TabList>
          <Tab>Deposit</Tab>
          <Tab>Withdraw</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            <Deposit symbol={symbol} tokenAddress={tokenAddress} />
          </TabPanel>
          <TabPanel>
            <WithDraw symbol={symbol} tokenAddress={tokenAddress} />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </>
  );
};
