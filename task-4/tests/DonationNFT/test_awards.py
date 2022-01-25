import pytest, brownie, random
from brownie import *


def test_has_0_tokens_awarded_after_deployment(UTILS):
    assert UTILS.donationNFT.tokenCounter() == 0

@pytest.mark.parametrize('N_AWARDS', [1, random.randint(3, 6)])
def test_increments_token_counter_after_an_award(UTILS, N_AWARDS):
    for expectedCount in range(1, N_AWARDS):
        UTILS.award()
        assert UTILS.donationNFT.tokenCounter() == expectedCount

@pytest.mark.parametrize('N_AWARDS', [1, random.randint(4, 11)])
def test_adds_tokens_to_addresses_balance(UTILS, N_AWARDS):

    balances = {}

    for _ in range(N_AWARDS):
        winner = UTILS.award()['winner']
        balances[winner.address] = balances.get(winner.address, 0) + 1

        assert balances[winner.address] == UTILS.donationNFT.balanceOf(winner.address)

@pytest.mark.parametrize('N_TRIES', [1, random.randint(3, 6)])
def test_reverts_when_non_administrator_tries_to_make_an_award(UTILS, N_TRIES):
    for _ in range(N_TRIES):
        donator = UTILS.randomness()['donator']
        with brownie.reverts("Ownable: caller is not the owner"):
            UTILS.award({'signer': donator})
