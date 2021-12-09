const Ballot = artifacts.require("Ballot");

let instance;

beforeEach(async () => {
  const proposals = [
    "0x50726f706f73616c204100000000000000000000000000000000000000000000",
    "0x50726f706f73616c204200000000000000000000000000000000000000000000",
    "0x50726f706f73616c204300000000000000000000000000000000000000000000",
  ];
  instance = await Ballot.new(proposals);
});

contract("Ballot", (accounts) => {
  it("Should have proposals", async () => {
    const total = await instance.totalProposals();
    assert(total > 0);
  });

  it("Should vote when has right to vote", async () => {
    await instance.giveRightToVote(accounts[1]);
    const result = await instance.vote(0, { from: accounts[1] });
    assert(result.receipt.gasUsed > 0);
  });

  it("Should not be allowed to vote when already voted", async () => {
    await instance.giveRightToVote(accounts[1]);
    try {
      await instance.vote(0, { from: accounts[1] });
      await instance.vote(1, { from: accounts[1] });
    } catch (error) {
      return;
    }
    assert.fail();
  });

  it("Should not give right to vote if not owner of contract", async () => {
    try {
      await instance.giveRightToVote(accounts[1], { from: accounts[1] });
    } catch (error) {
      return;
    }
    assert.fail();
  });

  it("Should give to proposal one vote when voted", async () => {
    await instance.giveRightToVote(accounts[2]);
    await instance.vote(0, { from: accounts[2] });
    const proposal = await instance.proposals(0);
    assert(proposal["1"].words[0] == 1);
  });

  it("Should win the proposal most voted", async () => {
    await instance.giveRightToVote(accounts[3]);
    await instance.giveRightToVote(accounts[4]);
    await instance.giveRightToVote(accounts[5]);

    await instance.vote(1, { from: accounts[3] });
    await instance.vote(2, { from: accounts[4] });
    await instance.vote(2, { from: accounts[5] });

    const winner = await instance.winningProposal();
    assert(winner.words[0] == 2);
  });
});
