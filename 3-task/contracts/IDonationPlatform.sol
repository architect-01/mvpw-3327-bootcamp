// SPDX-License-Identifier: MIT

pragma solidity ^0.8.11;

/** 
 * @title IDonationPlatform
 * @dev Required interface of an DonationsPlatform compliant contract.
 */
interface IDonationPlatform {

    /**
     * @dev Emitted when a campaign is created.
     */
    event CampaignCreated(uint id, string name, string description, uint goalAmount, uint expirationTime); // Emmited when the campaign has been created
  
    /**
     * @dev Emitted when a campaign receives a valid donation 
     */
    event CampaignReceivedDonation(uint id, string name, string description, uint goalAmount, uint expirationTime, uint donation, uint remainingAmount); // Emmited when the campaign has received a donation
    
    /**
     * @dev Emitted when a donation helps a campaign to reach it's goal amount
     */
    event CampaignGoalReached(uint id, string name, string description, uint goalAmount, uint expirationTime); // Emmited when the campaign's money goal has been reached
    
    /**
     * @dev Emitted when there is a new donator to the platform (a.k.a first time donator)
     */
    event FirstTimeDonator(address donator);

    /**
     * @dev Emitted when the administrator withdraws the funds for a specific campaign
     */
    event WithdrawalMade(uint id, uint amount);

     /** 
     * @dev Creates a new campaign. May only be called by 'administrator'.
     * @param _name name of the campaign
     * @param _description description of the campaign
     * @param _goal amount in WEI
     * @param _expiresIn number of seconds in which the campaign will finish  
     */
    function createCampaign(string memory _name, string memory _description, uint _goal, uint _expiresIn) external;

    /**
     * @dev Donate to the campaign if the time for campaign has not elapsed and goal amount has not been reached
     * @param _campaignId id of the campaign to which donation should be made
     */
    function donate(uint _campaignId) external payable ;

    /**
     * @dev Withdraw from a specific campaign if it that is possible (time or money goal has been reached)
     * @param _campaignId id of the campaign from which to withdraw the funds
     */
    function withdraw(uint _campaignId) external;

}