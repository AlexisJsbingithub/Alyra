# ALYRA TEST VOTING

## UNIT TESTS

48 validated tests

All the functions of the contract are tested

1 file : TestVoting.js

### ** BUG TEST BLOCKED GAME **

- Test 0 - The game can be blocked without really playing because of the startProposalsRegistering function which makes an unrelevant check on the default value of the enum

### I. TEST THAT SOME FUNCTIONS CAN ONLY BE CALLED BY THE ADMINISTRATOR (ONLYOWNER)

- Test 1 - The function addVoter can only be executed by the administrator (onlyOwner)
- Test 2 - The function startProposalsRegistering can only be executed by the administrator (onlyOwner)
- Test 3 - The function endProposalsRegistering can only be executed by the administrator (onlyOwner)
- Test 4 - The function startVotingSession can only be executed by the administrator (onlyOwner)
- Test 5 - The function endVotingSession can only be executed by the administrator (onlyOwner)
- Test 6 - The function tallyVotes can only be executed by the administrator (onlyOwner)

### II. TEST THE LOGICAL SEQUENCE OF THE WORKFLOW WHICH MUST NOT ALLOW THE CALL OF A FUNCTION WITHOUT BEING REGISTERED AS A VOTER.

- Test 7 - The function getVoter cannot be called because the logical sequence of the workflow does not allow it
- Test 8 - The function getOneProposal cannot be called because the logical sequence of the workflow does not allow it
- Test 9 - The function addProposal cannot be called because the logical sequence of the workflow does not allow it
- Test 10 - The function setVote cannot be called because the logical sequence of the workflow does not allow it

### III. TEST THAT THE WORKFLOW STATUS DOES NOT ALLOW TO CALL OTHER FUNCTIONS THAN ADDVOTER (WITHOUT THE POSSIBLE BLOCKING GAME SEQUENCE)

- Test 11 - The function endProposalsRegistering cannot be executed because the workflowstatus does not allow it
- Test 12 - The function startVotingSession cannot be executed because the workflowstatus does not allow it
- Test 13 - The function endVotingSession cannot be executed because the workflowstatus does not allow it
- Test 14 - The function tallyVotes cannot be executed because the workflowstatus does not allow it

### IV. TEST VOTER REGISTRATION BY ADDRESS

- Test 15 - Register the first 9 ganache addresses, register the 10th address and test the VoterRegistered event
- Test 16 - Test if the last address (the 10th) is registered and correctly initiated
- Test 17 - The function addVoter does not allow to register the same address more than once (test on address 6)

### V. TEST OF THE REGISTRATION OF NEW PROPOSALS

- Test 18 - The function addProposal cannot be executed by a registered voter (for this test : the address2) because the workflowstatus does not allow it
- Test 19 - Workflow status change event to ProposalsRegistrationStarted
- Test 20 - The function getOneProposal cannot send a result because there was no proposal registered (error not handled)
- Test 21 - Insert 9 proposals of the first 9 ganache addresses, and insert a tenth and test the ProposalRegistered event
- Test 22 - The function addProposal cannot be executed because the address is not allowed to register a proposal
- Test 23 - The function addProposal cannot be executed by a voter (for this test : the address6) because the proposal is empty
- Test 24 - Test that a voter (for this test : the address2) can verify that the description of proposition 10 is equal to 'Proposition 10 : tous les participants Alyra ont 10 exercices corrects'
- Test 25 - Test that a voter (for this test : the address10) can verify that the description of proposition 1 is equal to 'Proposition 1 : tous les participants Alyra ont 1 exercice correct'
- Test 26 - Workflow status change event to ProposalsRegistrationEnded
- Test 27 - The function addProposal cannot be executed by a registered voter (for this test : the address2) because the workflowstatus does not allow it

### VI. TEST THAT THE WORKFLOW STATUS DOES NOT ALLOW TO CALL OTHER FUNCTIONS THAN STARTVOTINGSESSION

- Test 28 - The function addVoter cannot be executed because the workflowstatus does not allow it
- Test 29 - The function startProposalsRegistering cannot be executed because the workflowstatus does not allow it
- Test 30 - The function addProposal cannot be executed because the workflowstatus does not allow it
- Test 31 - The function endProposalsRegistering cannot be executed because the workflowstatus does not allow it
- Test 32 - The function setVote cannot be executed because the workflowstatus does not allow it
- Test 33 - The function endVotingSession cannot be executed because the workflowstatus does not allow it
- Test 34 - The function tallyVotes cannot be executed because the workflowstatus does not allow it

### ** BUG TEST THAT IT IS POSSIBLE TO HAVE A WINNING PROPOSAL WITHOUT RUNNING THE SETVOTE AND TALLYVOTES FUNCTIONS BECAUSE OF THE DEFAULT VALUE OF THE VARIABLES **

- Test 35 - The id of the winning proposal is not found/executed but it is possible to have a winning proposal

### VII. TEST OF THE REGISTRATION OF VOTES FOR PROPOSALS

- Test 36 - Workflow status change event to startVotingSession
- Test 37 - The function setVote cannot be executed because the id of the proposal does not exist
- Test 38 - Register the first 9 votes cast by the first 9 ganache addresses, with no votes for proposition 3, and with address 10 voting for proposition 8 (which will therefore have 2 votes), with the test of this last event
- Test 39 - The function setVote cannot be executed twice by the same address
- Test 40 - Verification that the 3rd proposition has no vote, and that it corresponds to 'Proposition 3 : all Alyra participants have 3 correct exercises'
- Test 41 - With several addresses it is possible to verify that proposition 8 has 2 votes (made by address 7 and address 10), and that it corresponds to 'Proposition 8 : all Alyra participants have 8 correct exercises'

### ** ERROR TEST OF THE VOTE OF THE PROPOSAL WHICH DOES NOT EXIST AND WHICH IS NOT TREATED BY THE REVERT 'PROPOSAL NOT FOUND' **

- Test 42 - The function setVote generate an error not handled by the 'Proposal not found' revert because it is possible to give in a proposal id longer than the length of the proposal table

### VIII. TESTS - COUNTING THE VOTES AND PUBLISHING THE WINNING PROPOSAL

- Test 43 - The function tallyVotes cannot be executed because the workflowstatus does not allow it
- Test 44 - Workflow status change event to endVotingSession
- Test 45 - The id of the winning proposal is not initiated (regardless of the bug tested before, the default value)
- Test 46 - The search for the winning proposal was executed with the event
- Test 47 - The winning proposition corresponds to proposition 8 'Proposition 8 : tous les participants Alyra ont 8 exercices corrects', and did get two votes
