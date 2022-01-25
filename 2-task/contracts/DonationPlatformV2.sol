// SPDX-License-Identifier: MIT
pragma solidity ^0.8.11;

import "./DonationPlatform.sol";
import "./DonationNFT.sol";

/** 
 * @title DonationPlatformV2
 * @dev Improves the Donation Platform with an ability to reward first time donators with an NFT
 */
contract DonationPlatformV2 is DonationPlatform {

    mapping (address => bool) hasDonatedBefore;

    event FirstTimeDonator (address _donator);

    DonationNFT immutable nftFactory;

    /**
     * @dev Constructor
     * @param _nftFactoryAddress address of the ERC721 contract
     */
    constructor (address _nftFactoryAddress) {
        nftFactory = DonationNFT(_nftFactoryAddress);
    }

    /**
     * @dev Donate to the campaign if the time for campaign has not elapsed and goal amount has not been reached
     * @param _campaignId id of the campaign to which donation should be made
     */
    function donate(uint _campaignId) public payable override {
        super.donate(_campaignId);
        _rewardIfFirstTimeDonator(msg.sender);
    }

    /**
     * @dev Reward a user with an NFT after their first donation
     * @param _donator Address of the user (donator)
     */
    function _rewardIfFirstTimeDonator(address _donator) internal {

        if(hasDonatedBefore[_donator] == false) {

            hasDonatedBefore[_donator] = true;
            nftFactory.award(_donator);

            emit FirstTimeDonator(_donator);
        }
    }

}