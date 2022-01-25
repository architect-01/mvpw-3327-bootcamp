import pytest, brownie, random, time
from brownie import *



def arrangeCampaigns(UTILS, props={}):
    # helper function - creates N random campaigns to which donations can be made
    nCampaigns = props.get('nCampaigns', random.randint(1, 4))
    campaigns = [UTILS.createCampaign() for _ in range(nCampaigns)]
    randomCampaign = random.choice(campaigns)

    return {'campaigns': campaigns, 'randomCampaign': randomCampaign}

@pytest.fixture()
def transferOwnership(UTILS):
    # transfers the ownership of the NFT SC from administrator to the DonationsPlatform SC
    UTILS.transferOwnership()

@pytest.mark.parametrize('N_DONATIONS', [1, random.randint(3, 6)])
def test_able_to_donate_to_campaign(transferOwnership, UTILS, N_DONATIONS):

    campaign = arrangeCampaigns(UTILS)['randomCampaign']

    expectedBalance = 0

    for _ in range(N_DONATIONS):

        donation = UTILS.donate({'campaignId': campaign['id'], 'reachesGoalAmount': False})
        expectedBalance += donation['amount']

        campaign = UTILS.getCampaign(campaign['id'])

        assert UTILS.donationPlatform.balance() == expectedBalance
        assert campaign['receivedAmount'] == expectedBalance

def test_caps_the_donation_to_the_goal_amount(transferOwnership, UTILS):

    campaign = arrangeCampaigns(UTILS)['randomCampaign']

    donation = UTILS.donate({'campaignId': campaign['id'], 'reachesGoalAmount': True})

    campaign = UTILS.getCampaign(campaign['id'])

    assert UTILS.donationPlatform.balance() == campaign['receivedAmount']
    assert UTILS.donationPlatform.balance() == campaign['goalAmount']

@pytest.mark.parametrize('N_DONATIONS', [1, random.randint(3, 6)])
def test_returns_excess_funds_to_the_donator(transferOwnership, UTILS, N_DONATIONS):

    campaign = arrangeCampaigns(UTILS)['randomCampaign']

    [UTILS.donate({'campaignId': campaign['id']}) for _ in range(N_DONATIONS)]

    donation = UTILS.donate({'campaignId': campaign['id'], 'reachesGoalAmount': True})

    campaign = UTILS.getCampaign(campaign['id'])
    expectedRefund = donation['amount'] - donation['actualDonation']

    assert expectedRefund == donation['tx'].internal_transfers[0]['value']

def test_emits_event_that_the_donation_has_been_made(transferOwnership, UTILS):

    campaign = arrangeCampaigns(UTILS)['randomCampaign']

    donation = UTILS.donate({'campaignId': campaign['id']})

    event = donation['tx'].events['CampaignReceivedDonation']

    assert event['id'] == campaign['id']
    assert event['name'] == campaign['name']
    assert event['description'] == campaign['description']
    assert event['goalAmount'] == campaign['goalAmount']
    assert event['expirationTime'] == campaign['expirationTime']
    assert event['donation'] == donation['actualDonation']
    assert event['remainingAmount'] == campaign['goalAmount'] - donation['actualDonation']

def test_emits_event_that_the_donation_has_reached_its_goal_amount(transferOwnership, UTILS):

    campaign = arrangeCampaigns(UTILS)['randomCampaign']

    donation = UTILS.donate({'campaignId': campaign['id'], 'reachesGoalAmount': True})

    event = donation['tx'].events['CampaignGoalReached']

    assert event['id'] == campaign['id']
    assert event['name'] == campaign['name']
    assert event['description'] == campaign['description']
    assert event['goalAmount'] == campaign['goalAmount']
    assert event['expirationTime'] == campaign['expirationTime']


def test_adds_all_donations_to_the_campaign_fund(transferOwnership, UTILS):

    campaigns = arrangeCampaigns(UTILS)['campaigns']

    for _ in range(random.randint(2, 5)):
        randomCampaign = UTILS.getCampaign(random.randint(0, len(campaigns)-1))
        prevBalance = randomCampaign['receivedAmount']

        donations = [UTILS.donate({'campaignId': randomCampaign['id'], 'reachesGoalAmount': False}) for _did in range(random.randint(2, 5))]
        donationSum = sum([x['actualDonation'] for x in donations])

        randomCampaign = UTILS.getCampaign(randomCampaign['id'])
        currBalance = randomCampaign['receivedAmount']

        assert donationSum == currBalance - prevBalance

def test_reverts_when_donating_to_non_existent_campaign(transferOwnership, UTILS):
    campaigns = [UTILS.createCampaign() for _ in range(random.randint(0, 5))]
    nonExistentCampaignId = len(campaigns) + random.randint(0, 3)
    with brownie.reverts("Bad campaign ID - cannot donate to the campaigns not yet created."):
        UTILS.donate({'campaignId': nonExistentCampaignId})

def test_reverts_when_donation_amount_is_0(transferOwnership, UTILS):
    campaign = UTILS.createCampaign()
    with brownie.reverts("Cannot donate 0 WEI."):
        UTILS.donate({'campaignId': campaign['id'], 'amount': 0})

def test_reverts_when_donating_to_a_campaign_that_reached_goal_amount(transferOwnership, UTILS):
    campaign = UTILS.createCampaign()
    UTILS.donate({'campaignId': campaign['id'], 'reachesGoalAmount': True})
    with brownie.reverts("Cannot donate - Funds for the campaign have already been gathered."):
        UTILS.donate({'campaignId': campaign['id'], 'amount': random.randint(1223, 123445)})

def test_reverts_when_donating_to_a_campaign_that_reached_time_goal(transferOwnership, UTILS):
    campaign = UTILS.createCampaign()
    time.sleep(campaign['duration'] + 1)
    with brownie.reverts("Cannot donate - Time for the campaign has expired."):
        UTILS.donate({'campaignId': campaign['id']})
