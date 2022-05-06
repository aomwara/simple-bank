import { useState } from "react";

import styles from "styles/Home.module.css";
import Head from "next/head";
import { Panel } from "components/deposit/Panel";
import { useRouter } from "next/router";

import { Text, Grid, Container, Box, GridItem, Image } from "@chakra-ui/react";

import TVD from "components/deposit/TVD";

const StableCoinPool = () => {
  const router = useRouter();
  const { address } = router.query;

  return (
    <div className={styles.container}>
      <Head>
        <title>Simple Bank | Deposit</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Container maxW="container.xl" mt={10}>
        <>
          <Grid templateColumns="repeat(10, 1fr)" gap={6}>
            <GridItem colSpan={1}>
              <Box>
                <Image
                  style={{ borderRadius: "50%" }}
                  src="/assets/images/DAI.png"
                  alt={address}
                  width={75}
                  minWidth={45}
                  fallbackSrc="/assets/images/logo-box.png"
                />
              </Box>
            </GridItem>
            <GridItem colSpan={5}>
              <Text fontSize={{ base: "2xl", md: "3xl", lg: "4xl" }}>
                <b>DAI Coin</b>
              </Text>
            </GridItem>
          </Grid>

          <Box className="row">
            <Box className="col-md-7" pt={{ base: 5, md: 3, lg: 3 }}>
              <Text
                fontSize="md"
                style={{ textAlign: "justify", textJustify: "inter-word" }}
                pr={{ base: 0, md: 0, lg: 7 }}
                pl={{ base: 0, md: 0, lg: 7 }}
              >
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; DAI is an Ethereum-based
                stablecoin (stable-price cryptocurrency) whose issuance and
                development is managed by the Maker Protocol and the MakerDAO
                decentralized autonomous organization. The price of DAI is
                soft-pegged to the U.S. dollar and is collateralized by a mix of
                other cryptocurrencies that are deposited into smart-contract
                vaults every time new DAI is minted.
              </Text>
              <br />
              <Box
                pl={{ base: 0, md: 0, lg: 7 }}
                pt={{ base: 3, md: 0, lg: 0 }}
                pb={{ base: 5, md: 0, lg: 0 }}
                textAlign={{ base: "center", md: "left", lg: "left" }}
              >
                <TVD
                  tokenAddress="0x4F96Fe3b7A6Cf9725f59d353F723c1bDb64CA6Aa"
                  symbol="DAI"
                ></TVD>
              </Box>
              <Box
                pl={{ base: 0, md: 0, lg: 7 }}
                pt={{ base: 3, md: 0, lg: 0 }}
                pb={{ base: 5, md: 0, lg: 0 }}
                textAlign={{ base: "center", md: "left", lg: "left" }}
              ></Box>
            </Box>
            <Box className="col-md-5" style={{ paddingTop: "10px" }}>
              <Panel
                symbol="DAI"
                tokenAddress="0x4F96Fe3b7A6Cf9725f59d353F723c1bDb64CA6Aa"
              />
            </Box>
          </Box>
        </>
      </Container>
    </div>
  );
};

export default StableCoinPool;