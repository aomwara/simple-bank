import { useState, useEffect, useCallback } from "react";
import Web3 from "web3";
import CountUp from "react-countup";
import { useBank, useERC20Utils } from "hooks/useContracts";
import { Text, Box } from "@chakra-ui/react";

const TVD = ({ symbol, tokenAddress }) => {
  const Bank = useBank();
  const ERC20Utils = useERC20Utils();
  const [tvd, setTVD] = useState(0);

  const loadTVD = useCallback(async () => {
    console.log("Token =" + tokenAddress);
    const _tvd = await ERC20Utils.methods
      .balanceOf(tokenAddress, Bank.address)
      .call();

    setTVD(Web3.utils.fromWei(_tvd.toString()));
  }, [ERC20Utils.methods, tokenAddress, Bank.address]);

  useEffect(() => {
    loadTVD();
  }, [loadTVD]);

  return (
    <>
      {tvd > 0 && (
        <Box>
          <Text fontSize="xl">
            <b>Total Value Deposited</b>
          </Text>
          <Text fontSize={{ base: "3xl", md: "5xl", lg: "5xl" }}>
            <CountUp duration={1} end={tvd} separator="," />
            <font size="6">{" " + symbol}</font>
          </Text>
        </Box>
      )}
    </>
  );
};

export default TVD;
