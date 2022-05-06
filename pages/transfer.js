import Head from "next/head";
import styles from "../styles/Home.module.css";
import {
  Text,
  Box,
  Button,
  Container,
  FormControl,
  InputGroup,
  Input,
  InputRightElement,
  Grid,
  GridItem,
  Select,
  Center,
  Spinner,
  useToast,
} from "@chakra-ui/react";
import { ArrowDownIcon } from "@chakra-ui/icons";
import { useERC20Utils, useBank } from "hooks/useContracts";
import { useEffect, useState, useCallback } from "react";
import Web3 from "web3";
import useAccount from "hooks/useAccount";
import ERC20ABI from "../constants/ERC20ABI.json";

const Transfer = () => {
  const account = useAccount();
  const toast = useToast();
  const ERC20Utils = useERC20Utils();
  const Bank = useBank();

  // Initialize coin and coinbalance state
  const [coin, setCoin] = useState(
    "0x4F96Fe3b7A6Cf9725f59d353F723c1bDb64CA6Aa"
  );
  const [coinBalance, setCoinBalance] = useState(0);

  const [transferValue, settransferValue] = useState(0);
  const [transferTo, setTransferTo] = useState("");
  const [proofAccount, setProofAccount] = useState(false);

  const getDAIBalance = useCallback(async () => {
    const balance = await Bank.methods.balanceOf(account).call();
    setCoinBalance(balance);
  }, [Bank.methods, account]);

  useEffect(() => {
    getDAIBalance();
  }, [getDAIBalance]);

  const checkDecimals = async (address) => {
    const decimals = await ERC20Utils.methods.decimals(address).call();
    return decimals;
  };

  const settransferValueMax = async () => {
    const decimals = await checkDecimals(coin.toString());
    if (decimals == 6) {
      settransferValue(coinBalance / Math.pow(10, 6));
    } else {
      settransferValue(Web3.utils.fromWei(coinBalance.toString()));
    }
  };

  const handleChangetransferValue = async (e) => {
    settransferValue(e.target.value);
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
      settransferValue(0);
      toast({
        title: "error",
        description: "Please enter value less than your balance",
        status: "error",
        duration: 1500,
        isClosable: true,
      });
    }
  };

  const handleChangeTransferTo = async (e) => {
    setTransferTo(e.target.value);
    const _to = e.target.value;
    if (Web3.utils.isAddress(_to) && _to.length == 42) {
      const isAccout = await Bank.methods.isAccount(_to).call();
      if (isAccout) {
        setProofAccount(true);
      } else {
        setProofAccount(false);
        toast({
          title: "Warning",
          description: "ไม่มี Account นี้อยู่ในธนาคาร",
          status: "warning",
          duration: 1500,
          isClosable: true,
        });
      }
    } else {
      if (_to.length == 42) {
        toast({
          title: "Warning",
          description: "เลข Account ผิด โปรดตรวจสอบอีกครั้ง",
          status: "warning",
          duration: 1500,
          isClosable: true,
        });
      }
      setProofAccount(false);
    }
  };

  const [send_tx_status, setSendTxStatus] = useState(false);
  const [wait_tx, setWaitTx] = useState(false);

  const txStatus = async (hash) => {
    const web3 = window.web3;
    const status = await web3.eth.getTransactionReceipt(hash);
    return status;
  };

  const handleTransferTo = async () => {
    const web3 = window.web3;
    const coinContract = new web3.eth.Contract(ERC20ABI, coin);

    // => set amount with decimals
    if (coin !== null) {
      // => get decimals of token
      const decimals = await ERC20Utils.methods
        .decimals(coin.toString())
        .call();
      const _amount = 0;
      if (decimals == 6) {
        // decimal = 6
        _amount = transferValue * Math.pow(10, 6);
      } else {
        // decimal = 18
        _amount = Web3.utils.toWei(transferValue.toString());
      }

      // ========== Transaction Start ==============
      setSendTxStatus(true);
      setWaitTx(true);
      // => Approve <<<
      // => approve with coin that user select

      Bank.methods
        .transferTo(transferTo, _amount)
        .send({ from: account })
        .on("transactionHash", (hash) => {
          const transferCheck = setInterval(async () => {
            const tx_status = await txStatus(hash);
            if (tx_status && tx_status.status) {
              setWaitTx(false);
              setSendTxStatus(false);
              clearInterval(transferCheck);
              toast({
                title: "Success",
                description: "Transfer Success!",
                status: "success",
                duration: 1500,
                isClosable: true,
              });
              settransferValue(0);
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

  return (
    <>
      <div className={styles.container}>
        <Head>
          <title>Simple Bank | Transfer</title>
          <meta name="description" content="Dai Faucet" />
          <link rel="icon" href="/favicon.ico" />
        </Head>

        <Text fontSize="4xl" fontWeight="bold" pt={5} align="center">
          Transfer
        </Text>
        <Text fontSize="md" align="center" pt={0}>
          Transfer DAI from your account to other account
        </Text>

        <Container maxW={"4xl"} pt={5}>
          <Box className="row">
            <Box className="col-md-12">
              <Center>
                <Box w={600} pt={6}>
                  <Box
                    className="swap-box"
                    style={{ textAlign: "center" }}
                    p={5}
                  >
                    {/* To  */}
                    <Box className="currency-box">
                      <Text
                        fontSize={"sm"}
                        style={{ textAlign: "left", marginBottom: "15px" }}
                      >
                        To
                      </Text>
                      <Grid templateColumns="repeat(10, 1fr)" gap={0}>
                        <GridItem colSpan={10}>
                          <FormControl id="email">
                            <InputGroup size="md">
                              <Input
                                maxLength={42}
                                type="text"
                                style={{ border: "0" }}
                                placeholder="0X0"
                                value={transferTo}
                                onChange={handleChangeTransferTo}
                              />
                            </InputGroup>
                          </FormControl>
                        </GridItem>
                      </Grid>
                    </Box>

                    {/* From */}
                    <Box className="currency-box" mt={3}>
                      <Text
                        fontSize={"sm"}
                        style={{ textAlign: "left", marginBottom: "15px" }}
                      >
                        Amount
                      </Text>
                      <Grid templateColumns="repeat(10, 1fr)" gap={0}>
                        <GridItem colSpan={7}>
                          <FormControl id="email">
                            <InputGroup size="md">
                              <Input
                                type="number"
                                style={{ border: "0" }}
                                placeholder="0.00"
                                value={transferValue}
                                onChange={handleChangetransferValue}
                              />
                              <InputRightElement width="4.5rem">
                                <Button
                                  h="1.75rem"
                                  size="sm"
                                  onClick={settransferValueMax}
                                >
                                  Max
                                </Button>
                              </InputRightElement>
                            </InputGroup>
                          </FormControl>
                        </GridItem>
                        <GridItem colSpan={3}>
                          <Select style={{ border: "0" }}>
                            <option value="0x4F96Fe3b7A6Cf9725f59d353F723c1bDb64CA6Aa">
                              DAI
                            </option>
                          </Select>
                        </GridItem>
                      </Grid>
                    </Box>

                    {/* Button */}
                    <Button
                      style={{ borderRadius: "15px" }}
                      width={"100%"}
                      colorScheme="pink"
                      height="70px"
                      className="swap-button"
                      onClick={() => {
                        handleTransferTo();
                      }}
                      disabled={
                        transferValue == 0 ||
                        (wait_tx && send_tx_status) ||
                        transferTo.length < 42 ||
                        !proofAccount
                      }
                    >
                      {wait_tx && send_tx_status ? (
                        <>
                          <Spinner size={"sm"} mr={2} /> Waiting the transaction
                          ...
                        </>
                      ) : (
                        "Transfer"
                      )}
                    </Button>
                  </Box>
                </Box>
              </Center>
            </Box>
          </Box>
        </Container>
      </div>
    </>
  );
};

export default Transfer;
