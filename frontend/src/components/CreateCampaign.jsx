import React, { useState } from "react";
import { parseEther } from "ethers";
import { Web3Provider } from "@ethersproject/providers";
import contract from "../contract";

const CreateCampaign = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [target, setTarget] = useState("");
  const [deadline, setDeadline] = useState("");
  const [image, setImage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const targetInWei = parseEther(target);
    const deadlineInSeconds = Math.floor(new Date(deadline).getTime() / 1000);

    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });
    const signer = accounts[0];
    const provider = new Web3Provider(window.ethereum);
    const contractWithSigner = contract.connect(provider.getSigner());

    try {
      const tx = await contractWithSigner.createCampaign(
        signer,
        title,
        description,
        targetInWei,
        deadlineInSeconds,
        image
      );
      console.log("Transaction sent: ", tx.hash);

      const receipt = await tx.wait();
      console.log("Transaction mined: ", receipt.transactionHash);

      if (receipt.confirmations >= 1) {
        alert("Campaign created!");
      }
    } catch (error) {
      console.error("Error creating campaign: ", error);
      alert("Error creating campaign. Check the console for details.");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />
      <input
        type="text"
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        required
      />
      <input
        type="number"
        placeholder="Target (in ETH)"
        value={target}
        onChange={(e) => setTarget(e.target.value)}
        required
      />
      <input
        type="date"
        placeholder="Deadline"
        value={deadline}
        onChange={(e) => setDeadline(e.target.value)}
        required
      />
      <input
        type="text"
        placeholder="Image URL"
        value={image}
        onChange={(e) => setImage(e.target.value)}
        required
      />
      <button type="submit">Create Campaign</button>
    </form>
  );
};

export default CreateCampaign;
