import { Box, Text, Grid, GridItem } from "@chakra-ui/react";
import { useBank } from "hooks/useContracts";
import useAccount from "hooks/useAccount";
import { useState, useEffect, useCallback } from "react";
import Web3 from "web3";

const Portfolio = ({ token, symbol }) => {
  const account = useAccount();
  const Bank = useBank();

  const [balance, setBalance] = useState(0);

  const getBalance = useCallback(async () => {
    const _balance = await Bank.methods.balanceOf(account).call();

    setBalance(Web3.utils.fromWei(_balance, "ether"));
  }, [Bank.methods, account]);

  useEffect(() => {
    getBalance();
  }, [getBalance]);

  return (
    <>
      {balance > 0 && (
        <Box mt={5}>
          <Text fontSize="xl">
            <b>Your Balance</b>
          </Text>
          <Box p={4} mt={3} className="portfolio-box">
            <Grid
              templateColumns="repeat(12, 1fr)"
              style={{ textAlign: "left" }}
              gap={6}
            >
              <GridItem colSpan={12} style={{ textAlign: "center" }}>
                <Box>
                  {parseFloat(balance).toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}{" "}
                  {symbol}
                </Box>
              </GridItem>
            </Grid>
          </Box>
        </Box>
      )}
    </>
  );
};

export default Portfolio;
