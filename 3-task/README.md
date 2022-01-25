# MVPW 3327 Task 3 README

## Applied recommended changes from Task 2

- Removed `DonationPlatformV2.sol` - all the functionality is now in `DonationPlatform.sol`
- Added an interface - `IDonationPlatform.sol`
- Removed unnecessary `.reset()` calls on counter variables

## Organization of tests

The main inspiration for how the testing is organized in this repo is drawed from
[Moloch Testing Guide](https://github.com/MolochVentures/moloch/tree/4e786db8a4aa3158287e0935dcbc7b1e43416e38/test#moloch-testing-guide)
which is recommended by OpenZeppelin for a set of principles designed for testing Solidity smart contracts.

## Folder structure

Following Hardhat framework, all tests are under **test** . Two SCs (`DonationsPlatform.sol` and `DonationNFT.sol`) need to be tested separately as well as their interaction.

Folder structure under **test** (each feature is a separate file under the SC folder) :

- **DonationPlatform**
  - CampaignCreation.ts
  - MakingDonations.ts
  - Withdrawals.ts
- **DonationNFT**
  - Awards.ts
- **Interaction**
  - Interaction.ts

**Note**: There exists an **Utils.ts** file which contains helper constants and functions used in the tests.

## Tests

Tests follow the logic that :

1. Each SC has a set of features
2. These features can be used in a correct or incorrect way
3. If they are used in the intended (correct) way, they make a change to the SC state. If not, the SC state shouldn't change

Example (the square brackets are for additional comments) :

    Smart Contract - Feature
        - Correct Use [has an effect on the state]
            - Initial State [after SC deployment]
                - <set of tests>
            - State Update [what changes are supposed to be made after a call]
                - <set of tests>
        - Incorrect Use [must not change the state]
            - Access [what account can call what function]
                - <set of tests>
            - Bad params [disallowed values for the provided params]
                - <set of tests>

## Full list of tests

**Note**: To make the layout consistent, when there are no tests under a category, it will say : **no tests - description why not**

    DonationsPlatform - Campaign Creation
        Correct Use
            Initial State
                ✓ has 0 campaigns after SC deployment
            State Update
                ✓ increments the campaign counter after campaign creation
                ✓ sets the correct name for the campaign
                ✓ sets the correct description for the campaign
                ✓ sets the correct goal amount for the campaign
                ✓ sets the received amount to 0 after campaign creation
                ✓ sets the expirationTime to the correct value
                ✓ sets the fundsWithdrawn to 0 after campaign creation
                ✓ can create multiple campaigns
                ✓ emits an event that a campaign has been created
        Incorrect Use
            Access
                ✓ reverts campaign creation if it is tried by non-administrator
            Bad params
                ✓ reverts campaign creation when it's duration is 0 seconds
                ✓ reverts campaign creation when it's goal amount is 0

    DonationsPlatform - Making Donations
        Correct Use
            Initial State
                ✓ no tests - donations are not tracked
            State Update
                ✓ able to donate to the campaign
                ✓ caps the donation amount to reach only the campaign's goal amount
                ✓ returns the excess funds to the donator
                ✓ emits an event after Donation has been made
                ✓ emits an event that the campaign has reached it's goal amount
                ✓ adds multiple donations to the campaign's funds
        Incorrect Use
            Access
                ✓ no tests - anyone can donate
            Bad params
                ✓ cannot donate 0 WEI
                ✓ reverts donation to a campaign not yet created
                ✓ reverts donation when the goal amount has already been reached
                ✓ reverts donation if the time goal has been reached

    DonationsPlatform - Withdrawals
        Correct Use
            State Update
                ✓ able to withdraw campaign funds after goal amount has been reached
                ✓ able to withdraw campaign funds after time goal has been reached
                ✓ sets fundsWithdrawn to 1 after withdrawal
                ✓ emits an event after withdrawal has been made
                ✓ can withdraw after multiple donations
        Incorrect Use
            Access
                ✓ reverts when called by non-administrator
            Bad Params
                ✓ reverts when trying to withdraw for a campaign not yet created
                ✓ reverts when trying to withdraw for a campaign with no goals reached
                ✓ everts when trying to withdraw for a second time


    DonationNFT - Awards
        Correct Use
            Initial State
                ✓  has 0 tokens awarded after SC deployment
            State Update
                ✓ increments token counter after an award (40ms)
                ✓ increments token counter after multiple awards (540ms)
                ✓ adds token to the address' balance
                ✓ adds multiple tokens to the address' balance (485ms)
        Incorrect Use
            Access
                ✓ reverts when called by non-owner
            Bad Params
                ✓ no test - there are no additional params

    Interaction: DonationPlatform and DonationNFT SC
        Correct Use
            Initial State
                ✓ no tests - unit tests covered it
            State Update
                ✓ awards an NFT to a first time donator
                ✓ it doesnt award an NFT after subsequent donations to the same campaign
                ✓ it doesnt award an NFT after subsequent donations to different campaigns
                ✓ it doesnt mix awards between donators
        Incorrect Use
            Access
                ✓ no tests - unit tests covered it
            Bad params
                ✓ no tests - unit tests covered it
