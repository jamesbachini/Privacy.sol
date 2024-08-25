# Privacy.sol - Encrypted Messaging on Public Blockchains

This repository demonstrates how to use Elliptic Curve Diffie-Hellman (ECDH) cryptography to establish a shared secret and enable encrypted messaging across an insecure communication channel—in this case, a public blockchain. The source code is divided into three main components:

- **Privacy.sol**: A Solidity smart contract for storing public keys and encrypted messages.
- **node-dapp.js**: A Node.js command-line client for key setup, message sending, and message retrieval.
- **web-dapp.js**: A simple web client for interacting with the smart contract.

## Background

Public blockchains are transparent, meaning all data is visible to everyone. This transparency poses a challenge for private communication. This project demonstrates a method to create a shared secret without the ability to transfer keys privately. Using ECDH, the sender and recipient can generate a shared secret that is used to encrypt and decrypt messages, ensuring privacy on a public network.

For more information, check the tutorial at: [https://jamesbachini.com/solidity-encrypted-messaging-dapp/](https://jamesbachini.com/solidity-encrypted-messaging-dapp/)

## Components

### 1. Privacy.sol - Smart Contract

The `Privacy.sol` smart contract is deployed on the Sepolia Ethereum testnet. It allows users to:

- **Register Public Keys**: Users can register their ECDH public keys on the blockchain.
- **Send Encrypted Messages**: Users can send encrypted messages to others who have registered public keys.
- **Retrieve Messages**: Users can retrieve messages that have been sent to them.

The smart contract is available on Sepolia at: [Sepolia Etherscan](https://sepolia.etherscan.io/address/0xd854a0173f60799930e25039d18fda82c77bd278#code)

### 2. NodeJS Client (`node-dapp.js`)

The Node.js client can be used to set up keys, send messages, and retrieve messages from the smart contract. To use this client:

- Install dependencies: `npm install dotenv ethers readline`
- Configure `.env` with your Ethereum private key.
- Run the client to interact with the smart contract, register keys, and send/receive messages.

### 3. Web Client (`web-dapp.js`)

The web client is a simple HTML page that allows users to interact with the smart contract through their browser. It supports:

- Wallet connection (e.g., MetaMask)
- Public key generation and registration
- Sending and receiving encrypted messages

To run the web client locally, use a simple HTTP server:

```bash
npm install http-server
npx http-server ./
```

## Usage

### Public Key Registration

Users must register their ECDH public keys on the blockchain. This key is essential for others to encrypt messages specifically for them, ensuring that only the intended recipient can decrypt and read them.

### Sending Encrypted Messages

Once public keys are registered, users can send encrypted messages. The message, encrypted with the shared secret derived from ECDH, is stored on the blockchain, where only the intended recipient can decrypt and read it.

### Retrieving Messages

Users can retrieve their encrypted messages from the smart contract. Since the messages are encrypted, only the recipient with the corresponding private key can decrypt them.

## Deployment

The `Privacy.sol` contract is deployed on the Sepolia testnet. The deployment script and instructions are included in this repository.

## Security Considerations

- **Key Management**: The current implementation derives ECDH keys from Ethereum private keys, which may not be ideal for production use due to UX and security concerns.

- **Private Key Handling**: The web client requires entering private keys, which is not recommended in production environments. Ensure that only test wallets with minimal funds are used for testing purposes.

## Conclusion

This project showcases how privacy can be maintained on a transparent blockchain by using ECDH to encrypt messages. While this implementation serves as a proof of concept, further improvements and security enhancements would be necessary for production use.

Privacy is a fight worth fighting for in a world that never stops watching.

For more information, check the tutorial at: [https://jamesbachini.com/solidity-encrypted-messaging-dapp/](https://jamesbachini.com/solidity-encrypted-messaging-dapp/)