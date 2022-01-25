import pytest, brownie, random
from brownie import *


@pytest.fixture(scope="module", autouse=True)
def setupState(UTILS):
    UTILS.transferOwnership()

    nCampaigns = random.randint(1, 10)
    state = {'campaigns': [UTILS.createCampaign() for _ in range(nCampaigns)]}

    yield state

@pytest.mark.parametrize('N_DONATIONS', [1, random.randint(3, 6)])
def test_awards_an_NFT_to_first_time_donators(setupState, UTILS, N_DONATIONS):

    donator = UTILS.randomness()['donator']

    assert UTILS.donationNFT.balanceOf(donator.address) == 0

    for donation in range(N_DONATIONS):    
        UTILS.donate({'donator': donator})
        assert UTILS.donationNFT.balanceOf(donator.address) == 1


@pytest.mark.parametrize('N_DONATIONS', [1, random.randint(13, 26)])
def test_it_doesnt_mix_awards_beetween_donators(setupState, UTILS, N_DONATIONS):

    campaigns = setupState['campaigns']

    donators = set()

    for donation in range(N_DONATIONS):   
        donator = UTILS.randomness()['donator']
        randomCampaignId = random.randint(0, len(campaigns)-1)
        UTILS.donate({'campaignId': randomCampaignId, 'donator': donator})
        donators.update([donator.address])
        assert UTILS.donationNFT.balanceOf(donator.address) == 1
        assert UTILS.donationNFT.tokenCounter() == len(donators)

    