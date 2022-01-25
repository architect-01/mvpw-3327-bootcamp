# MVPW 3327 Task 4 README

## Intro

The reasoning of Task 4 solution is similar to the Task 3 solution.
Differences are that :

- instead of separating edge cases from other tests, in cases where that was possible, they are now combined using parametarization.
- duplicated test scenarios (differing only in assertions) were removed and those assertions are combined in one test

### Example :

```python
  @pytest.mark.parametrize('N_CAMPAIGNS', [1, random.randint(3, 6)])
  def test_sets_correct_campaign_information(UTILS, N_CAMPAIGNS):

        expectedCampaignInfo = [UTILS.createCampaign() for _ in range(N_CAMPAIGNS)]
        actualCampaignInfo = [UTILS.getCampaign(cid) for cid in range(N_CAMPAIGNS)]

        for expected, actual in zip(expectedCampaignInfo, actualCampaignInfo):
            compare_campaign_infos(expected, actual)

```

## Full list of tests:

Bellow is the list of all test. Appended to the end of the test's name is "(parameterized)" adjective stating that the test is runned multiple times with different parameters.

**Note:** Because of randomization, complete time for running all of the tests might differ significatly on different runs, but running time should still be under 10 minutes.

### Donation Platform SC

    tests/DonationPlatform/test_campaign_creation.py::test_campaign_counter_initially_equal_to_0
    tests/DonationPlatform/test_campaign_creation.py::test_sets_correct_campaign_information (parameterized)
    tests/DonationPlatform/test_campaign_creation.py::test_emits_event_after_campaign_creation (parameterized)
    tests/DonationPlatform/test_campaign_creation.py::test_reverts_when_non_administrator_tries_to_create_a_campaign (parameterized)
    tests/DonationPlatform/test_campaign_creation.py::test_reverts_when_campaign_goal_amount_is_0 (parameterized)
    tests/DonationPlatform/test_making_donations.py::test_able_to_donate_to_campaign (parameterized)
    tests/DonationPlatform/test_making_donations.py::test_caps_the_donation_to_the_goal_amount
    tests/DonationPlatform/test_making_donations.py::test_returns_excess_funds_to_the_donator (parameterized)
    tests/DonationPlatform/test_making_donations.py::test_emits_event_that_the_donation_has_been_made
    tests/DonationPlatform/test_making_donations.py::test_emits_event_that_the_donation_has_reached_campaigns_goal_amount
    tests/DonationPlatform/test_making_donations.py::test_adds_all_donations_to_the_campaign_fund
    tests/DonationPlatform/test_making_donations.py::test_reverts_when_donating_to_non_existent_campaign
    tests/DonationPlatform/test_making_donations.py::test_reverts_when_donation_amount_is_0
    tests/DonationPlatform/test_making_donations.py::test_reverts_when_donating_to_a_campaign_that_reached_goal_amount
    tests/DonationPlatform/test_making_donations.py::test_reverts_when_donating_to_a_campaign_that_reached_time_goal
    tests/DonationPlatform/test_withdrawals.py::test_able_to_withdraw_after_goal_amount_has_been_reached (parameterized)
    tests/DonationPlatform/test_withdrawals.py::test_able_to_withdraw_after_time_goal_has_been_reached (parameterized)
    tests/DonationPlatform/test_withdrawals.py::test_reverts_when_non_administrator_tries_withdraw
    tests/DonationPlatform/test_withdrawals.py::test_reverts_when_withdrawal_is_tried_for_campaign_not_yet_created
    tests/DonationPlatform/test_withdrawals.py::test_reverts_when_neither_goal_has_been_reached_but_withdrawal_is_tried
    tests/DonationPlatform/test_withdrawals.py::test_reverts_when_subsequent_withdraws_are_tried

### DonationNFT SC

    tests/DonationNFT/test_awards.py::test_has_0_tokens_awarded_after_deployment
    tests/DonationNFT/test_awards.py::test_increments_token_counter_after_an_award (parameterized)
    tests/DonationNFT/test_awards.py::test_adds_tokens_to_addresses_balance (parameterized)
    tests/DonationNFT/test_awards.py::test_reverts_when_non_administrator_tries_to_make_an_award (parameterized)

### Interaction

    tests/Interaction/test_interaction.py::test_awards_an_NFT_to_first_time_donators (parameterized)
    tests/Interaction/test_interaction.py::test_it_doesnt_mix_awards_beetween_donators (parameterized)
