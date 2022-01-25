// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.11;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/** 
 * @title DonationPlatform
 * @dev Implements creation of and contribution to Donation Campaigns 
 */
contract DonationPlatform is Ownable, ReentrancyGuard{

    using Counters for Counters.Counter;

    struct Campaign {
        string name;                // campaigns name
        string description;         // campaigns description
        uint goalAmount;            // desired amount of WEI that should be collected
        uint receivedAmount;        // amount of funds that were donated to the campaign
        uint expirationTime;        // timestamp after which campaign is no longer active
        uint fundsWithdrawn;        // flag that says whether the funds for a campaign have been withdrawn by administrator
    }

    mapping (uint => Campaign) public campaigns;

    Counters.Counter campaignsCounter;      // number of campaigns that have been created

    event CampaignCreated(uint id, string name, string description, uint goalAmount, uint expirationTime); // Emmited when the campaign has been created
    event CampaignReceivedDonation(uint id, string name, string description, uint goalAmount, uint expirationTime, uint donation, uint remainingAmount); // Emmited when the campaign has received a donation
    event CampaignGoalReached(uint id, string name, string description, uint goalAmount, uint expirationTime); // Emmited when the campaign's money goal has been reached

    /** 
     * @dev Create a Donation Platform .
     */
    constructor() {
        campaignsCounter.reset();
    }
    
    /** 
     * @dev Creates a new campaign. May only be called by 'administrator'.
     * @param _name name of the campaign
     * @param _description description of the campaign
     * @param _goal amount in WEI
     * @param _expiresIn number of seconds in which the campaign will finish  
     */
    function createCampaign(string memory _name, string memory _description, uint _goal, uint _expiresIn) onlyOwner public {

        require(
            _goal > 0,
            "Campaign goal amount cannot be 0."
        );
        require(
            _expiresIn > 0,
            "Campaign cannot last 0 seconds."
        );

        uint expirationTime = block.timestamp + _expiresIn;
        uint currentCampaignId = campaignsCounter.current();
        campaigns[currentCampaignId] = Campaign({name : _name,
                                                description : _description,
                                                goalAmount : _goal,
                                                receivedAmount : 0,
                                                expirationTime : expirationTime,
                                                fundsWithdrawn : 0});
        campaignsCounter.increment();

        emit CampaignCreated(currentCampaignId, 
                            _name, 
                            _description, 
                            _goal, 
                            expirationTime);
    }

    /**
     * @dev Donate to the campaign if the time for campaign has not elapsed and goal amount has not been reached
     * @param _campaignId id of the campaign to which donation should be made
     */
    function donate(uint _campaignId) public payable virtual {

        Campaign storage campaign = campaigns[_campaignId];

        require(
            _campaignId < campaignsCounter.current(),
            "Bad campaign ID - cannot donate to the campaigns not yet created."
        );
        require(
            msg.value > 0,
            "Cannot donate 0 WEI."
        );
        require(
            campaign.receivedAmount < campaign.goalAmount,
            "Cannot donate - Funds for the campaign have already been gathered."
        );
        require(
            campaign.expirationTime > block.timestamp,
            "Cannot donate - Time for the campaign has expired."
        );

        // msg.value can exceed the amount that is needed to conclude a campaign - excess amount will be returned
        uint donation;      
        uint refund; 
        uint remainder;

        if(msg.value + campaign.receivedAmount >= campaign.goalAmount) { // goal is reached 

            // cap the donation and setup for the excess funds to be returned
            donation = campaign.goalAmount - campaign.receivedAmount;      
            refund = msg.value - donation;
            remainder = 0;

        } else { // goal will not be reached with this donation

            donation = msg.value;
            refund = 0;
            remainder = campaign.goalAmount - campaign.receivedAmount - donation;

        }

        campaign.receivedAmount += donation;

        if(refund > 0) {
            (bool sent, ) = payable(msg.sender).call{value: refund}("");
            require(sent, "Failed to send the excess amount to the donator.");
        }

        emit CampaignReceivedDonation(_campaignId, 
                                    campaign.name, 
                                    campaign.description, 
                                    campaign.goalAmount,
                                    campaign.expirationTime,
                                    donation,
                                    remainder);

        if(remainder == 0) {
            emit CampaignGoalReached(_campaignId,
                                campaign.name, 
                                campaign.description, 
                                campaign.goalAmount,
                                campaign.expirationTime);
        }

    }

    /**
     * @dev Withdraw from a specific campaign if it that is possible (time or money goal has been reached)
     * @param _campaignId id of the campaign from which to withdraw the funds
     */
    function withdraw(uint _campaignId) onlyOwner nonReentrant public {
        // There can be multiple campaigns at one time. Each campaign has effectively it's own balance
        // It is important to avoid the "Re-Entrance" problem (even though administrator will get all of the money regardless)
        Campaign storage campaign = campaigns[_campaignId];

        require(
            (campaign.expirationTime <= block.timestamp) || (campaign.receivedAmount == campaign.goalAmount),
            "Cannot withdraw - Campaign is not yet finished or the goal has not been reached."
        );

        require(
            campaign.fundsWithdrawn == 0,
            "Cannot withdraw - Funds for this campaign have already been withdrawn."
        );

        campaign.fundsWithdrawn = 1;
        (bool sent, ) = payable(owner()).call{value: campaign.receivedAmount}("");
        require(sent, "Failed to withdraw.");

    }
}
