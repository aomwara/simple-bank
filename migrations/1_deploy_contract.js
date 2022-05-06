const config = require("../config.json");
const TokenAddress = require("../constants/TokenAddress.json");

/**==================================================================
 *                       Import Contract Artifacts
 ===================================================================*/
// Pool Token Artifacts
const _DAI = artifacts.require("DAI");

// Contract Artifacts
const _BANK = artifacts.require("Bank");
const _ERC20UTILS = artifacts.require("ERC20Utils");

/**==================================================================
 *                         Utils Functions
 ===================================================================*/

const Token = (n) => {
  return web3.utils.toWei(n, "ether");
};

/**==================================================================
 *                          Deployment
 ===================================================================*/

module.exports = async (deployer, network, accounts) => {
  /* ==>  Use from blockchain network  */
  const DAI = await _DAI.at(TokenAddress.DAI);

  if (config.mode === "development") {
    /* ==>  Transfer tokens to accounts[0] (for development)  */
    await DAI.transfer(accounts[0], Token("100000"), {
      from: config.rich_DAI,
    });
    await DAI.transfer(accounts[1], Token("100000"), {
      from: config.rich_DAI,
    });
  }

  /* ==>  Deploy Platfrom Contract  */
  await deployer.deploy(_BANK);
  await deployer.deploy(_ERC20UTILS);
};
