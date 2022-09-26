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


Merkle root

In the block we can find the Merkle root, which arises from the Merkle tree. 
It is used to verify the transactions in the block. As I mentioned before, it is a tree like data structure with a hierarchical order from top to bottom, where at the base are the hashes of all the transactions in the block sorted. 
Suppose we have transactions T1, T2, T3 and T4, in that order.
All these transactions will be hashed, following the example, the hashes would be H1, H2, H3 and H4, and they would be the leaves of the lowest level of the tree, and from these arise the leaves of the next level, which will be hashed in pairs (in the case of being odd, the last one copies itself), H12 will be the hash of H1 and H2, and H34 will be the hash of H3 and H4, and finally H1234 (root) will be the hash of H12 and H34, resulting in the root of the Merkle tree, which will be a summary hash of the transactions in the block. As you can see this root arises from the hashes of all the leaf values and not the other way around. There will only be one Merkle root per block.
So with that hash all the transactions in the block are represented instead of reloading the block with all the hashes of those transactions. 
Suppose there are 500 transactions and we know that each hash of each transaction weighs 32 bytes, that block would hold 16,000 bytes, but with the Merkle root it can only hold 32 bytes. The rest is mathematically contained, so it is not necessary to include them.


Digital signatures

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

Blockchain

The existence of blockchain immutability depends on the hash, since each block has a unique identification of that block which is a hash of its header, where in that header is, among other data, the hash of the previous block, so that these are linked and in turn this with the next one.
As we saw before, any change, no matter how small, will change the resulting hash, and as these are linked, all the following blocks will change.
Keep in mind that it is not just any hash that is given to the block, but it has to start with a specific number of zeros determined by the target. 

As the header information cannot be changed in order to achieve this hash with a specific number of zeros at the beginning, a nonce comes into play, which is a random number that will be changed by the miners to find the valid hash.


##### B)  What are the bottlenecks in terms of performance when operating on a network like Ethereum? What kind of solutions can be utilized to overcome them?

##### C)  What are the different types of bridges and how do they work ? Explain in detail step by step how bridging an ERC721 would work.

##### D)  Describe the EIP-2771 standard with your own words and describe some use cases using this EIP.

##### E)  What are the centralization issues to be aware of when developing a smart contract ? Propose a technical solution for each of them.

##### F)  What process (step by step) do you follow to build a protocol (a set of smart contracts) from given specifications ?

##### G)  After analyzing the file “Signature.sol”, describe the use case of this contract, how to use it and all the technical steps (off-chain & on-chain) & key methods of the contract.

#####
