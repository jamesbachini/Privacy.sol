require('dotenv').config();
const ethers = require('ethers');
const crypto = require('crypto');
const readline = require('readline');

const contractABI = [
  "function registerPublicKey(bytes calldata _publicKey) external",
  "function sendMessage(address _to, bytes calldata _encryptedMessage) external",
  "function getMessages(address _user) external view returns (tuple(address sender, bytes encryptedMessage, uint256 timestamp)[])",
  "function getPublicKey(address _user) external view returns (bytes memory)"
];

const contractAddress = "0xD854A0173f60799930E25039d18fda82C77bd278";
const provider = new ethers.JsonRpcProvider('https://rpc2.sepolia.org');
const privateKey = process.env.ALT_PRIVATE_KEY; // switch accounts with process.env.ALT_PRIVATE_KEY;
const wallet = new ethers.Wallet(privateKey, provider);
const contract = new ethers.Contract(contractAddress, contractABI, wallet);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function deriveECDHKeysFromPrivateKey(privateKey) {
  const ecdh = crypto.createECDH('secp256k1');
  ecdh.setPrivateKey(Buffer.from(privateKey.slice(2), 'hex'));
  const fullPublicKey = ecdh.getPublicKey();
  const publicKey = fullPublicKey.slice(1);
  return { privateKey: ecdh.getPrivateKey(), publicKey };
}

async function init() {
  console.log(`Welcome: ${wallet.address}`);
  const balance = await provider.getBalance(wallet.address);
  console.log(`Balance: ${ethers.formatEther(balance)} ETH`);
  const { publicKey } = deriveECDHKeysFromPrivateKey(privateKey);
  const registeredKey = await contract.getPublicKey(wallet.address);
  if (registeredKey == '0x') {
    rl.question('Do you want to register your public key? (yes/no): ', async (answer) => {
      if (answer.toLowerCase() === 'yes' || answer.toLowerCase() === 'y') {
        const tx = await contract.registerPublicKey(publicKey);
        await tx.wait();
        console.log('Public key registered successfully.');
      } else {
        console.log('Public key registration skipped.');
      }
      await checkMessages();
      startMessaging();
    });
  } else {
    console.log('Public key already registered.');
  }
  await checkMessages();
  startMessaging();
}

async function checkMessages() {
  console.log('Checking messages...');
  const messages = await contract.getMessages(wallet.address);
  if (messages.length === 0) return console.log('No messages found.');
  const ecdh = crypto.createECDH('secp256k1');
  ecdh.setPrivateKey(Buffer.from(privateKey.slice(2), 'hex'));
  for (const message of messages) {
      const sender = message.sender;
      const encryptedMessage = message.encryptedMessage;
      const timestamp = new Date(Number(message.timestamp * 1000n)).toLocaleString();
      const senderPublicKey = await contract.getPublicKey(sender);
      if (senderPublicKey.length == '0x') {
          console.log(`No public key found for sender: ${sender}`);
          continue;
      }
      const formattedPublicKey = Buffer.concat([Buffer.from([0x04]), Buffer.from(senderPublicKey.slice(2), 'hex')]);
      const sharedSecret = ecdh.computeSecret(formattedPublicKey);
      const decipher = crypto.createDecipheriv('aes-256-cbc', sharedSecret.slice(0, 32), Buffer.alloc(16, 0));
      let decryptedMessage = decipher.update(Buffer.from(encryptedMessage.slice(2), 'hex'), 'hex', 'utf8');
      decryptedMessage += decipher.final('utf8');
      console.log('--------------------------');
      console.log(`From: ${sender}`);
      console.log(`Timestamp: ${timestamp}`);
      console.log(`Message: ${decryptedMessage}`);
  }
}

async function sendMessage(toAddress, toPublicKey, message) {
  const ecdh = crypto.createECDH('secp256k1');
  ecdh.setPrivateKey(Buffer.from(privateKey.slice(2), 'hex'));
  const formattedPublicKey = Buffer.concat([Buffer.from([0x04]), Buffer.from(toPublicKey.slice(2), 'hex')]);
  const sharedSecret = ecdh.computeSecret(formattedPublicKey);
  const cipher = crypto.createCipheriv('aes-256-cbc', sharedSecret.slice(0, 32), Buffer.alloc(16, 0));
  let encryptedMessage = '0x';
  encryptedMessage += cipher.update(message, 'utf8', 'hex');
  encryptedMessage += cipher.final('hex');
  const tx = await contract.sendMessage(toAddress, encryptedMessage);
  await tx.wait();
  console.log('Message sent!');
}

async function startMessaging() {
  console.log('--------------------------');
  rl.question('Enter recipient address: ', async (recipientAddress) => {
    const recipientPublicKey = await contract.getPublicKey(recipientAddress);
    if (recipientPublicKey == '0x') {
      console.log(`Recipient needs to register public key`);
      return;
    }
    rl.question('Enter message: ', async (message) => {
      await sendMessage(recipientAddress, recipientPublicKey, message);
      startMessaging();
    });
  });
}

async function main() {
  await init();
}

main().catch(console.error);
