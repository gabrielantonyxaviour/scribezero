import fs from "node:fs";
import path from "node:path";
import solc from "solc";
import { ethers } from "ethers";

const root = process.cwd();
loadEnv(path.join(root, ".env.local"));

const contractPath = path.join(root, "contracts", "ScribeZeroRegistry.sol");
const source = fs.readFileSync(contractPath, "utf8");
const input = {
  language: "Solidity",
  sources: {
    "ScribeZeroRegistry.sol": { content: source },
  },
  settings: {
    optimizer: { enabled: true, runs: 200 },
    outputSelection: {
      "*": {
        "*": ["abi", "evm.bytecode.object"],
      },
    },
  },
};

const output = JSON.parse(solc.compile(JSON.stringify(input)));
const errors = (output.errors || []).filter((entry) => entry.severity === "error");
if (errors.length) {
  for (const error of errors) console.error(error.formattedMessage);
  process.exit(1);
}

const compiled = output.contracts["ScribeZeroRegistry.sol"].ScribeZeroRegistry;
const rpc = process.env.ZEROG_RPC || "https://evmrpc-testnet.0g.ai";
const privateKey = process.env.ZEROG_PRIVATE_KEY;
if (!privateKey) throw new Error("ZEROG_PRIVATE_KEY is required to deploy the registry");

const provider = new ethers.JsonRpcProvider(rpc);
const wallet = new ethers.Wallet(privateKey, provider);
const network = await provider.getNetwork();
const balance = await provider.getBalance(wallet.address);
console.log(`Deploying ScribeZeroRegistry to chain ${network.chainId.toString()}`);
console.log(`Deployer ${wallet.address} balance ${ethers.formatEther(balance)} OG`);

const factory = new ethers.ContractFactory(compiled.abi, compiled.evm.bytecode.object, wallet);
const contract = await factory.deploy();
await contract.waitForDeployment();
const deploymentTx = contract.deploymentTransaction();
const receipt = deploymentTx ? await deploymentTx.wait() : null;
const address = await contract.getAddress();

const deployment = {
  contract: "ScribeZeroRegistry",
  address,
  chainId: Number(network.chainId),
  rpc,
  deployer: wallet.address,
  transactionHash: deploymentTx?.hash || "",
  blockNumber: receipt?.blockNumber || null,
  abi: compiled.abi,
  deployedAt: new Date().toISOString(),
};

const deploymentDir = path.join(root, "deployments", "0g-galileo");
fs.mkdirSync(deploymentDir, { recursive: true });
fs.writeFileSync(
  path.join(deploymentDir, "ScribeZeroRegistry.json"),
  `${JSON.stringify(deployment, null, 2)}\n`,
);

console.log(JSON.stringify(deployment, null, 2));

function loadEnv(filePath) {
  if (!fs.existsSync(filePath)) return;
  const raw = fs.readFileSync(filePath, "utf8");
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) continue;
    const index = trimmed.indexOf("=");
    const key = trimmed.slice(0, index).trim();
    let value = trimmed.slice(index + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = value;
  }
}
