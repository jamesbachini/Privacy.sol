// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

contract Privacy {
    using ECDSA for bytes32;

    struct Message {
        address sender;
        bytes encryptedMessage;
        uint256 timestamp;
    }

    mapping(address => bytes) public publicKeys;
    mapping(address => Message[]) private messages;

    event PublicKeyRegistered(address indexed user, bytes publicKey);
    event MessageSent(address indexed from, address indexed to);

    function registerPublicKey(bytes calldata _publicKey) external {
        require(_publicKey.length == 64, "Invalid public key length");
        publicKeys[msg.sender] = _publicKey;
        emit PublicKeyRegistered(msg.sender, _publicKey);
    }

    function sendMessage(address _to, bytes calldata _encryptedMessage) external {
        require(publicKeys[_to].length > 0, "Recipient has not registered a public key");
        
        Message memory newMessage = Message({
            sender: msg.sender,
            encryptedMessage: _encryptedMessage,
            timestamp: block.timestamp
        });
        
        messages[_to].push(newMessage);
        emit MessageSent(msg.sender, _to);
    }

    function getMessages(address _user) external view returns (Message[] memory) {
        return messages[_user];
    }

    function getPublicKey(address _user) external view returns (bytes memory) {
        return publicKeys[_user];
    }
}