import { useState, useEffect, useCallback } from "react";
import Web3 from "web3";

import ERC20ABI from "../../constants/ERC20ABI.json";
import useAccount from "hooks/useAccount";
import { useBank, useERC20Utils } from "hooks/useContracts";
import { useDAI } from "hooks/useToken";

import {
  Grid,
  GridItem,
  Select,
  FormControl,
  Input,
  Button,
  InputGroup,
  Spinner,
  InputRightElement,
  useToast,
} from "@chakra-ui/react";

import Portfolio from "./Portfolio";

const Deposit = ({ symbol, tokenAddress }) => {
  const toast = useToast();

  //initialize web3 and contract
  const account = useAccount();
  const Bank = useBank();
  const ERC20Utils = useERC20Utils();
  const DAI = useDAI();

  // Initialize coin and coinbalance state
  const [coin, setCoin] = useState(tokenAddress);
  const [coinBalance, setCoinBalance] = useState(0);

  //Stake Value
  const [stakeValue, setStakeValue] = useState(0);

  const [send_tx_status, setSendTxStatus] = useState(false);
  const [wait_tx, setWaitTx] = useState(false);

  const txStatus = async (hash) => {
    const web3 = window.web3;
    const status = await web3.eth.getTransactionReceipt(hash);
    return status;
  };

  const getDAIBalance = useCallback(async () => {
    const balance = await DAI.methods.balanceOf(account).call();
    setCoinBalance(balance);
  }, [DAI.methods, account]);

  useEffect(() => {
    getDAIBalance();
  }, [getDAIBalance]);

  const handleChangeStakeValue = async (e) => {
    setStakeValue(e.target.value);
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
      setStakeValue(0);
      toast({
        title: "Error",
        description: "Please enter value less than your balance",
        status: "error",
        duration: 1500,
        isClosable: true,
      });
    }
  };

  const deposit = async () => {
    const web3 = window.web3;
    const coinContract = new web3.eth.Contract(ERC20ABI, coin);

    // => set amount with decimals
    if (coin !== null) {
      // => get decimals of token
      const decimals = await ERC20Utils.methods
        .decimals(coin.toString())
        .call();
      var _amount = 0;
      if (decimals == 6) {
        // decimal = 6
        _amount = stakeValue * Math.pow(10, 6);
      } else {
        // decimal = 18
        _amount = Web3.utils.toWei(stakeValue.toString());
      }

      console.log("approve value => ", _amount);

      // ========== Transaction Start ==============
      setSendTxStatus(true);
      setWaitTx(true);
      // => Approve <<<
      // => approve with coin that user select

      await coinContract.methods
        .approve(Bank.address, _amount)
        .send({ from: account })
        .on("transactionHash", (hash) => {
          const refreshId = setInterval(async () => {
            const tx_status = await txStatus(hash);
            if (tx_status && tx_status.status) {
              clearInterval(refreshId);

              toast({
                title: "Success",
                description: "Approved Success!",
                status: "success",
                duration: 1500,
                isClosable: true,
              });

              // => Check Allowance value <<<
              const allowance = await ERC20Utils.methods
                .allowance(coin, account, Bank.address)
                .call();

              if (allowance == _amount) {
                // => Deposit <<<
                Bank.methods
                  .deposit(_amount)
                  .send({ from: account })
                  .on("transactionHash", (hash) => {
                    const depositCheck = setInterval(async () => {
                      const tx_status = await txStatus(hash);
                      if (tx_status && tx_status.status) {
                        setWaitTx(false);
                        setSendTxStatus(false);
                        clearInterval(depositCheck);
                        toast({
                          title: "Success",
                          description: "Deposit Success!",
                          status: "success",
                          duration: 1500,
                          isClosable: true,
                        });
                        setStakeValue(0);
                      }
                    }, 1500);
                  });
              } else {
                toast({
                  title: "Error",
                  description:
                    "Please set approve value = " +
                    stakeValue +
                    " on your wallet",
                  status: "error",
                  duration: 1500,
                  isClosable: true,
                });
              }
            }
          }, 1500);
        });
    } else {
      toast({
        title: "Error",
        description: "Please select coin",
        status: "error",
        duration: 1500,
        isClosable: true,
      });
    }
  };

  const checkDecimals = async (address) => {
    const decimals = await ERC20Utils.methods.decimals(address).call();
    return decimals;
  };

  const setStakeValueMax = async () => {
    setStakeValue(Web3.utils.fromWei(coinBalance.toString()));
  };

  const handleChangeToken = async (e) => {
    setStakeValue(0);
    setCoin(tokenAddress);
    let _coinBalance = await ERC20Utils.methods
      .balanceOf(tokenAddress.toString(), account)
      .call();
    setCoinBalance(_coinBalance);
  };

  return (
    <>
      <Grid templateColumns="repeat(10, 1fr)" gap={0}>
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
                value={stakeValue}
                onChange={handleChangeStakeValue}
              />
              <InputRightElement width="4.5rem">
                <Button
                  h="1.75rem"
                  size="sm"
                  onClick={setStakeValueMax}
                  disabled={!coin}
                >
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
        disabled={stakeValue == 0 || (wait_tx && send_tx_status)}
        mt={2}
        mb={5}
        w={"100%"}
        onClick={() => {
          deposit();
        }}
      >
        {wait_tx && send_tx_status ? (
          <>
            <Spinner size={"sm"} mr={2} /> Waiting the transaction ...
          </>
        ) : (
          "Deposit"
        )}
      </Button>

      <Portfolio token={tokenAddress} symbol={symbol} />
    </>
  );
};

export default Deposit;
