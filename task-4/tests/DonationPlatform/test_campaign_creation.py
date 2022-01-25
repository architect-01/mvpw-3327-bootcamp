import pytest, brownie, random
from brownie import *



def compareCampaignInfos(expected, actual):
    # helper function - compares all the information associated with campaigns to what it should be
    assert actual['id'] == expected['id']
    assert actual['name'] == expected['name']
    assert actual['description'] == expected['description']
    assert actual['goalAmount'] == expected['goalAmount']
    assert actual['receivedAmount'] == expected['receivedAmount']
    assert actual['expirationTime'] == expected['expirationTime']
    assert actual['fundsWithdrawn'] == expected['fundsWithdrawn']


def test_campaign_counter_initially_equal_to_0(UTILS):
    assert UTILS.donationPlatform.campaignsCounter() == 0

@pytest.mark.parametrize('N_CAMPAIGNS', [1, random.randint(3, 6)])
def test_sets_correct_campaign_information(UTILS, N_CAMPAIGNS):

    expectedCampaignInfo = [UTILS.createCampaign() for _ in range(N_CAMPAIGNS)]
    actualCampaignInfo = [UTILS.getCampaign(cid) for cid in range(N_CAMPAIGNS)]

    for expected, actual in zip(expectedCampaignInfo, actualCampaignInfo):
        compareCampaignInfos(expected, actual)

@pytest.mark.parametrize('N_CAMPAIGNS', [1, random.randint(3, 6)])
def test_emits_event_after_campaign_creation(UTILS, N_CAMPAIGNS):

    campaigns = [UTILS.createCampaign() for _ in range(N_CAMPAIGNS)]

    for campaign in campaigns:
        event = campaign['tx'].events['CampaignCreated']
        assert event['id'] == campaign['id']
        assert event['name'] == campaign['name']
        assert event['description'] == campaign['description']
        assert event['goalAmount'] == campaign['goalAmount']
        assert event['expirationTime'] == campaign['expirationTime']


@pytest.mark.parametrize('N_TRIES', [1, random.randint(3, 6)])
def test_reverts_when_non_administrator_tries_to_create_a_campaign(UTILS, N_TRIES):
    for _ in range(N_TRIES):
        donator = UTILS.randomness()['donator']
        with brownie.reverts("Ownable: caller is not the owner"):
            UTILS.createCampaign({'signer': donator})

@pytest.mark.parametrize('N_TRIES', [1, random.randint(3, 6)])
def test_reverts_when_campaign_goal_amount_is_0(UTILS, N_TRIES):
    for _ in range(N_TRIES):
        with brownie.reverts("Campaign goal amount cannot be 0."):
            UTILS.createCampaign({'goalAmount': 0})

@pytest.mark.parametrize('N_TRIES', [1, random.randint(3, 6)])
def test_reverts_when_campaign_goal_amount_is_0(UTILS, N_TRIES):
    for _ in range(N_TRIES):
        with brownie.reverts("Campaign cannot last 0 seconds."):
            UTILS.createCampaign({'duration': 0})
