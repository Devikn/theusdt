const contractAddress = "0xD20Ecb072145678B5853B7563EE5dc0a6E6981d9";

const usdtAbi = [
  "function balanceOf(address) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function transfer(address to, uint amount) returns (bool)"
];

let provider;
let signer;
let userAddress;

async function connectWallet() {
  if (!window.ethereum) {
    alert("MetaMask not detected. Please install it.");
    return;
  }
  try {
    await window.ethereum.request({ method: "eth_requestAccounts" });
    provider = new ethers.providers.Web3Provider(window.ethereum);
    signer = provider.getSigner();
    userAddress = await signer.getAddress();
    document.getElementById("walletAddress").innerText = Wallet: ${userAddress};
    await updateBalance();
  } catch (error) {
    alert("Failed to connect wallet.");
    console.error(error);
  }
}

async function updateBalance() {
  try {
    const contract = new ethers.Contract(contractAddress, usdtAbi, provider);
    const rawBalance = await contract.balanceOf(userAddress);
    const decimals = await contract.decimals();
    const balance = ethers.utils.formatUnits(rawBalance, decimals);
    document.getElementById("balance").innerText = USDT Balance: ${balance};
  } catch (error) {
    console.error("Error fetching balance:", error);
    document.getElementById("balance").innerText = "USDT Balance: Error";
  }
}

async function sendUSDT() {
  const recipient = document.getElementById("recipient").value.trim();
  const amount = document.getElementById("amount").value.trim();

  if (!provider || !signer || !userAddress) {
    alert("Please connect your wallet first.");
    return;
  }
  if (!ethers.utils.isAddress(recipient)) {
    alert("Invalid recipient address.");
    return;
  }
  if (!amount || isNaN(amount) || Number(amount) <= 0) {
    alert("Invalid amount.");
    return;
  }

  try {
    const contract = new ethers.Contract(contractAddress, usdtAbi, signer);
    const decimals = await contract.decimals();
    const amountParsed = ethers.utils.parseUnits(amount, decimals);

    document.getElementById("txStatus").innerText = "Sending transaction...";

    const tx = await contract.transfer(recipient, amountParsed);
    await tx.wait();

    document.getElementById("txStatus").innerText = Transaction successful! TxHash: ${tx.hash};
    await updateBalance();
  } catch (error) {
    console.error("Transfer failed:", error);
    document.getElementById("txStatus").innerText = "Transaction failed.";
  }
}

document.getElementById("connectBtn").addEventListener("click", connectWallet);
document.getElementById("sendBtn").addEventListener("click", sendUSDT);
