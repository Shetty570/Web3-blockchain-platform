// scripts/interact.js
const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  const crowdFundingAddress = "0xCA0911C1934F212C8bbAcE74E503cBE54C091317";
  const CrowdFunding = await hre.ethers.getContractFactory("CrowdFunding");
  const crowdFunding = await CrowdFunding.attach(crowdFundingAddress);

  // Example: Create a campaign
  const tx = await crowdFunding.createCampaign(
    deployer.address,
    "New Campaign",
    "This is a new campaign",
    hre.ethers.utils.parseEther("10"), // Target in ether
    Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7, // Deadline one week from now
    "https://example.com/image.png"
  );
  await tx.wait();
  console.log("Campaign created");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
