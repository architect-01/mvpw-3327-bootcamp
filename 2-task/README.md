# MVPW 3327 Task 2 README

The task's solution is organized within two smart contracts (SC) : `DonationPlatformV2.sol` and `DonationNFT.sol`.

## DonationPlatformV2

- Inherits from the changed SC from task 1 solution (`DonationPlatform.sol` - changes listed bellow)
- Adds the capability of awarding the first time donators with an ERC-721 (NFT) token.

### DonationPlatform (improved version from task 1)

In comparison to the code from Task 1, following changes were made to the `DonationPlatform.sol` :

- Substitution of a `uint` variable for OpenZeppelin's `Counter.sol`
- Slight reorganization of the `Campaign` struct (removed the unused `id` member)
- SC inherits from OpenZeppelin's `Ownable.sol` (substituted customed modifier with `onlyOwner`)
- Removed `administrator` member - SC instead uses the `owner` member from `Ownable.sol`

## DonationNFT

- Inherits from OpenZeppelin's `ERC721.sol` and `Ownable.sol`
- Only the owner can award (mint) new tokens

  Note : Because only owner can mint new tokens, after deploying both contracts, additional transaction is needed to change the ownership of the DonationNFT SC such that DonationPlatformV2 can mint new tokens.

## Deployed Contracts

Contracts were deployed using : `npx hardhat run scripts/1-deploy.js --network rinkeby`

They were verified using the Etherscan api : `npx hardhat verify --network rinkeby DEPLOYED_CONTRACT_ADDRESS arg0 arg1 ... argN`

Etherscan links :

[DonationNFT](https://rinkeby.etherscan.io/address/0x19866f1759c3514BC7AeeCeA78567B4b4EeD2000#code)

[DonationPlatformV2](https://rinkeby.etherscan.io/address/0xC27572960556B58F72C6a94759cAaADbE2b4CD62#code)

## Additional links :

ERC721 Standard : [EIP-721](https://eips.ethereum.org/EIPS/eip-721)

OpenZeppelin's library : [github link](https://github.com/OpenZeppelin/openzeppelin-contracts)
