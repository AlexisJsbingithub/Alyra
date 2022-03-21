// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.8.12;

//Import of the Ownable library of openzeppelin
import "@openzeppelin/contracts/access/Ownable.sol";

//The administrator is the one who deploys the smart contract
contract Voting is Ownable {
    //structure des électeurs
    struct Voter {
        bool isRegistered;
        bool hasVoted;
        uint256 votedProposalId;
    }

    //Association of voter addresses with Voter structures
    mapping(address => Voter) voters;

    //Structure for proposals
    struct Proposal {
        string description;
        uint256 voteCount;
    }

    //A dynamic table containing the voters' proposals
    Proposal[] proposals;

    //Workflow status
    enum WorkflowStatus {
        RegisteringVoters,
        ProposalsRegistrationStarted,
        ProposalsRegistrationEnded,
        VotingSessionStarted,
        VotingSessionEnded,
        VotesTallied
    }

    //Global variable of the workflow status, initialized to the final status to avoid defaulting to RegisteringVoters and blocking the call
    WorkflowStatus public currentStatus = WorkflowStatus.VotesTallied;

    //ID of the winning proposal
    uint256 winningProposalId; //=0;

    //Event of a new voting status
    event WorkflowStatusChange(
        WorkflowStatus previousStatus,
        WorkflowStatus newStatus
    );

    // *********** Start registration of a white list of voters identified by their address ***********
    //Voter address registration event
    event VoterRegistered(address voterAddress);

    //Registration of a white list of voters
    function addVoter(address _address) public onlyOwner {
        // Workflow and voter consistency checks
        if (currentStatus == WorkflowStatus.VotesTallied) {
            currentStatus = WorkflowStatus.RegisteringVoters;
        }
        require(
            currentStatus == WorkflowStatus.RegisteringVoters,
            unicode"You cannot register voters because you are not following the workflow order."
        );
        require(
            !voters[_address].isRegistered,
            unicode"You have already registered this voter."
        );

        //Voter Registration
        voters[_address].isRegistered = true;
        emit VoterRegistered(_address);
    }

    // *********** End of the registration of a white list of voters identified by their address ***********

    // *********** Start of proposal registration session ***********
    //The administrator starts a proposal registration session
    function proposalsRegistrationStarted() public onlyOwner {
        // Workflow consistency checks
        require(
            currentStatus == WorkflowStatus.RegisteringVoters,
            unicode"You can't save proposals because you don't respect the workflow order."
        );
        require(
            currentStatus != WorkflowStatus.ProposalsRegistrationStarted,
            unicode"You have already started the proposal registration session."
        );

        //Move to another step of the workflow
        currentStatus = WorkflowStatus.ProposalsRegistrationStarted;
        emit WorkflowStatusChange(
            WorkflowStatus.RegisteringVoters,
            WorkflowStatus.ProposalsRegistrationStarted
        );
    }

    //Proposal registration event
    event ProposalRegistered(uint256 proposalId);

    //Registered voters are allowed to register their proposals (several proposals possible per voter) (cf. "leurs")
    function putProposal(string memory _proposal) public {
        // Workflow and voter consistency checks
        require(
            currentStatus == WorkflowStatus.ProposalsRegistrationStarted,
            unicode"You cannot save proposals because the administrator has not started saving proposals."
        );
        require(
            voters[msg.sender].isRegistered == true,
            unicode"You must be registered to make a proposal."
        );

        //Registration of proposals
        proposals.push(Proposal({description: _proposal, voteCount: 0}));
        emit ProposalRegistered(proposals.length + 1);
    }

    //The voting administrator closes the proposal registration session.
    function proposalsRegistrationEnded() public onlyOwner {
        //Workflow consistency checks
        require(
            currentStatus == WorkflowStatus.ProposalsRegistrationStarted,
            unicode"You cannot complete the registration of proposals because you are not following the workflow order."
        );
        require(
            currentStatus != WorkflowStatus.ProposalsRegistrationEnded,
            unicode"You have already completed the proposal registration session."
        );

        //Move to another step of the workflow
        currentStatus = WorkflowStatus.ProposalsRegistrationEnded;
        emit WorkflowStatusChange(
            WorkflowStatus.ProposalsRegistrationStarted,
            WorkflowStatus.ProposalsRegistrationEnded
        );
    }

    // *********** End of proposal registration session ***********

    // *********** Voting session begins ***********
    //The administrator starts the voting session.
    function votingSessionStarted() public onlyOwner {
        // Workflow consistency checks
        require(
            currentStatus == WorkflowStatus.ProposalsRegistrationEnded,
            unicode"You cannot start the vote recording session because you are not following the workflow order."
        );
        require(
            currentStatus != WorkflowStatus.VotingSessionStarted,
            unicode"You have already started the vote recording session."
        );

        //Move to another step of the workflow
        currentStatus = WorkflowStatus.VotingSessionStarted;
        emit WorkflowStatusChange(
            WorkflowStatus.ProposalsRegistrationEnded,
            WorkflowStatus.VotingSessionStarted
        );
    }

    //Event of a voter voting for a proposal
    event Voted(address voter, uint256 proposalId);

    /*
    Registered voters vote for their preferred proposals.
    NB: a voter can vote only once.
    NB2 : at the compilation the remix editor indicates that the type payable must be put
    */
    function vote(uint256 _proposalID) public payable {
        // Workflow and current address consistency checks
        require(
            currentStatus == WorkflowStatus.VotingSessionStarted,
            unicode"You cannot vote because the recording of votes has not started."
        );
        require(
            voters[msg.sender].isRegistered,
            unicode"This voter is not allowed to vote because he is not registered."
        );
        require(
            (_proposalID) != 0,
            unicode"This proposal identifier does not exist."
        );
        require(
            (_proposalID) <= proposals.length,
            unicode"This proposal identifier does not exist."
        );
        require(
            !voters[msg.sender].hasVoted,
            unicode"This voter has already voted."
        );

        //Registration of votes
        voters[msg.sender].votedProposalId = _proposalID;
        voters[msg.sender].hasVoted = true;
        proposals[_proposalID - 1].voteCount += 1;

        //Trigger of the event voted
        emit Voted(msg.sender, msg.value);
    }

    //The administrator closes the voting session.
    function votingSessionEnded() public onlyOwner {
        // Workflow consistency checks
        require(
            currentStatus == WorkflowStatus.VotingSessionStarted,
            unicode"You cannot complete the voting session because you are not following the workflow order."
        );
        require(
            currentStatus != WorkflowStatus.VotingSessionEnded,
            unicode"You have already completed the vote recording session."
        );

        //Move to another step of the workflow
        currentStatus = WorkflowStatus.VotingSessionEnded;
        emit WorkflowStatusChange(
            WorkflowStatus.VotingSessionStarted,
            WorkflowStatus.VotingSessionEnded
        );
    }

    // *********** End of the voting session ***********

    // *********** Start of vote counting ***********
    //The administrator counts the votes.
    function findWinner() public onlyOwner {
        // Workflow consistency checks
        require(
            currentStatus == WorkflowStatus.VotingSessionEnded,
            unicode"You can't execute this function because you don't respect the workflow order."
        );

        //Use the variable winningProposalId to find the ID of the winning proposal
        uint256 tempVoteCount = 0;
        for (uint256 i = 0; i < proposals.length; i++) {
            if (proposals[i].voteCount > tempVoteCount) {
                tempVoteCount = proposals[i].voteCount;
                // +1 to the result to avoid the case of a vote with a proposal for the control in getWinner() => -1 in the getWinner() function
                winningProposalId = i + 1;
            }
        }
        currentStatus = WorkflowStatus.VotesTallied;
        emit WorkflowStatusChange(
            WorkflowStatus.VotingSessionEnded,
            WorkflowStatus.VotesTallied
        );
    }

    // *********** End of vote counting ***********

    // *********** Viewing the details of the winning proposal ***********
    //In the statement, it says that "TOUT le monde peut vérifier les détails de la proposition gagnante" (it does not say that only voters can check)
    function getWinner() public view returns (Proposal memory) {
        // Workflow consistency checks
        require(
            winningProposalId != 0,
            unicode"You cannot see the details of the winning proposal because there are none at this time."
        );

        return proposals[winningProposalId - 1];
    }
}
