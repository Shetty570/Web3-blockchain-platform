import React, { useContext, createContext, useEffect, useState } from "react";
import { BrowserProvider, Contract, parseUnits, formatUnits } from "ethers";

const StateContext = createContext();

const infuraProjectId = process.env.REACT_APP_INFURA_PROJECT_ID;
const contractAddress = process.env.REACT_APP_CONTRACT_ADDRESS;
const contractABI = require("../CrowdFunding.json").abi;

export const StateContextProvider = ({ children }) => {
  const [address, setAddress] = useState(null);
  const [contract, setContract] = useState(null);

  const connect = async () => {
    if (window.ethereum) {
      await window.ethereum.request({ method: "eth_requestAccounts" });
      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const userAddress = await signer.getAddress();
      setAddress(userAddress);
      localStorage.setItem("isConnected", true); // Store connection state

      const contractInstance = new Contract(
        contractAddress,
        contractABI,
        signer
      );
      setContract(contractInstance);

      console.log("Contract initialized:", contractInstance);
    } else {
      console.error("Please install Metamask");
    }
  };

  useEffect(() => {
    // Check if user is connected on component mount
    const isConnected = localStorage.getItem("isConnected");
    if (isConnected) {
      connect();
    }
  }, []);

  const publishCampaign = async (form) => {
    if (!contract) {
      console.error("Contract is not initialized");
      return;
    }

    try {
      const tx = await contract.createCampaign(
        address, // owner
        form.title, // title
        form.description, // description
        parseUnits(form.target.toString(), 18), // target as string
        Math.floor(new Date(form.deadline).getTime() / 1000), // deadline
        form.image // image
      );
      await tx.wait();
      console.log("Campaign created successfully");
    } catch (error) {
      console.error("Error creating campaign:", error);
    }
  };

  const getCampaigns = async () => {
    if (!contract) {
      console.error("Contract is not initialized");
      return [];
    }

    const campaigns = await contract.getCampaigns();

    const parsedCampaigns = campaigns.map((campaign, i) => ({
      owner: campaign.owner,
      title: campaign.title,
      description: campaign.description,
      target: formatUnits(campaign.target.toString(), 18),
      deadline:
        typeof campaign.deadline === "object"
          ? campaign.deadline.toNumber()
          : campaign.deadline,
      amountCollected: formatUnits(campaign.amountCollected.toString(), 18),
      image: campaign.image,
      pId: i,
    }));

    console.log(parsedCampaigns);

    return parsedCampaigns;
  };

  const getUserCampaigns = async () => {
    const allCampaigns = await getCampaigns();
    const filteredCampaigns = allCampaigns.filter(
      (campaign) => campaign.owner === address
    );
    return filteredCampaigns;
  };

  const donate = async (pId, amount) => {
    if (!contract) {
      console.error("Contract is not initialized");
      return;
    }

    const tx = await contract.donateToCampaign(pId, {
      value: parseUnits(amount.toString(), "ether"), // ensure amount is a string
    });
    await tx.wait();
    return tx;
  };

  const getDonations = async (pId) => {
    if (!contract) {
      console.error("Contract is not initialized");
      return [];
    }

    const donations = await contract.getDonators(pId);
    const numberOfDonations = donations[0].length;

    const parsedDonations = [];

    for (let i = 0; i < numberOfDonations; i++) {
      parsedDonations.push({
        donator: donations[0][i],
        donation: formatUnits(donations[1][i].toString(), 18),
      });
    }

    return parsedDonations;
  };

  return (
    <StateContext.Provider
      value={{
        address,
        contract,
        connect,
        createCampaign: publishCampaign,
        getCampaigns,
        getUserCampaigns,
        donate,
        getDonations,
      }}
    >
      {children}
    </StateContext.Provider>
  );
};

export const useStateContext = () => useContext(StateContext);
