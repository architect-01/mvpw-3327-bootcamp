import pytest, random
from brownie import *
from utils import *


@pytest.fixture(scope="module", autouse=True)
def UTILS(DonationPlatform, DonationNFT, accounts):
    yield Utilities(DonationPlatform, DonationNFT, accounts)


@pytest.fixture(autouse=True)
def isolation(fn_isolation):
    pass
