import { Web3Provider } from "@ethersproject/providers";
import { Contract } from "ethers";
import CrowdFunding from "./CrowdFunding.json"; // Ensure you have the ABI file from your Hardhat artifacts

const contractAddress = process.env.REACT_APP_CONTRACT_ADDRESS;
// const infuraProjectId = process.env.REACT_APP_INFURA_PROJECT_ID;

const provider = new Web3Provider(window.ethereum);
const contract = new Contract(contractAddress, CrowdFunding.abi, provider);

export default contract;
