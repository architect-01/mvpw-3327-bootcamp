import pytest, random, time, brownie
from utils import *

def setState(UTILS, props = {}):
    nCampaigns = props.get('nCampaigns', 1)
    campaigns = [UTILS.createCampaign() for _ in range(nCampaigns)]

    random.shuffle(campaigns)

    tic = time.time()

    for campaign in campaigns:
        donations = [UTILS.donate({'campaignId': campaign['id']}) for _did in range(random.randint(1, 4))]

    random.shuffle(campaigns)

    reachesGoalAmount = props.get('reachesGoalAmount', False)
    for campaign in campaigns:
        if reachesGoalAmount:
            UTILS.donate({'campaignId': campaign['id'], 'reachesGoalAmount': True})

    elapsed = time.time() - tic

    random.shuffle(campaigns)

    return {'campaigns': campaigns, "donations" : donations, 'elapsed' : elapsed}

@pytest.fixture()
def transferOwnership(UTILS):
    UTILS.transferOwnership()

@pytest.mark.parametrize('N_CAMPAIGNS', [1, 3])
def test_able_to_withdraw_after_goal_amount_has_been_reached(transferOwnership, UTILS, N_CAMPAIGNS):

    state = setState(UTILS, {'nCampaigns': N_CAMPAIGNS, 'reachesGoalAmount': True})

    random.shuffle(state['campaigns'])

    for campaign in state['campaigns']:

        withdrawal = UTILS.withdraw({'campaignId': campaign['id']})
        campaign = UTILS.getCampaign(campaign['id'])
        
        assert withdrawal['tx'].internal_transfers[0]['value'] == campaign['goalAmount']
        assert campaign['fundsWithdrawn'] == 1

        event = withdrawal['tx'].events['WithdrawalMade']
        assert event['id'] == campaign['id']
        assert event['amount'] == campaign['receivedAmount']

        
@pytest.mark.parametrize('N_CAMPAIGNS', [1, random.randint(3, 6)])
def test_able_to_withdraw_after_time_goal_has_been_reached(transferOwnership, UTILS, N_CAMPAIGNS):

    state = setState(UTILS, {'nCampaigns': N_CAMPAIGNS, 'reachesGoalAmount': False})

    for campaign in state['campaigns']:

        time.sleep(max(campaign['duration'] - state['elapsed'], 0))

        withdrawal = UTILS.withdraw({'campaignId': campaign['id']})

        campaign = UTILS.getCampaign(campaign['id'])
        
        assert withdrawal['tx'].internal_transfers[0]['value'] == campaign['receivedAmount']
        assert campaign['fundsWithdrawn'] == 1

        event = withdrawal['tx'].events['WithdrawalMade']
        assert event['id'] == campaign['id']
        assert event['amount'] == campaign['receivedAmount']
      

def test_reverts_when_non_administrator_tries_withdraw(transferOwnership, UTILS):
    state = setState(UTILS)
    for campaign in state['campaigns']:
        donator = UTILS.randomness()['donator']
        with brownie.reverts("Ownable: caller is not the owner"):
            UTILS.withdraw({ 'campaignId': campaign['id'], 'signer': donator})

def test_reverts_when_withdrawal_is_tried_for_campaign_not_yet_created(transferOwnership, UTILS):
    state = setState(UTILS, {'reachesGoalAmount': True})
    nonExistentCampaignId = random.randint(3, 100) + len(state['campaigns'])
    with brownie.reverts('Cannot withdraw - Campaign with that ID has not yet been created.'):
        UTILS.withdraw({'campaignId': nonExistentCampaignId})

def test_reverts_when_neither_goal_has_been_reached_but_withdrawal_is_tried(transferOwnership, UTILS):
    state = setState(UTILS, {'reachesGoalAmount': False})
    for campaign in state['campaigns']:
        with brownie.reverts('Cannot withdraw - Campaign is not yet finished or the goal has not been reached.'):
            UTILS.withdraw({'campaignId': campaign['id']})

def test_reverts_when_subsequent_withdraws_are_tried(transferOwnership, UTILS):
    state = setState(UTILS, {'reachesGoalAmount': True})
    for campaign in state['campaigns']:
        UTILS.withdraw({'campaignId': campaign['id']})
        with brownie.reverts('Cannot withdraw - Funds for this campaign have already been withdrawn.'):
            UTILS.withdraw({'campaignId': campaign['id']})

