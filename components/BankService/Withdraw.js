import { useState, useEffect, useCallback } from "react";
import Web3 from "web3";

import useAccount from "hooks/useAccount";
import { useBank, useERC20Utils } from "hooks/useContracts";

import {
  Grid,
  GridItem,
  Select,
  FormControl,
  Input,
  Button,
  InputRightElement,
  Spinner,
  InputGroup,
  useToast,
} from "@chakra-ui/react";

import Portfolio from "./Portfolio";

const WithDraw = ({ symbol, tokenAddress }) => {
  const toast = useToast();

  //initialize web3 and contract
  const account = useAccount();
  const Bank = useBank();
  const ERC20Utils = useERC20Utils();

  // Initialize coin and coinbalance state
  const [coin, setCoin] = useState(tokenAddress);
  const [coinBalance, setCoinBalance] = useState(0);

  //widraw Value
  const [withdrawValue, setWithdrawValue] = useState(0);

  const getDAIBalance = useCallback(async () => {
    const balance = await Bank.methods.balanceOf(account).call();
    setCoinBalance(balance);
  }, [Bank.methods, account]);

  useEffect(() => {
    getDAIBalance();
  }, [getDAIBalance]);

  const [send_tx_status, setSendTxStatus] = useState(false);
  const [wait_tx, setWaitTx] = useState(false);

  const txStatus = async (hash) => {
    const web3 = window.web3;
    const status = await web3.eth.getTransactionReceipt(hash);
    return status;
  };

  const withdraw = async () => {
    if (coin !== null) {
      // => get decimals of token
      const decimals = await ERC20Utils.methods
        .decimals(coin.toString())
        .call();
      var _amount = 0;
      if (decimals == 6) {
        // decimal = 6
        _amount = withdrawValue * Math.pow(10, 6);
      } else {
        // decimal = 18
        _amount = Web3.utils.toWei(withdrawValue.toString());
      }
    }

    // ========== Transaction Start ==============
    setSendTxStatus(true);
    setWaitTx(true);

    Bank.methods
      .withdraw(_amount)
      .send({ from: account })
      .on("transactionHash", (hash) => {
        const withdrawCheck = setInterval(async () => {
          const tx_status = await txStatus(hash);
          if (tx_status && tx_status.status) {
            setWaitTx(false);
            setSendTxStatus(false);
            clearInterval(withdrawCheck);
            toast({
              title: "Success",
              description: "Withdraw Success!",
              status: "success",
              duration: 1500,
              isClosable: true,
            });
            setWithdrawValue(0);
          }
        }, 1500);
      });
  };

  const checkDecimals = async (address) => {
    const decimals = await ERC20Utils.methods.decimals(address).call();
    return decimals;
  };

  const setWithdrawValueMax = async () => {
    const decimals = await checkDecimals(coin.toString());
    if (decimals == 6) {
      setWithdrawValue(coinBalance / Math.pow(10, 6));
    } else {
      setWithdrawValue(Web3.utils.fromWei(coinBalance.toString()));
    }
  };

  const handleChangeWithdrawValue = async (e) => {
    setWithdrawValue(e.target.value);
    const decimals = await checkDecimals(coin.toString());
    let value = 0;
    if (decimals == 6) {
      value = coinBalance / Math.pow(10, 6);
    } else {
      if (e.target.value != 0) {
        value = Web3.utils.fromWei(coinBalance.toString());
      }
    }

    if (
      parseFloat(e.target.value) > parseFloat(value) ||
      parseFloat(e.target.value) < 0
    ) {
      setWithdrawValue(0);
      toast({
        title: "Error",
        description: "Please enter value less than your deposited balance",
        status: "error",
        duration: 1500,
        isClosable: true,
      });
    }
  };

  return (
    <>
      <Grid templateColumns="repeat(10, 1fr)" gap={0} mt={0}>
        <GridItem colSpan={3}>
          <Select style={{ borderRadius: "10px 0px 0px 10px" }}>
            <option value={tokenAddress}>{symbol}</option>
          </Select>
        </GridItem>
        <GridItem colSpan={7}>
          <FormControl id="email">
            <InputGroup size="md">
              <Input
                type="number"
                style={{ borderRadius: "0px 10px 10px 0px" }}
                placeholder="0.00"
                value={withdrawValue}
                onChange={handleChangeWithdrawValue}
              />
              <InputRightElement width="4.5rem">
                <Button h="1.75rem" size="sm" onClick={setWithdrawValueMax}>
                  Max
                </Button>
              </InputRightElement>
            </InputGroup>
          </FormControl>
        </GridItem>
      </Grid>

      <div style={{ paddingTop: "20px" }}></div>
      <hr />

      <Button
        style={{
          color: "#FFFFFF",
          background: "linear-gradient(90deg ,#576cea 0%, #da65d1 100%)",
        }}
        disabled={withdrawValue == 0 || (wait_tx && send_tx_status)}
        mt={2}
        mb={5}
        w={"100%"}
        onClick={() => {
          withdraw();
        }}
      >
        {wait_tx && send_tx_status ? (
          <>
            <Spinner size={"sm"} mr={2} /> Waiting the transaction ...
          </>
        ) : (
          "Withdraw"
        )}
      </Button>
      <Portfolio token={tokenAddress} symbol={symbol} />
    </>
  );
};

export default WithDraw;
