import useContract from "../useContract";
import config from "../../config.json";
import Bank_ABI from "../../abis/Bank.json";

const useBank = () => {
  const abi = Bank_ABI.abi;
  const contract = useContract(
    abi,
    Bank_ABI.networks[config.networkId].address
  );

  const methods = contract.methods;
  const address = contract._address;

  return { contract, methods, address };
};

export default useBank;
