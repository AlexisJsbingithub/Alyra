// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.8.12;

//Import de la librairie Ownable d'openzeppelin
import "@openzeppelin/contracts/access/Ownable.sol";

//L'administrateur est celui qui déploie le smart contrat
contract Voting is Ownable {
    //structure des électeurs
    struct Voter {
        bool isRegistered;
        bool hasVoted;
        uint256 votedProposalId;
    }

    //Association d'adresses de votants avec des structures Voter
    mapping(address => Voter) voters;

    //structure pour les propositions
    struct Proposal {
        string description;
        uint256 voteCount;
    }

    //Un tableau dynamic contenant les propositions des votants
    Proposal[] proposals;

    //Status du Workflow
    enum WorkflowStatus {
        RegisteringVoters,
        ProposalsRegistrationStarted,
        ProposalsRegistrationEnded,
        VotingSessionStarted,
        VotingSessionEnded,
        VotesTallied
    }

    //Variable globale du status du workflow, initialisé au status final pour éviter la par défaut à RegisteringVoters et bloquer l'appel
    WorkflowStatus public currentStatus = WorkflowStatus.VotesTallied;

    //ID de la proposition gagnante
    uint256 winningProposalId; //=0;

    //évènement d'un nouveau status de vote
    event WorkflowStatusChange(
        WorkflowStatus previousStatus,
        WorkflowStatus newStatus
    );

    // *********** Début de l'enregistrement d'une liste blanche d'électeurs identifiés par leur adresse ***********
    //Evènement de l'enregistrement de l'adresse d'un votant
    event VoterRegistered(address voterAddress);

    //Enregistrement d'une liste blanche d'électeurs
    function addVoter(address _address) public onlyOwner {
        // Contrôles de cohérence du workflow et des électeurs
        if (currentStatus == WorkflowStatus.VotesTallied) {
            currentStatus = WorkflowStatus.RegisteringVoters;
        }
        require(
            currentStatus == WorkflowStatus.RegisteringVoters,
            unicode"Vous ne pouvez pas enregistrer des électeurs car vous ne respectez pas l'ordre du workflow."
        );
        require(
            !voters[_address].isRegistered,
            unicode"Vous avez déjà enregistré cet électeur."
        );

        //Enregistrement des électeurs
        voters[_address].isRegistered = true;
        emit VoterRegistered(_address);
    }

    // *********** Fin de l'enregistrement d'une liste blanche d'électeurs identifiés par leur adresse ***********

    // *********** Début de la session d'enregistrement des propositions ***********
    //L'administrateur commence une session d'enregistrement des propositions
    function proposalsRegistrationStarted() public onlyOwner {
        // Contrôles de cohérence du workflow
        require(
            currentStatus == WorkflowStatus.RegisteringVoters,
            unicode"Vous ne pouvez pas enregistrer des propositions car vous ne respectez pas l'ordre du workflow."
        );
        require(
            currentStatus != WorkflowStatus.ProposalsRegistrationStarted,
            unicode"Vous avez déjà débuté la session d'enregistrement des propositions."
        );

        //Passage à une autre étape du workflow
        currentStatus = WorkflowStatus.ProposalsRegistrationStarted;
        emit WorkflowStatusChange(
            WorkflowStatus.RegisteringVoters,
            WorkflowStatus.ProposalsRegistrationStarted
        );
    }

    //Evènement de l'enregistrement d'une proposition
    event ProposalRegistered(uint256 proposalId);

    //Les électeurs inscrits sont autorisés à enregistrer leurs propositions (plusieurs propositions possibles par électeurs (cf. "leurs")
    function putProposal(string memory _proposal) public {
        // Contrôles de cohérence du workflow et des électeurs
        require(
            currentStatus == WorkflowStatus.ProposalsRegistrationStarted,
            unicode"Vous ne pouvez pas enregistrer des propositions car l'administrateur n'a pas débuté l'enregistrement des propositions."
        );
        require(
            voters[msg.sender].isRegistered == true,
            unicode"Vous devez être enregistré pour faire une proposition."
        );

        //Enregistrement des propositions
        proposals.push(Proposal({description: _proposal, voteCount: 0}));
        emit ProposalRegistered(proposals.length + 1);
    }

    //L'administrateur de vote met fin à la session d'enregistrement des propositions.
    function proposalsRegistrationEnded() public onlyOwner {
        // Contrôles de cohérence du workflow
        require(
            currentStatus == WorkflowStatus.ProposalsRegistrationStarted,
            unicode"Vous ne pouvez pas terminer l'enregistrement des propositions car vous ne respectez pas l'ordre du workflow."
        );
        require(
            currentStatus != WorkflowStatus.ProposalsRegistrationEnded,
            unicode"Vous avez déjà terminé la session d'enregistrement des propositions."
        );

        //Passage à une autre étape du workflow
        currentStatus = WorkflowStatus.ProposalsRegistrationEnded;
        emit WorkflowStatusChange(
            WorkflowStatus.ProposalsRegistrationStarted,
            WorkflowStatus.ProposalsRegistrationEnded
        );
    }

    // *********** Fin de la session d'enregistrement des propositions ***********

    // *********** Début de la session de vote ***********
    //L'administrateur commence la session de vote.
    function votingSessionStarted() public onlyOwner {
        // Contrôles de cohérence du workflow
        require(
            currentStatus == WorkflowStatus.ProposalsRegistrationEnded,
            unicode"Vous ne pouvez pas débuter la session d'enregistrement des votes car vous ne respectez pas l'ordre du workflow."
        );
        require(
            currentStatus != WorkflowStatus.VotingSessionStarted,
            unicode"Vous avez déjà débuté la session d'enregistrement des votes."
        );

        //Passage à une autre étape du workflow
        currentStatus = WorkflowStatus.VotingSessionStarted;
        emit WorkflowStatusChange(
            WorkflowStatus.ProposalsRegistrationEnded,
            WorkflowStatus.VotingSessionStarted
        );
    }

    //Evènement d'un votant qui vote pour une proposition
    event Voted(address voter, uint256 proposalId);

    /*
    Les électeurs inscrits votent pour leurs propositions préférées. 
    NB : un électeur ne peut voter qu'une seule fois. 
    NB2 : à la compilation l'éditeur remix indique qu'il faut mettre le type payable
    */
    function vote(uint256 _proposalID) public payable {
        // Contrôles de cohérence du workflow et de l'adresse courante
        require(
            currentStatus == WorkflowStatus.VotingSessionStarted,
            unicode"Vous ne pouvez pas voter car l'enregistrement des votes n'a pas débuté."
        );
        //Voter memory sender = voters[msg.sender];
        require(
            voters[msg.sender].isRegistered,
            unicode"Cet electeur n'a pas le droit de voter car il n'est pas enregistré."
        );
        require(
            (_proposalID) != 0,
            unicode"Cet identifiant de proposition n'existe pas."
        );
        require(
            (_proposalID) <= proposals.length,
            unicode"Cet identifiant de proposition n'existe pas."
        );
        require(
            !voters[msg.sender].hasVoted,
            unicode"Cet électeur a déjà vote."
        );

        //Enregistrement des votes
        voters[msg.sender].votedProposalId = _proposalID;
        voters[msg.sender].hasVoted = true;
        proposals[_proposalID - 1].voteCount += 1;

        //Trigger de l'évènement a voté
        emit Voted(msg.sender, msg.value);
    }

    //L'administrateur met fin à la session de vote.
    function votingSessionEnded() public onlyOwner {
        // Contrôles de cohérence du workflow
        require(
            currentStatus == WorkflowStatus.VotingSessionStarted,
            unicode"Vous ne pouvez pas terminer la session de vote car vous ne respectez pas l'ordre du workflow."
        );
        require(
            currentStatus != WorkflowStatus.VotingSessionEnded,
            unicode"Vous avez déjà terminé la session d'enregistrement des votes."
        );

        //Passage à une autre étape du workflow
        currentStatus = WorkflowStatus.VotingSessionEnded;
        emit WorkflowStatusChange(
            WorkflowStatus.VotingSessionStarted,
            WorkflowStatus.VotingSessionEnded
        );
    }

    // *********** Fin de la session de vote ***********

    // *********** Début du comptage des votes ***********
    //L'administrateur comptabilise les votes.
    function findWinner() public onlyOwner {
        // Contrôles de cohérence du workflow
        require(
            currentStatus == WorkflowStatus.VotingSessionEnded,
            unicode"Vous ne pouvez pas exécuter cette fonction car vous ne respectez pas l'ordre du workflow."
        );

        //Utiliser la variable winningProposalId pour trouver l'ID de la proposition gagnante
        uint256 tempVoteCount = 0;
        for (uint256 i = 0; i < proposals.length; i++) {
            if (proposals[i].voteCount > tempVoteCount) {
                tempVoteCount = proposals[i].voteCount;
                // +1 au résultat pour éviter le cas d'un vote avec une proposition pour le ccontrôle dans getWinner(). -1 dans la fonction getWinner()
                winningProposalId = i + 1;
            }
        }
        currentStatus = WorkflowStatus.VotesTallied;
        emit WorkflowStatusChange(
            WorkflowStatus.VotingSessionEnded,
            WorkflowStatus.VotesTallied
        );
    }

    // *********** Fin du comptage des votes ***********

    // *********** Affichage des détails de la proposition gagante ***********
    //Dans l'énnoncé, il est indiqué que TOUT le monde peut vérifier les détails de la proposition gagnante (il n'est pas indiqué que seul les votants peuvent vérifier)
    function getWinner() public view returns (Proposal memory) {
        // Contrôles de cohérence du workflow
        require(
            winningProposalId != 0,
            unicode"Vous ne pouvez pas voir les détails de la proposition gagnante car il n'y en a pas pour le moment."
        );

        return proposals[winningProposalId - 1];
    }
}
