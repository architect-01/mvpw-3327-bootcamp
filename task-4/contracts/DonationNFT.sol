// SPDX-License-Identifier: MIT
pragma solidity ^0.8.11;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title DonationNFT
 * @dev ERC721 contract where only the owner can mint (award) new tokens
 */

contract DonationNFT is ERC721, Ownable {

    using Counters for Counters.Counter;

    Counters.Counter public tokenCounter;

    /**
     * @dev Constructor
     * @param _name Name passed to the ERC721 contract
     * @param _symbol Symbol passed to the the ERC721 contract
     */
    constructor (string memory _name, string memory _symbol) ERC721 (_name, _symbol){

    }
    /**
     * @dev Creates (mints) an NFT for the provided address
     * @param _donator Address of the user (donator) to whom the NFT will be given
     */
    function award(address _donator) public onlyOwner returns (uint256) {

        uint newItemId = tokenCounter.current();
        _safeMint(_donator, newItemId);
        
        tokenCounter.increment();

        return newItemId;
    }

}