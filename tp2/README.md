# ALYRA TEST VOTING

## UNIT TESTS

XX validated tests

All the functions of the contract are tested

1 file : TestVoting.js

### 1) TESTS - VOTER REGISTRATION BY ADDRESS

- nom de test 1
- nom de test 2

L'administrateur du vote enregistre une liste blanche d'électeurs identifiés par leur adresse Ethereum.
event VoterRegistered(address voterAddress);
event WorkflowStatusChange(WorkflowStatus previousStatus, WorkflowStatus newStatus);
L’administrateur est celui qui va déployer le smart contract.

### 2) TESTS - REGISTRATION SESSION FOR NEW PROPOSALS

- nom de test 1
- nom de test 2

L'administrateur du vote commence la session d'enregistrement de la proposition.
Les électeurs inscrits sont autorisés à enregistrer leurs propositions pendant que la session d'enregistrement est active.
event ProposalRegistered(uint proposalId);
L'administrateur de vote met fin à la session d'enregistrement des propositions.
event WorkflowStatusChange(WorkflowStatus previousStatus, WorkflowStatus newStatus);

### 3) TESTS - VOTING SESSION ON PROPOSALS

- nom de test 1
- nom de test 2

L'administrateur du vote commence la session de vote.
Les électeurs inscrits votent pour leur proposition préférée.
Le vote n'est pas secret et chaque électeur peut voir les votes des autres
event Voted (address voter, uint proposalId);
L'administrateur du vote met fin à la session de vote.
event WorkflowStatusChange(WorkflowStatus previousStatus, WorkflowStatus newStatus);

### 4) TESTS - COUNTING THE VOTES AND PUBLISHING THE WINNING PROPOSAL

- nom de test 1
- nom de test 2

L'administrateur du vote comptabilise les votes.
Tout le monde peut vérifier les derniers détails de la proposition gagnante.
Un uint winningProposalId représente l’id du gagnant
event WorkflowStatusChange(WorkflowStatus previousStatus, WorkflowStatus newStatus);
Le gagnant est déterminé à la majorité simple
La proposition qui obtient le plus de voix l'emporte
