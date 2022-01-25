
import pytest, random
from brownie import *



class Utilities :
    # class that sets up the deployment of SCs and gives an API to calling SCs function 
    def __init__(self, DonationPlatform, DonationNFT, accounts) -> None:
    
        self.administrator, self.donators = accounts[0], accounts[1:]
 
        self.donationNFT = self.administrator.deploy(DonationNFT, 'DonationNFT', 'DNFT')
        self.donationPlatform = self.administrator.deploy(DonationPlatform, self.donationNFT.address)
        
    def transferOwnership(self):

        self.donationNFT.transferOwnership(self.donationPlatform.address, {'from': self.administrator})

    def randomness(self):
        # randomly chooses donator, ETH amount, campaignId, ...
        signer = random.choice([self.administrator, *(self.donators)])
        donator = random.choice(self.donators)
        amount = Wei(f'{0.0001+random.random():.5f} ether') # can be used both as a donation amount as well as campaign's goal amount
        
        nCampaigns = random.randint(0, self.donationPlatform.campaignsCounter())
        campaign = self.getCampaign(random.randint(0, nCampaigns))

        duration = random.randint(40, 60)

        return {'signer': signer, 'donator': donator, 'amount': amount, 'campaign': campaign, 'duration': duration}

    def createCampaign(self, props = {}):
        # creates a campaign based on 'props' - whatever 'prop' is not provided, a random / default value will be given
        signer = props.get('signer', self.administrator)
        name = props.get('name', f"Campaign:{self.randomness()['amount']}")
        description = props.get('name', f"Description:{self.randomness()['amount']}")
        goalAmount = props.get('goalAmount', self.randomness()['amount'])
        duration = props.get('duration', self.randomness()['duration'])

        tx = self.donationPlatform.createCampaign(name, description, goalAmount, duration, {'from': signer})
        
        return {'id': self.donationPlatform.campaignsCounter() - 1,
            'signer': signer,
            'name': name, 
            'description': description, 
            'goalAmount': goalAmount, 
            'receivedAmount': 0,
            "duration": duration, 
            'expirationTime': chain[-1]['timestamp'] + duration,
            'fundsWithdrawn': 0,
            'tx': tx}

    def getCampaign(self, campaignId):

        name, description, goalAmount, receivedAmount, expirationTime, fundsWithdrawn = self.donationPlatform.campaigns(campaignId)

        return {'id': campaignId,
            'name': name, 
            'description': description, 
            'goalAmount': goalAmount,
            'receivedAmount': receivedAmount, 
            "expirationTime": expirationTime, 
            'fundsWithdrawn': fundsWithdrawn}

    def donate(self, props = {}):
        # donates to a campaign based on 'props' - whatever 'prop' is not provided, a random / default value will be given
        campaign = self.getCampaign(props.get('campaignId', self.randomness()['campaign']['id']))
        donator = props.get('donator', self.randomness()['donator'])
        specificAmount = 'amount' in props.keys()
        actualDonation = amount = props.get('amount', self.randomness()['amount'])
        reachesGoalAmount =  props.get('reachesGoalAmount', False)

        if not specificAmount:
            if (reachesGoalAmount == True) :
                actualDonation = campaign['goalAmount'] - campaign['receivedAmount']
                amount += actualDonation
            else :
                amount = (campaign['goalAmount'] - campaign['receivedAmount']) // random.randint(2, 7)
                actualDonation = amount

        tx = self.donationPlatform.donate(campaign['id'], {'from': donator, 'value': amount})

        return {'campaign': campaign, 'donator': donator, 'amount': amount, 'actualDonation': actualDonation, 'reachedGoalAmount': reachesGoalAmount, 'tx' : tx}

    def withdraw(self, props = {}):
        # withdraws from a campaign based on 'props' - whatever 'prop' is not provided, a random / default value will be given
        campaign = self.getCampaign(props.get('campaignId', self.randomness()['campaign']['id']))
        signer = props.get('signer', self.administrator)

        tx = self.donationPlatform.withdraw(campaign['id'], {'from': signer})

        return {'campaign': campaign, 'signer': signer, 'tx': tx}


    def award(self, props = {}):
        # awards an NFT based on 'props'- whatever 'prop' is not provided, a random / default value will be given
        signer = props.get('signer', self.administrator)
        winner = self.randomness()['signer']
        tx = self.donationNFT.award(winner, {'from': signer})

        return {'signer': signer, 'winner': winner, 'tx': tx}
