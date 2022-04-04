const Voting = artifacts.require("./Voting.sol");
const {BN, expectRevert, expectEvent} = require('@openzeppelin/test-helpers');
const {expect} = require('chai');

contract('TestVoting', accounts => {
    //Address used for test
    const owner = accounts[0];
    const address2 = accounts[1];
    const address6 = accounts[5];
    const address10 = accounts[9];
    const addresses = accounts;

    //let used for test
    let currentIdTest =0;
    let VotingInstance;

    /*Factorisation of expectRevert tests : 
        _unspecified : if the revert is unspecified or not
        _id : current test number
        _functionName : name of the function to test
        _description : end of message to be resent
        _valueArg : argument to pass to the function
        _valueAddress : the address that executes the function
        _requireMessage : type of the returned require to test
    */
    function factorisationRevert(_unspecified,_id,_functionName,_description,_valueArg,_valueAddress,_requireMessage) {
        currentIdTest++;
        //The console.log in commentary is there to check the return of the String of this function => remove the comments for the verifications
        
        //console.log("it(\"Test "+_id+" - The function "+_functionName+" "+_description+"\", async () => {await expectRevert"+((_unspecified!="")?("."+_unspecified):"")+"(VotingInstance."+_functionName+"("+((_valueArg!="")?(_valueArg+", "):"")+"{from:"+_valueAddress+"})"+((_requireMessage!="")?(", \""+_requireMessage+"\""):"")+")});");

        return ("it(\"Test "+_id+" - The function "+_functionName+" "+_description+"\", async () => {await expectRevert"+(
            (_unspecified!="")?
                ("."+_unspecified):
                ""
            )+"(VotingInstance."+_functionName+"("+(
                (_valueArg!="")?
                (_valueArg+", "):
                ""
            )+"{from:"+_valueAddress+"})"+((_requireMessage!="")?(", \""+_requireMessage+"\""):"")+")});");
    }


    //** BUG TEST BLOCKED GAME ** - THE GAME CAN BE BLOCKED WITHOUT REALLY PLAYING BECAUSE OF THE STARTPROPOSALSREGISTERING FUNCTION WHICH MAKES AN UNRELEVANT CHECK ON THE DEFAULT VALUE OF THE ENUM
    describe("### ** BUG TEST BLOCKED GAME **", function () {
        before(async function () {
            VotingInstance = await Voting.new({from:owner});
        });

        it("Test 0 - The game can be blocked without really playing because of the startProposalsRegistering function which makes an unrelevant check on the default value of the enum", async () => {
            await VotingInstance.startProposalsRegistering({from:owner});
            await VotingInstance.endProposalsRegistering({from:owner});
            await VotingInstance.startVotingSession({from:owner});
            await VotingInstance.endVotingSession({from:owner});
            await VotingInstance.tallyVotes({from:owner});

            await expectRevert(VotingInstance.addVoter(owner, {from:owner}), "Voters registration is not open yet");
        });
    });

    // I. SOME FUNCTIONS CAN ONLY BE CALLED BY THE ADMINISTRATOR (ONLYOWNER)
    describe("### I. TEST THAT SOME FUNCTIONS CAN ONLY BE CALLED BY THE ADMINISTRATOR (ONLYOWNER)", function () {
        before(async function () {
            VotingInstance = await Voting.new({from:owner});
        });

        //Array of the functions and thier param to be tested
        let testEnum = [
            ["addVoter","owner"],
            ["startProposalsRegistering",""],
            ["endProposalsRegistering",""],
            ["startVotingSession",""],
            ["endVotingSession",""],
            ["tallyVotes",""]
        ];

        /*
        Test 1 - The function addVoter can only be executed by the administrator (onlyOwner)
        Test 2 - The function startProposalsRegistering can only be executed by the administrator (onlyOwner)
        Test 3 - The function endProposalsRegistering can only be executed by the administrator (onlyOwner)
        Test 4 - The function startVotingSession can only be executed by the administrator (onlyOwner)
        Test 5 - The function endVotingSession can only be executed by the administrator (onlyOwner)
        Test 6 - The function tallyVotes can only be executed by the administrator (onlyOwner)
        */

        //If the second address cannot call the functions, this confirms the onlyOwner, it is possible to test all the accounts with addresses.length but the following tests do not bring a different confirmation
        for(let i=0;i<testEnum.length;i++)
        {
            eval(factorisationRevert("unspecified",currentIdTest+1,testEnum[i][0],"can only be executed by the administrator (onlyOwner)",testEnum[i][1],"address2",""));
        }
    });

    // II. THE LOGICAL SEQUENCE OF THE WORKFLOW WHICH MUST NOT ALLOW THE CALL OF A FUNCTION WITHOUT BEING REGISTERED AS A VOTER
    describe("### II. TEST THE LOGICAL SEQUENCE OF THE WORKFLOW WHICH MUST NOT ALLOW THE CALL OF A FUNCTION WITHOUT BEING REGISTERED AS A VOTER.", function () {
        before(async function () {
            VotingInstance = await Voting.new({from:owner});
        });

        //Array of the functions and thier param to be tested
        let testEnum = [
            ["getVoter","owner"],
            ["getOneProposal","0"],
            ["addProposal",""],
            ["setVote","0"],
        ];

        /*
        Test 7 - The function getVoter cannot be called because the logical sequence of the workflow does not allow it
        Test 8 - The function getOneProposal cannot be called because the logical sequence of the workflow does not allow it
        Test 9 - The function addProposal cannot be called because the logical sequence of the workflow does not allow it
        Test 10 - The function setVote cannot be called because the logical sequence of the workflow does not allow it
        */
        for(let i=0;i<testEnum.length;i++)
        {
            eval(factorisationRevert("",(currentIdTest+1),testEnum[i][0],"cannot be called because the logical sequence of the workflow does not allow it",testEnum[i][1],"owner","You're not a voter"));
        }
    });

    // III. THE WORKFLOW STATUS DOES NOT ALLOW TO CALL OTHER FUNCTIONS THAN ADDVOTER (WITHOUT THE POSSIBLE BLOCKING GAME SEQUENCE)
    describe("### III. TEST THAT THE WORKFLOW STATUS DOES NOT ALLOW TO CALL OTHER FUNCTIONS THAN ADDVOTER (WITHOUT THE POSSIBLE BLOCKING GAME SEQUENCE)", function () {
        before(async function () {
            VotingInstance = await Voting.new({from:owner});
        });

        //Array of the functions and thier type of revert to be tested
        let testEnum = [
            ["endProposalsRegistering","Registering proposals havent started yet"],
            ["startVotingSession","Registering proposals phase is not finished"],
            ["endVotingSession","Voting session havent started yet"],
            ["tallyVotes","Current status is not voting session ended"]
        ];

        /*
        Test 11 - The function endProposalsRegistering cannot be executed because the workflowstatus does not allow it
        Test 12 - The function startVotingSession cannot be executed because the workflowstatus does not allow it
        Test 13 - The function endVotingSession cannot be executed because the workflowstatus does not allow it
        Test 14 - The function tallyVotes cannot be executed because the workflowstatus does not allow it
        */
        for(let i=0;i<testEnum.length;i++)
        {
            eval(factorisationRevert("",(currentIdTest+1),testEnum[i][0],"cannot be executed because the workflowstatus does not allow it","","owner",testEnum[i][1]));
        }
    });

    // IV. VOTER REGISTRATION BY ADDRESS
    describe("### IV. TEST VOTER REGISTRATION BY ADDRESS", function () {
        before(async function () {
            VotingInstance = await Voting.new({from:owner});
        });

        it("Test 15 - Register the first 9 ganache addresses, register the 10th address and test the VoterRegistered event", async () => {
            //Register the first 9 ganache addresses
            for(let i=0;i<addresses.length-1;i++) {
                await VotingInstance.addVoter(addresses[i], {from:owner});
            }
            
            //Register the 10th address and test the VoterRegistered event
            let findEvent = await VotingInstance.addVoter(address10, {from:owner});
            expectEvent(findEvent,'VoterRegistered',{voterAddress:address10});
        });

        it("Test 16 - Test if the last address (the 10th) is registered and correctly initiated", async () => {
            let storeVoter10 = await VotingInstance.getVoter(address10);
            expect(storeVoter10.isRegistered).to.be.true;
            expect(storeVoter10.hasVoted).to.be.false;
            expect(storeVoter10.votedProposalId).to.be.bignumber.equal(new BN(0));
        });

        //Test 17 - The function addVoter does not allow to register the same address more than once (test on address 6)
        currentIdTest += 3;
        eval(factorisationRevert("",(currentIdTest),"addVoter","does not allow to register the same address more than once (test on address 6)","address6","owner","Already registered"));
    });


    // V. REGISTRATION SESSION FOR NEW PROPOSALS
    describe("### V. TEST OF THE REGISTRATION OF NEW PROPOSALS", function () {
        before(async function () {
            VotingInstance = await Voting.new({from:owner});

            //Regeneration of the previous status
            for(let i=0;i<addresses.length;i++) {
                await VotingInstance.addVoter(addresses[i], {from:owner});
            }
        });

        //Test 18 - The function addProposal cannot be executed by a registered voter (for this test : the address2) because the workflowstatus does not allow it
        eval(factorisationRevert("",(currentIdTest),"addProposal","cannot be executed by a registered voter (for this test : the address2) because the workflowstatus does not allow it","''","address2","Proposals are not allowed yet"));

        it("Test 19 - Workflow status change event to ProposalsRegistrationStarted", async () => {
            let findEvent = await VotingInstance.startProposalsRegistering({from:owner});
            expectEvent(findEvent,'WorkflowStatusChange',{previousStatus:new BN(0),newStatus:new BN(1)});
        });

        //Test 20 - The function getOneProposal cannot send a result because there was no proposal registered
        currentIdTest++;
        eval(factorisationRevert("unspecified",(currentIdTest),"getOneProposal","cannot send a result because there was no proposal registered","0","owner",""));

        it("Test 21 - Insert 9 proposals of the first 9 ganache addresses, and insert a tenth and test the ProposalRegistered event", async () => {
            //Register the first 9 proposals made by the first 9 ganache addresses
            for(let i=0;i<addresses.length-1;i++) {
                await VotingInstance.addProposal(`Proposition ${i+1} : tous les participants Alyra ont ${i+1} exercice${(i!=0)?"s":""} correct${(i!=0)?"s":""}`, {from:addresses[i]});
            }
            
            //Register the 10th address and test the VoterRegistered event
            let findEvent = await VotingInstance.addProposal(`Proposition 10 : tous les participants Alyra ont 10 exercices corrects`, {from:address10});
            expectEvent(findEvent,'ProposalRegistered',{proposalId:new BN(9)});
        });

        //Test 22 - The function addProposal cannot be executed because the address is not allowed to register a proposal
        currentIdTest++;
        eval(factorisationRevert("",(currentIdTest),"addProposal","cannot be executed because the address is not allowed to register a proposal","''","0x1000000000000000000000000000000000000001","You're not a voter"));

        //Test 23 - The function addProposal cannot be executed by a voter (for this test : the address6) because the proposal is empty
        eval(factorisationRevert("",(currentIdTest),"addProposal","cannot be executed by a voter (for this test : the address6) because the proposal is empty","","address6","Vous ne pouvez pas ne rien proposer"));

        it("Test 24 - Test that a voter (for this test : the address2) can verify that the description of proposition 10 is equal to 'Proposition 10 : tous les participants Alyra ont 10 exercices corrects'", async () => {
            let storedVote = await VotingInstance.getOneProposal(new BN(9),{from:address2});
            expect(storedVote.description).to.equal("Proposition 10 : tous les participants Alyra ont 10 exercices corrects");
        });

        it("Test 25 - Test that a voter (for this test : the address10) can verify that the description of proposition 1 is equal to 'Proposition 1 : tous les participants Alyra ont 1 exercice correct'", async () => {
            let storedVote = await VotingInstance.getOneProposal(new BN(0),{from:address10});
            expect(storedVote.description).to.equal("Proposition 1 : tous les participants Alyra ont 1 exercice correct");
        });

        it("Test 26 - Workflow status change event to ProposalsRegistrationEnded", async () => {
            let findEvent = await VotingInstance.endProposalsRegistering({from:owner});
            expectEvent(findEvent,'WorkflowStatusChange',{previousStatus:new BN(1),newStatus:new BN(2)});
        });

        //Test 27 - The function addProposal cannot be executed by a registered voter (for this test : the address2) because the workflowstatus does not allow it
        currentIdTest += 3;
        eval(factorisationRevert("",(currentIdTest),"addProposal","cannot be executed by a registered voter (for this test : the address2) because the workflowstatus does not allow it","''","address2","Proposals are not allowed yet"));

    });

    // VI. TEST THAT THE WORKFLOW STATUS DOES NOT ALLOW TO CALL OTHER FUNCTIONS THAN STARTVOTINGSESSION
    describe("### VI. TEST THAT THE WORKFLOW STATUS DOES NOT ALLOW TO CALL OTHER FUNCTIONS THAN STARTVOTINGSESSION", function () {
        before(async function () {
            VotingInstance = await Voting.new({from:owner});

            //Regeneration of the previous status
            for(let i=0;i<addresses.length;i++) {
                await VotingInstance.addVoter(addresses[i], {from:owner});
            }
            await VotingInstance.startProposalsRegistering({from:owner});
            for(let i=0;i<addresses.length;i++) {
                await VotingInstance.addProposal(`Proposition ${i+1} : tous les participants Alyra ont ${i+1} exercice${(i!=0)?"s":""} correct${(i!=0)?"s":""}`, {from:addresses[i]});
            }
            await VotingInstance.endProposalsRegistering({from:owner});
        });

        //Array of the functions, param, and thier type of revert to be tested
        let testEnum = [
            ["addVoter","owner","Voters registration is not open yet"],
            ["startProposalsRegistering","","Registering proposals cant be started now"],
            ["addProposal","","Proposals are not allowed yet"],
            ["endProposalsRegistering","","Registering proposals havent started yet"],
            ["setVote","0","Voting session havent started yet"],
            ["endVotingSession","","Voting session havent started yet"],
            ["tallyVotes","","Current status is not voting session ended"]
        ];

        /*
        Test 28 - The function addVoter cannot be executed because the workflowstatus does not allow it
        Test 29 - The function startProposalsRegistering cannot be executed because the workflowstatus does not allow it
        Test 30 - The function addProposal cannot be executed because the workflowstatus does not allow it
        Test 31 - The function endProposalsRegistering cannot be executed because the workflowstatus does not allow it
        Test 32 - The function setVote cannot be executed because the workflowstatus does not allow it
        Test 33 - The function endVotingSession cannot be executed because the workflowstatus does not allow it
        Test 34 - The function tallyVotes cannot be executed because the workflowstatus does not allow it
        */
        for(let i=0;i<testEnum.length;i++)
        {
            eval(factorisationRevert("",(currentIdTest),testEnum[i][0],"cannot be executed because the workflowstatus does not allow it",testEnum[i][1],"owner",testEnum[i][2]));
        }
    });

    //### ** BUG TEST THAT IT IS POSSIBLE TO HAVE A WINNING PROPOSAL WITHOUT RUNNING THE SETVOTE AND TALLYVOTES FUNCTIONS BECAUSE OF THE DEFAULT VALUE OF THE VARIABLES **
    describe("### ** BUG TEST THAT IT IS POSSIBLE TO HAVE A WINNING PROPOSAL WITHOUT RUNNING THE SETVOTE AND TALLYVOTES FUNCTIONS BECAUSE OF THE DEFAULT VALUE OF THE VARIABLES **", function () {
        before(async function () {
            VotingInstance = await Voting.new({from:owner});

            //Regeneration of the previous status
            for(let i=0;i<addresses.length;i++) {
                await VotingInstance.addVoter(addresses[i], {from:owner});
            }
            await VotingInstance.startProposalsRegistering({from:owner});
            for(let i=0;i<addresses.length;i++) {
                await VotingInstance.addProposal(`Proposition ${i+1} : tous les participants Alyra ont ${i+1} exercice${(i!=0)?"s":""} correct${(i!=0)?"s":""}`, {from:addresses[i]});
            }
        });

        it("Test 35 - The id of the winning proposal is not found/executed but it is possible to have a winning proposal", async () => {
            let WinningProposalID = await VotingInstance.winningProposalID.call({from: owner});
            expect(new BN(WinningProposalID)).to.be.bignumber.equal(new BN(0));

            let storedProposal = await VotingInstance.getOneProposal(new BN(WinningProposalID),{from:address2});
            expect(storedProposal.description).to.equal("Proposition 1 : tous les participants Alyra ont 1 exercice correct");
        });
    });

    // VII. REGISTRATION OF VOTES FOR PROPOSALS
    describe("### VII. TEST OF THE REGISTRATION OF VOTES FOR PROPOSALS", function () {
        before(async function () {
            VotingInstance = await Voting.new({from:owner});

            //Regeneration of the previous status
            for(let i=0;i<addresses.length;i++) {
                await VotingInstance.addVoter(addresses[i], {from:owner});
            }
            await VotingInstance.startProposalsRegistering({from:owner});
            for(let i=0;i<addresses.length;i++) {
                await VotingInstance.addProposal(`Proposition ${i+1} : tous les participants Alyra ont ${i+1} exercice${(i!=0)?"s":""} correct${(i!=0)?"s":""}`, {from:addresses[i]});
            }
            await VotingInstance.endProposalsRegistering({from:owner});
        });

        it("Test 36 - Workflow status change event to startVotingSession", async () => {
            let findEvent = await VotingInstance.startVotingSession({from:owner});
            expectEvent(findEvent,'WorkflowStatusChange',{previousStatus:new BN(2),newStatus:new BN(3)});
        });

        //Test 37 - The function setVote cannot be executed because the id of the proposal does not exist
        currentIdTest+=2;
        eval(factorisationRevert("",(currentIdTest),"setVote","cannot be executed because the id of the proposal does not exist","11","address6","Proposal not found"));

        it("Test 38 - Register the first 9 votes cast by the first 9 ganache addresses, with no votes for proposition 3, and with address 10 voting for proposition 8 (which will therefore have 2 votes), with the test of this last event", async () => {
            //Register the first 9 votes cast by the first 9 ganache addresses, with no votes for proposition 3
            for(let i=0;i<addresses.length-1;i++) {
                await VotingInstance.setVote(((i>1)?i+1:i), {from:addresses[i]});
            }
            
            //The address 10 voting for proposition 8 (which will therefore have 2 votes), with the test of this last event
            let findEvent = await VotingInstance.setVote(7, {from:address10});
            expectEvent(findEvent,'Voted',{voter:address10,proposalId:new BN(7)});
        });

        //Test 39 - The function setVote cannot be executed twice by the same address
        currentIdTest++;
        eval(factorisationRevert("",(currentIdTest),"setVote","cannot be executed twice by the same address",1,"address2","You have already voted"));

        it("Test 40 - Verification that the 3rd proposition has no vote, and that it corresponds to 'Proposition 3 : all Alyra participants have 3 correct exercises'", async () => {
            let storedProposal = await VotingInstance.getOneProposal(new BN(2),{from:address6});
            expect(storedProposal.description).to.equal("Proposition 3 : tous les participants Alyra ont 3 exercices corrects");
            expect(new BN(storedProposal.voteCount)).to.be.bignumber.equal(new BN(0));
        });

        it("Test 41 - With several addresses it is possible to verify that proposition 8 has 2 votes (made by address 7 and address 10), and that it corresponds to 'Proposition 8 : all Alyra participants have 8 correct exercises'", async () => {
            let storedProposal = await VotingInstance.getOneProposal(new BN(7),{from:address2});
            expect(storedProposal.description).to.equal("Proposition 8 : tous les participants Alyra ont 8 exercices corrects");
            expect(new BN(storedProposal.voteCount)).to.be.bignumber.equal(new BN(2));

            let storedVoter7 = await VotingInstance.getVoter(addresses[6],{from:address2});
            expect(storedVoter7.votedProposalId).to.be.bignumber.equal(new BN(7));

            let storedVoter10 = await VotingInstance.getVoter(address10,{from:address10});
            expect(storedVoter10.votedProposalId).to.be.bignumber.equal(new BN(7));
        });
    });

    //### ** ERROR TEST OF THE VOTE OF THE PROPOSAL WHICH DOES NOT EXIST AND WHICH IS NOT TREATED BY THE REVERT 'PROPOSAL NOT FOUND' **
    describe("### ** ERROR TEST OF THE VOTE OF THE PROPOSAL WHICH DOES NOT EXIST AND WHICH IS NOT TREATED BY THE REVERT 'PROPOSAL NOT FOUND' **", function () {
        before(async function () {
            VotingInstance = await Voting.new({from:owner});

            //Regeneration of the previous status
            for(let i=0;i<addresses.length;i++) {
                await VotingInstance.addVoter(addresses[i], {from:owner});
            }
            await VotingInstance.startProposalsRegistering({from:owner});
            for(let i=0;i<addresses.length;i++) {
                await VotingInstance.addProposal(`Proposition ${i+1} : tous les participants Alyra ont ${i+1} exercice${(i!=0)?"s":""} correct${(i!=0)?"s":""}`, {from:addresses[i]});
            }
            await VotingInstance.endProposalsRegistering({from:owner});
            await VotingInstance.startVotingSession({from:owner});
        });

        //Test 42 - The function setVote generate an error not handled by the 'Proposal not found' revert because it is possible to give in a proposal id longer than the length of the proposal table
        currentIdTest+=2;
        eval(factorisationRevert("unspecified",(currentIdTest),"setVote","generate an error not handled by the 'Proposal not found' revert because it is possible to give in a proposal id longer than the length of the proposal table","10","owner",""));
    });


    // VIII. COUNTING THE VOTES AND PUBLISHING THE WINNING PROPOSAL
    describe("### VIII. TESTS - COUNTING THE VOTES AND PUBLISHING THE WINNING PROPOSAL", function () {
        before(async function () {
            VotingInstance = await Voting.new({from:owner});

            //Regeneration of the previous status
            for(let i=0;i<addresses.length;i++) {
                await VotingInstance.addVoter(addresses[i], {from:owner});
            }
            await VotingInstance.startProposalsRegistering({from:owner});
            for(let i=0;i<addresses.length;i++) {
                await VotingInstance.addProposal(`Proposition ${i+1} : tous les participants Alyra ont ${i+1} exercice${(i!=0)?"s":""} correct${(i!=0)?"s":""}`, {from:addresses[i]});
            }
            await VotingInstance.endProposalsRegistering({from:owner});

            await VotingInstance.startVotingSession({from:owner});
            for(let i=0;i<addresses.length-1;i++) {
                await VotingInstance.setVote(((i>1)?i+1:i), {from:addresses[i]});
            }
            await VotingInstance.setVote(7, {from:address10});
        });

        //Test 43 - The function tallyVotes cannot be executed because the workflowstatus does not allow it
        eval(factorisationRevert("",(currentIdTest),"tallyVotes","cannot be executed because the workflowstatus does not allow it","","owner","Current status is not voting session ended"));

        it("Test 44 - Workflow status change event to endVotingSession", async () => {
            let findEvent = await VotingInstance.endVotingSession({from:owner});
            expectEvent(findEvent,'WorkflowStatusChange',{previousStatus:new BN(3),newStatus:new BN(4)});
        });

        it("Test 45 - The id of the winning proposal is not initiated (regardless of the bug tested before, the default value)", async () => {
            let WinningProposalID = await VotingInstance.winningProposalID.call({from: owner});
            expect(new BN(WinningProposalID)).to.be.bignumber.equal(new BN(0));
        });

        it("Test 46 - The search for the winning proposal was executed with the event", async () => {
            let findEvent = await VotingInstance.tallyVotes({from:owner});
            expectEvent(findEvent,'WorkflowStatusChange',{previousStatus:new BN(4),newStatus:new BN(5)});
        });

        it("Test 47 - The winning proposition corresponds to proposition 8 'Proposition 8 : tous les participants Alyra ont 8 exercices corrects', and did get two votes", async () => {
            let WinningProposalID = await VotingInstance.winningProposalID.call({from: owner});
            expect(new BN(WinningProposalID)).to.be.bignumber.equal(new BN(7));

            let storedProposal = await VotingInstance.getOneProposal(new BN(WinningProposalID),{from:address2});
            expect(storedProposal.description).to.equal("Proposition 8 : tous les participants Alyra ont 8 exercices corrects");
            expect(new BN(storedProposal.voteCount)).to.be.bignumber.equal(new BN(2));
        });
    });
});