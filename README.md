	### Install packages: 

`$ npm install` 

### Tests: 
`$ npx hardhat test/<js test file>`

### Coverage:
`$ npm install coverage`


#### Technical Test:

##### A)  In Ethereum and blockchain ecosystem in general, what are the use-cases of hash functions?  

A hash is the result of a hash function that results in a unique identifier for a given piece of data. The hash function is a cryptographic operation that generates the hash.
It should be clarified that they are unique, so there will never be the same hash for different data, even if the change is minimal.
The hash string is fixed for everyone and regardless of the data we pass, the length of the resulting hash will be the same for everyone.

The creation of the hash is a one way process, so we cannot know the original data from the hash.


- Merkle root

In the block we can find the Merkle root, which arises from the Merkle tree. 
It is used to verify the transactions in the block. As I mentioned before, it is a tree like data structure with a hierarchical order from top to bottom, where at the base are the hashes of all the transactions in the block sorted. 
Suppose we have transactions T1, T2, T3 and T4, in that order.
All these transactions will be hashed, following the example, the hashes would be H1, H2, H3 and H4, and they would be the leaves of the lowest level of the tree, and from these arise the leaves of the next level, which will be hashed in pairs (in the case of being odd, the last one copies itself), H12 will be the hash of H1 and H2, and H34 will be the hash of H3 and H4, and finally H1234 (root) will be the hash of H12 and H34, resulting in the root of the Merkle tree, which will be a summary hash of the transactions in the block. As you can see this root arises from the hashes of all the leaf values and not the other way around. There will only be one Merkle root per block.
So with that hash all the transactions in the block are represented instead of reloading the block with all the hashes of those transactions. 
Suppose there are 500 transactions and we know that each hash of each transaction weighs 32 bytes, that block would hold 16,000 bytes, but with the Merkle root it can only hold 32 bytes. The rest is mathematically contained, so it is not necessary to include them.


- Digital signatures

An asymmetric cryptography system generates a pair of keys, a public key, which as its name suggests is public, so anyone can see it, and a private key that only the user should know. These keys are alphanumeric with a specific length.
A person can encrypt a message with my public key and send it to me and this message can only be decrypted with my private key. This is because the keys are mathematically related.


In cryptocurrencies the public key is used in the wallets to make transactions.
This is where digital signatures come in, which are the combination of the private key and a hash of the data to be signed, such as a transaction, resulting in a unique digital ID that authenticates it without the need to reveal the private key of the person signing.
For a transaction to be valid on the blockchain it needs a signature and verification of that signature by the receiver and the network for it to be valid.
This requires 3 algorithms, one to generate a random private key from which the public key will be derived; another to produce the signature from the private key and the data, and the last one that authenticates the message with the public key and the signature.
This can be explained with an example:
I, person A, want to make a transaction to person B. Suppose I already have a digital wallet, so I already have my public and private key pair.
So I take the transaction data, hash it (SHA 256 algorithm) and combine it with A's private key, resulting in the digital signature.
Then the transaction data, the signature and A's public key are sent to person B.
For this transaction to be valid, the signature must be decrypted with A's public key, resulting in a hash, which must match the hash of the transaction data.

- Blockchain

The existence of blockchain immutability depends on the hash, since each block has a unique identification of that block which is a hash of its header, where in that header is, among other data, the hash of the previous block, so that these are linked and in turn this with the next one.
As we saw before, any change, no matter how small, will change the resulting hash, and as these are linked, all the following blocks will change.
Keep in mind that it is not just any hash that is given to the block, but it has to start with a specific number of zeros determined by the target. 

As the header information cannot be changed in order to achieve this hash with a specific number of zeros at the beginning, a nonce comes into play, which is a random number that will be changed by the miners to find the valid hash.


##### B)  What are the bottlenecks in terms of performance when operating on a network like Ethereum? What kind of solutions can be utilized to overcome them?  

One of the main problems of Ethereum is network congestion and high transaction rates. Ethereum is capable of handling between 15 and 45 transactions per second and to increase the amount of these transactions per second what would have to be done is to increase the size of the nodes, which would limit the participants because only those with powerful and expensive computers would be able to do so. 

This congestion, which occurs when many people use the network, results in skyrocketing fees and makes it very expensive to make a transaction. 
One solution is to use a layer 2. So Ethereum's idea is not to grow its own blockchain and do more transactions per second on this network, but to increase transactions per second on layer 2, so there will be a lot of layer 2 extending layer 1 (Ethereum Mainnet) which guarantees decentralized security. 

So layer 1 takes care of security and decentralization, while layer 2 takes care of scalability. 


##### C)  What are the different types of bridges and how do they work ? Explain in detail step by step how bridging an ERC721 would work.  

- Bridge  

They are services that allow to create a connection between two blockchains that cannot communicate with each other, so that tokens can be passed between them, in a bidirectional way.

Bridges can be centralized or decentralized.

**Centralized bridges** are those in which token management is handled by a centralized entity, which takes and releases tokens from the blockchains supported by the service. In this case, the user fully trusts the entity that manages his tokens.

**Decentralized bridges** are those in which there is no entity managing the tokens, but is fully controlled by the smart contracts. These bridges are not trusted since the security of the bridge will be the same as that of the blockchain on which it runs. In this case the user has control over their tokens.

- Operation:  

For example pass 10 ERC20 tokens from a blockchain A to a blockchain B. As they are different blockchains, with different protocols, you cannot pass direct value from one to the other.
So what the bridge will do is create contracts on both blockchains that can communicate in the same language through a blockchain oracle. 
The bridge will specify the address that it will receive, in this case for blockchain B, and that it will send the 10 tokens to a vault that will be in blockchain A.
The oracle will detect that those 10 tokens were received in blockchain A and will notify the smart contract in blockchain B that it received that amount of that type of token. Then the contract on blockchain B will generate a copy representing that token on blockchain B for the same amount, thus generating 10 ERC20 tokens. 
The tokens received in blockchain A will serve as collateral for the same amount of tokens generated in blockchain B and will remain locked until you want to do the reverse operation (move from blockchain B to blockchain A). In this case, to move the same tokens from blockchain B to blockchain A, they will be burned in blockchain B and released in blockchain A.
For the case of an ERC721 token it is the same, but with the exception that since they are not fungible, a WRAP of the token will be generated in blockchain B. 


##### D)  Describe the EIP-2771 standard with your own words and describe some use cases using this EIP.  

- EIP2771  

Interaction with a dApp involves a transaction that costs gas. The goal of the meta transaction is for the dApp to pay for these transactions and not the user. The user signs a message (not a transaction) with the transaction information with his private key but does not execute it, but sends it to a relayer who verifies it. The relayer converts the signed transaction into an Ethereum transaction and executes it with its signature. The contract receives that transaction.


##### E)  What are the centralization issues to be aware of when developing a smart contract ? Propose a technical solution for each of them.  

The main centralization problem is the use of a single private key for the administration of a smart contract. The best practice for this is the use of multi signature wallets. Normal wallets have one private key that is used to sign transactions, giving the user complete control of that digital wallet.
Multi sig wallets do not depend on a single private key to control all the funds in a given wallet, but would need several private keys to close a transaction.

Another problem is that of oracles. To interact with the real world, smart contracts must be dependent on oracles. Many of these contracts are programmed to perform automatic executions based on certain data they receive through these oracles, which obtain off-chain data from APIs or market data sources or even from hardwares.
Centralized oracles, although operating in the best way, are exposed to problems outside the centralized chain, such as DDOS attacks, hacks or downtime.
One of the best current solutions is decentralized oracles. The decentralized oracle uses a decentralized network of nodes to obtain real life data. Thus, information collection is not centralized at a single point, but information is collected from multiple information sources, which helps minimize risk. Each node cryptographically signs the data provided to smart contracts, this will help users see which nodes are good and which are not, based on their reputation, as the data they provide will be signed.


##### F)  What process (step by step) do you follow to build a protocol (a set of smart contracts) from given specifications?  

Step 1: Identify a suitable use case  
Step 2: Identify the most suitable consensus mechanism  
Step 3: Identify the most suitable platform (Blockchain)  
Step 4: Study on new solutions and similar solutions  
Step 5: Deconstruct the problem into action points  
Step 6: Implement them  
Step 7: Test the implementation  


##### G)  After analyzing the file “Signature.sol”, describe the use case of this contract, how to use it and all the technical steps (off-chain & on-chain) & key methods of the contract.

Steps:  
0 - message to sign  
1 - hash(message)  
2 - sign(hash(message), private key) / off-chain  
3 - ecrecover(hash(message), signature) == signer  

The purpose of the contract is to verify the signer.  
We pass to the verify() function as argument  
	- the signer  
	- the message  
	- the signature  
	
The first thing will be to hash the message in the getMessageHash() function using the cryptographic function keccak256 which takes a hexadecimal argument obtained by encoding the message with abi.encodePacked.  

Then the resulting hash (bytes32) in the getEthSignedMessageHash() function adds the prefix "\x19Ethereum Signed Message:\n" to recognize it as an Ethereum specific signature. 
After adding the prefix and along with the signature, the recoverSigner() function retrieves the signer and the signer must match the address of the signer of the message. 
The recoverSigner() function uses a built in ecrecover() function that accepts the prefixed message hash and the ECDSA signature components, which consist of three parameters: r, s and v.  

r: first 32 bytes of the signature  
s: the second 32 bytes of the signature  
v: last 1 byte of the signature  

and returns the address used to sign the message.
The signature to be received by the verify() function will be obtained out of the chain by signing with the wallet (Metamask) the hash of the message obtained by the getMessageHash() function.


##### I)  How would you build a proxy contract where the implementation lives in another contract in solidity (do not worry about syntax error or mispel)

A proxy contract is a contract that delegates calls to another contract and to interact with the actual contract it must go through the proxy and the proxy knows which contract to delegate the call to. It is possible to modify part or all of the contract.
It is used to update contracts. The proxy contract remains immutable, but a new contract can be implemented behind it by simply changing the destination address.
The danger of this is that we have no guarantee that the contract it points to is not malicious. 
The proxy contract communicates with these contracts through the delegatecall function. This function allows us to keep the msg.sender of the original address, that is, the msg.sender of the contract pointed to by the proxy contract will not be the address of the proxy contract but the one signed by the proxy contract. All values of the contract pointed to by the proxy contract will be stored in the proxy contract. The fact that the values are not stored in the contract that the proxy contract points to gives us the freedom that if it then points to another contract, everything is stored in the proxy contract and not in the contract it pointed to before. It allows us to execute functions of another contract under the context of the proxy contract. 

